'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AddressPicker from '../../components/AddressPicker'
import YandexMap from '../../components/YandexMap'
import { supabase } from '../../lib/supabaseClient'

const MOSCOW: [number, number] = [55.751244, 37.618423]
const YA_KEY = process.env.NEXT_PUBLIC_YANDEX_API_KEY || ''

async function reverseGeocode(lat: number, lng: number) {
  // 1) Яндекс
  try {
    if (YA_KEY) {
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YA_KEY}&format=json&geocode=${lng},${lat}&lang=ru_RU`
      const j = await fetch(url).then(r => r.json())
      const full = j?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.text
      if (full) return full as string
    }
  } catch {}
  // 2) OSM
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ru`
    const j = await fetch(url, { headers: { 'User-Agent': 'Nadoo/1.0 (nadoo.ru)' } }).then(r => r.json())
    return j?.display_name || ''
  } catch {}
  return ''
}

const CATEGORIES = ['Электроника','Инструменты','Спорт и досуг','Фото/видео','Для дома','Прочее']
const TYPES = ['Аренда','Услуга']

export default function PostItemPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<string>('')
  const [deposit, setDeposit] = useState<string>('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [kind, setKind] = useState(TYPES[0])

  const [address, setAddress] = useState('')
  const [point, setPoint] = useState<{ lat: number; lng: number }>({ lat: MOSCOW[0], lng: MOSCOW[1] })

  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const canSave = title.trim() && price.trim() && address.trim()

  // при первом рендере — получить адрес стартовой метки
  useEffect(() => { (async () => {
    const full = await reverseGeocode(point.lat, point.lng)
    if (full) setAddress(full)
  })() }, [])

  // клики/перетаскивания на карте
  const movePoint = useCallback(async (coords: [number, number]) => {
    const [lat, lng] = coords
    setPoint({ lat, lng })
    const full = await reverseGeocode(lat, lng)
    if (full) setAddress(full)
  }, [])

  // загрузка в Storage
  const uploadAll = useCallback(async (uid: string) => {
    if (!files.length) return []
    const out: string[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const path = `items/${uid}/${Date.now()}-${i}-${f.name}`
      const { error } = await supabase.storage.from('public').upload(path, f, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('public').getPublicUrl(path)
      out.push(data.publicUrl)
    }
    return out
  }, [files])

  const onSubmit = useCallback(async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      const uid = auth.user?.id
      if (!uid) { alert('Войдите в аккаунт, чтобы разместить объявление.'); setSaving(false); return }

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
        images
      })
      if (error) throw error

      // готово → на главную (карта подгрузит метку из БД)
      router.push('/')
    } catch (e: any) {
      console.error(e)
      alert('Не удалось сохранить объявление: ' + (e?.message || 'ошибка'))
    } finally {
      setSaving(false)
    }
  }, [canSave, saving, title, description, price, deposit, category, kind, address, point, uploadAll, router])

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sel = Array.from(e.target.files ?? []).slice(0, 10)
    setFiles(sel)
  }

  const preview = useMemo(() => files.map((f, i) => ({
    name: f.name, url: URL.createObjectURL(f), type: f.type
  })), [files])

  return (
    <section className="container pb-20 pt-10">
      <h1 className="mb-6 text-2xl font-semibold">Сдать в аренду</h1>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_520px]">
        {/* Форма */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Название *</label>
            <input className="w-full rounded border px-3 py-2" value={title} onChange={(e)=>setTitle(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Описание</label>
            <textarea className="w-full rounded border px-3 py-2 min-h-[90px]" value={description} onChange={(e)=>setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Категория</label>
              <select className="w-full rounded border px-3 py-2" value={category} onChange={(e)=>setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Тип</label>
              <select className="w-full rounded border px-3 py-2" value={kind} onChange={(e)=>setKind(e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Цена/сутки (₽) *</label>
              <input className="w-full rounded border px-3 py-2" inputMode="numeric" value={price} onChange={(e)=>setPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Залог (опц.)</label>
              <input className="w-full rounded border px-3 py-2" inputMode="numeric" value={deposit} onChange={(e)=>setDeposit(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Адрес *</label>
            <AddressPicker
              value={address}
              onChange={setAddress}
              onPick={(r)=>{ setAddress(r.full || r.address); setPoint({ lat: r.lat, lng: r.lng }) }}
              placeholder="Начните вводить адрес…"
            />
            <p className="text-xs text-neutral-500">Выберите из подсказок или кликните по карте/перетащите метку — адрес обновится.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Фото/видео (до 10 файлов)</label>
            <input type="file" multiple accept="image/*,video/*" onChange={handleFiles} />
            {preview.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {preview.map((p,i)=>(
                  <div key={i} className="overflow-hidden rounded border">
                    {p.type.startsWith('video/')
                      ? <video src={p.url} className="w-full h-28 object-cover" controls />
                      : <img src={p.url} className="w-full h-28 object-cover" alt={p.name} />
                    }
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onSubmit}
            disabled={!canSave || saving}
            className={`rounded px-4 py-2 text-white ${canSave && !saving ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
          >
            {saving ? 'Сохраняем…' : 'Сохранить объявление'}
          </button>
        </div>

        {/* Карта */}
        <div>
          <YandexMap
            center={[point.lat, point.lng]}
            markers={[{ id: 'm', lat: point.lat, lng: point.lng, title: address }]}
            draggableMarker
            onClick={movePoint}
            markerOptions={{ preset: 'islands#dotIcon', iconColor: '#22C55E' }}
            height={420}
          />
        </div>
      </div>
    </section>
  )
}
