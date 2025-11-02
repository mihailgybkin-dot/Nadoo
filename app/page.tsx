'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import YandexMap from '../components/YandexMap'
import { supabase } from '../lib/supabaseClient'

type Item = {
  id: string
  title: string
  price: number | null
  address: string | null
  images: string[] | null
  lat: number | null
  lng: number | null
  category: string | null
}

const MOSCOW: [number, number] = [55.751244, 37.618423]

function bboxFromCenter([lat, lng]: [number, number], radiusMeters: number) {
  const dLat = radiusMeters / 111320
  const dLng = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))
  return { minLat: lat - dLat, maxLat: lat + dLat, minLng: lng - dLng, maxLng: lng + dLng }
}

export default function HomePage() {
  const [center, setCenter] = useState<[number, number]>(MOSCOW)
  const [items, setItems] = useState<Item[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [radius, setRadius] = useState(200) // 200м по требованию

  const fetchAround = useCallback(async (c: [number, number]) => {
    // сначала 200м, если пусто — 1000м, потом 5000м
    const radii = [200, 1000, 5000]
    for (const r of radii) {
      const { minLat, maxLat, minLng, maxLng } = bboxFromCenter(c, r)
      const { data } = await supabase
        .from('items')
        .select('id,title,price,address,images,lat,lng,category')
        .gte('lat', minLat).lte('lat', maxLat)
        .gte('lng', minLng).lte('lng', maxLng)
        .order('created_at', { ascending: false })
        .limit(12)
      if (data && data.length) {
        setItems(data as any)
        setRadius(r)
        break
      }
      if (r === radii[radii.length - 1]) { setItems([]); setRadius(r) }
    }

    // задачи (если в таблице tasks есть lat/lng — аналогично; иначе просто последние)
    const { data: t } = await supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(8)
    setTasks(t || [])
  }, [])

  useEffect(()=>{ fetchAround(center) }, [center, fetchAround])

  const markers = useMemo(()=> (items
    .filter(i=>i.lat && i.lng)
    .map(i=>({ id: i.id, lat: i.lat as number, lng: i.lng as number, title: i.title }))), [items])

  return (
    <section className="container pb-20 pt-10">
      <h1 className="mb-6 text-3xl font-semibold text-center">Nadoo</h1>
      <p className="mb-6 text-center text-neutral-600">Сервис аренды вещей и заданий рядом с вами</p>

      <div className="mx-auto max-w-5xl">
        <YandexMap
          center={center}
          markers={markers}
          onBoundsChange={(_, c)=> setCenter(c)}
          height={360}
        />
      </div>

      <div className="mx-auto mt-8 max-w-5xl">
        <h2 className="mb-3 text-xl font-semibold">Топ аренды в радиусе ~{radius} м</h2>
        {items.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {items.map(i=>(
              <div key={i.id} className="rounded-xl border p-3 hover:shadow">
                <div className="mb-2 h-40 overflow-hidden rounded">
                  {i.images?.[0]
                    ? <img src={i.images[0]} alt={i.title} className="h-40 w-full object-cover" />
                    : <div className="flex h-40 items-center justify-center bg-neutral-100 text-neutral-400">нет фото</div>}
                </div>
                <div className="truncate font-medium">{i.title}</div>
                {i.price != null && <div className="text-sm text-neutral-600">{i.price} ₽/сутки</div>}
                {i.address && <div className="mt-1 line-clamp-2 text-xs text-neutral-500">{i.address}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border p-6 text-neutral-500">Пока пусто. Расширяем радиус…</div>
        )}

        <h2 className="mt-10 mb-3 text-xl font-semibold">Топ заданий рядом</h2>
        {tasks.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tasks.map(t=>(
              <div key={t.id} className="rounded-xl border p-3 hover:shadow">
                <div className="font-medium">{t.title || 'Задание'}</div>
                {t.description && <div className="mt-1 line-clamp-3 text-sm text-neutral-600">{t.description}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border p-6 text-neutral-500">Пока нет заданий рядом.</div>
        )}
      </div>

      {/* Доп. блоки, чтобы страница не была пустой */}
      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-5">
          <div className="mb-2 text-lg font-semibold">Безопасные сделки</div>
          <div className="text-sm text-neutral-600">Прозрачные условия, чат и защита платежей.</div>
        </div>
        <div className="rounded-2xl border p-5">
          <div className="mb-2 text-lg font-semibold">Рядом с вами</div>
          <div className="text-sm text-neutral-600">Фильтрация по радиусу от вашей точки на карте.</div>
        </div>
        <div className="rounded-2xl border p-5">
          <div className="mb-2 text-lg font-semibold">Фото и видео</div>
          <div className="text-sm text-neutral-600">Добавляйте до 10 файлов к объявлениям.</div>
        </div>
      </div>
    </section>
  )
}
