'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import AddressPicker from '../../components/AddressPicker'
import YandexMap from '../../components/YandexMap'

const MOSCOW: [number, number] = [55.751244, 37.618423]
const YA_KEY = process.env.NEXT_PUBLIC_YANDEX_API_KEY || ''
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'nadoo-files'

/** Строка -> число (500 или "500,0" -> 500) */
const toNum = (v: string) => {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/** Обратный геокод (сначала Яндекс, потом OSM) */
async function reverseGeocode(lat: number, lng: number) {
  try {
    if (YA_KEY) {
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YA_KEY}&format=json&geocode=${lng},${lat}&lang=ru_RU`
      const j = await fetch(url).then(r => r.json())
      const full =
        j?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.text
      if (full) return String(full)
    }
  } catch {}
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ru`
    const j = await fetch(url, { headers: { 'User-Agent': 'Nadoo/1.0 (nadoo.ru)' } }).then(r => r.json())
    if (j?.display_name) return String(j.display_name)
  } catch {}
  return ''
}

const TASK_CATEGORIES = [
  'Курьер/Доставка',
  'Ремонт/Дом',
  'IT/Дизайн',
  'Фото/Видео',
  'Мероприятия',
  'Другое',
]

async function ensureProfile(uid: string) {
  // создаст запись, если её нет (на случай FK items/tasks.owner -> profiles.id)
  await supabase.from('profiles').upsert({ id: uid }, { onConflict: 'id' })
}

export default function PostTaskPage() {
  const router = useRouter()

  // 1) если не авторизован — сразу на /login
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) router.replace('/login?next=/post-task')
    })()
  }, [router])

  // 2) поля формы
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(TASK_CATEGORIES[0])
  const [budget, setBudget] = useState<string>('') // бюджет за всё задание
  const [due, setDue] = useState<string>('') // срок (дата/время)
  const [remote, setRemote] = useState(false)

  // адрес + точка (если задание не удалённое)
  const [address, setAddress] = useState('')
  const [point, setPoint] = useState<{ lat: number; lng: number }>({ lat: MOSCOW[0], lng: MOSCOW[1] })

  // медиа
  const [files, setFiles] = useState<File[]>([])
  const preview = useMemo(
    () => files.map((f) => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) })),
    [files]
  )

  const [saving, setSaving] = useState(false)
  const canSave =
    title.trim().length > 0 &&
    (remote || address.trim().length > 0) &&
    budget.trim().length > 0

  // подтягиваем адрес стартовой метки
  useEffect(() => {
    if (remote) return
    ;(async () => {
      const full = await reverseGeocode(point.lat, point.lng)
      if (full) setAddress(full)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remote])

  const movePoint = useCallback(async (coords: [number, number]) => {
    if (remote) return
    const [lat, lng] = coords
    setPoint({ lat, lng })
    const full = await reverseGeocode(lat, lng)
    if (full) setAddress(full)
  }, [remote])

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sel = Array.from(e.target.files ?? []).slice(0, 10)
    setFiles(sel)
  }

  const uploadAll = useCallback(async (uid: string) => {
    if (!files.length) return [] as string[]
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const path = `tasks/${uid}/${Date.now()}-${i}-${f.name}`
      const up = await supabase.storage.from(BUCKET).upload(path, f, { upsert: true })
      if (up.error) throw up.error
      const pub = supabase.storage.from(BUCKET).getPublicUrl(path)
      urls.push(pub.data.publicUrl)
    }
    return urls
  }, [files])

  const onSubmit = useCallback(async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      const uid = auth.user?.id
      if (!uid) {
        router.replace('/login?next=/post-task')
        return
      }

      await ensureProfile(uid)
      const images = await uploadAll(uid)

      const payload: Record<string, any> = {
        owner: uid,
        title,
        description,
        category,
        budget: toNum(budget),   // если в БД другое имя — см. SQL ниже
        remote,
        due_at: due ? new Date(due).toISOString() : null,
        images,
      }

      if (!remote) {
        payload.address = address
        payload.lat = point.lat
        payload.lng = point.lng
      }

      const { error } = await supabase.from('tasks').insert(payload)
      if (error) throw error

      router.push('/') // успех → на главную
    } catch (e: any) {
      alert('Не удалось создать задание: ' + (e?.message || 'ошибка'))
      console.error(e)
    } finally {
      setSaving(false)
    }
  }, [canSave, saving, router, title, description, category, budget, remote, due, address, point, uploadAll])

  return (
    <section className="container pb-20 pt-10">
      <h1 className="mb-6 text-2xl font-semibold">Разместить задание</h1>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_520px]">
        {/* Левая колонка — форма */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Заголовок *</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Забрать посылку с ПВЗ и привезти домой"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Описание</label>
            <textarea
              className="min-h-[90px] w-full rounded border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробности задачи, время, требования…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Категория</label>
              <select
                className="w-full rounded border px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Срок (дата/время)</label>
              <input
                type="datetime-local"
                className="w-full rounded border px-3 py-2"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Бюджет (₽) *</label>
              <input
                className="w-full rounded border px-3 py-2"
                inputMode="numeric"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="flex items-end gap-2">
              <input
                id="remote"
                type="checkbox"
                className="h-5 w-5"
                checked={remote}
                onChange={(e) => setRemote(e.target.checked)}
              />
              <label htmlFor="remote" className="text-sm">Удалённое задание (без адреса)</label>
            </div>
          </div>

          {!remote && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Адрес *</label>
              <AddressPicker
                value={address}
                onChange={setAddress}
                onPick={(r) => {
                  setAddress(r.full || r.address)
                  setPoint({ lat: r.lat, lng: r.lng })
                }}
                placeholder="Начните вводить адрес…"
              />
              <p className="text-xs text-neutral-500">
                Можно выбрать из подсказок или кликнуть по карте/перетащить метку — адрес обновится.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Файлы (до 10 фото/видео)</label>
            <input type="file" multiple accept="image/*,video/*" onChange={handleFiles} />
            {preview.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {preview.map((p, i) => (
                  <div key={i} className="overflow-hidden rounded border">
                    {p.type.startsWith('video/') ? (
                      <video src={p.url} className="h-28 w-full object-cover" controls />
                    ) : (
                      <img src={p.url} className="h-28 w-full object-cover" alt={p.name} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onSubmit}
            disabled={!canSave || saving}
            className={`rounded px-4 py-2 text-white ${
              canSave && !saving ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
            }`}
          >
            {saving ? 'Сохраняем…' : 'Создать задание'}
          </button>
        </div>

        {/* Правая колонка — карта (прячем, если remote) */}
        <div>
          {!remote ? (
            <YandexMap
              center={[point.lat, point.lng]}
              markers={[{ id: 'm', lat: point.lat, lng: point.lng, title: address }]}
              draggableMarker
              onClick={movePoint}
              markerOptions={{ preset: 'islands#dotIcon', iconColor: '#22C55E' }}
              height={420}
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded border text-sm text-neutral-500">
              Адрес не требуется (удалённая задача)
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
