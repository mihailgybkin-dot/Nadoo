'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import AddressPicker from '../../components/AddressPicker'
import YandexMap from '../../components/YandexMap'

/** === НАСТРОЙКИ === */
const MOSCOW: [number, number] = [55.751244, 37.618423]
const YA_KEY = process.env.NEXT_PUBLIC_YANDEX_API_KEY || ''
/** Имя бакета для файлов: задайте в Vercel → NEXT_PUBLIC_SUPABASE_BUCKET */
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'nadoo-files'

/** Обратный геокод: сначала Яндекс, затем OSM (фолбэк) */
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

const CATEGORIES = ['Электроника', 'Инструменты', 'Спорт и досуг', 'Фото/видео', 'Для дома', 'Прочее']
const TYPES = ['Аренда', 'Услуга']

export default function PostItemPage() {
  const router = useRouter()

  /** 1) Гейт: если не залогинен — сразу на /login */
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) router.replace('/login?next=/post-item')
    })()
  }, [router])

  /** 2) Поля формы */
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<string>('')
  const [deposit, setDeposit] = useState<string>('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [kind, setKind] = useState(TYPES[0])

  /** 3) Адрес и точка */
  const [address, setAddress] = useState('')
  const [point, setPoint] = useState<{ lat: number; lng: number }>({ lat: MOSCOW[0], lng: MOSCOW[1] })

  /** 4) Медиафайлы */
  const [files, setFiles] = useState<File[]>([])
  const preview = useMemo(
    () => files.map((f) => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) })),
    [files]
  )

  const [saving, setSaving] = useState(false)
  const canSave = title.trim() && price.trim() && address.trim()

  /** Подтянуть адрес стартовой метки */
  useEffect(() => {
    ;(async () => {
      const full = await reverseGeocode(point.lat, point.lng)
      if (full) setAddress(full)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Перемещение метки/клик по карте */
  const movePoint = useCallback(async (coords: [number, number]) => {
    const [lat, lng] = coords
    setPoint({ lat, lng })
    const full = await reverseGeocode(lat, lng)
    if (full) setAddress(full)
  }, [])

  /** Загрузка всех файлов в Supabase Storage (BUCKET) */
  const uploadAll = useCallback(
    async (uid: string) => {
      if (!files.length) return [] as string[]
      const urls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        const path = `items/${uid}/${Date.now()}-${i}-${f.name}`
        const up = await supabase.storage.from(BUCKET).upload(path, f, { upsert: true })
        if (up.error) throw up.error
        const pub = supabase.storage.from(BUCKET).getPublicUrl(path)
        urls.push(pub.data.publicUrl)
      }
      return urls
    },
    [files]
  )

  /** Сохранение объявления */
  const onSubmit = useCallback(async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      const uid = auth.user?.id
      if (!uid) {
        router.replace('/login?next=/post-item')
        return
      }

      const images = await uploadAll(uid)

      const { error } = await supabase.from('items').insert({
        owner: uid,
        title,
        description,
        price: Number(price) || null,
        deposit: Number(deposit) || null,
        category,
        kind,
        address,
        lat: point.lat,
        lng: point.lng,
        images, // text[] в БД
      })
      if (error) throw error

      router.push('/') // успех → на главную
    } catch (e: any) {
      alert('Не удалось сохранить объявление: ' + (e?.message || 'ошибка'))
      console.error(e)
    } finally {
      setSaving(false)
    }
  }, [canSave, saving, router, uploadAll, title, description, price, deposit, category, kind, address, point])

  /** Выбор файлов */
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sel = Array.from(e.target.files ?? []).slice(0, 10)
    setFiles(sel)
  }

  return (
    <section className="container pb-20 pt-10">
      <h1 className="mb-6 text-2xl font-semibold">Сдать в аренду</h1>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_520px]">
        {/* Левая колонка — форма */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Название *</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Дрель Makita"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Описание</label>
            <textarea
              className="min-h-[90px] w-full rounded border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Пара слов о состоянии и комплектации"
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
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Тип</label>
              <select className="w-full rounded border px-3 py-2" value={kind} onChange={(e) => setKind(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Цена/сутки (₽) *</label>
              <input
                className="w-full rounded border px-3 py-2"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="500"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Залог (опц.)</label>
              <input
                className="w-full rounded border px-3 py-2"
                inputMode="numeric"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium">Фото/видео (до 10 файлов)</label>
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
            {saving ? 'Сохраняем…' : 'Сохранить объявление'}
          </button>
        </div>

        {/* Правая колонка — карта */}
        <div>
          <YandexMap
            center={[point.lat, point.lng]}
            markers={[{ id: 'm', lat: point.lat, lng: point.lng, title: address }]}
            draggableMarker
            onClick={movePoint}
            markerOptions={{ preset: 'islands#dotIcon', iconColor: '#22C55E' }} // ярко-зелёная метка
            height={420}
          />
        </div>
      </div>
    </section>
  )
}
