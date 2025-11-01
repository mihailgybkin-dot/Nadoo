'use client'
import { useEffect, useMemo, useState } from 'react'
import YandexMap from '../components/YandexMap'
import { supabase } from '../integrations/supabase/client'
import Link from 'next/link'

type Marker = { id: string; lat: number; lng: number; title?: string }

function sqDist(a: [number, number], b: [number, number]) {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return dx * dx + dy * dy
}

export default function HomePage() {
  const [markers, setMarkers] = useState<Marker[]>([])
  const [bounds, setBounds] = useState<number[][] | null>(null)
  const [center, setCenter] = useState<[number, number]>([55.751244, 37.618423])

  const whereBounds = useMemo(() => {
    if (!bounds) return null
    const [[swLat, swLng], [neLat, neLng]] = bounds
    return { swLat, swLng, neLat, neLng }
  }, [bounds])

  const [items, setItems] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])

  async function fetchItemsAndTasks() {
    // ---- ITEMS
    let qbItems = supabase.from('items').select('id,title,lat,lng,price_per_day').eq('status','published')
    if (whereBounds) {
      qbItems = qbItems
        .gte('lat', whereBounds.swLat).lte('lat', whereBounds.neLat)
        .gte('lng', whereBounds.swLng).lte('lng', whereBounds.neLng)
    }
    const { data: itemsIn } = await qbItems.limit(24)
    let itemsList = (itemsIn ?? []).filter((d: any) => typeof d.lat === 'number' && typeof d.lng === 'number')
    if (itemsList.length === 0) {
      // ближайшие к центру
      const { data: all } = await supabase.from('items').select('id,title,lat,lng,price_per_day').eq('status','published').limit(200)
      itemsList = (all ?? [])
        .filter((d: any) => typeof d.lat === 'number' && typeof d.lng === 'number')
        .sort((a: any, b: any) => sqDist([a.lat, a.lng], center) - sqDist([b.lat, b.lng], center))
        .slice(0, 24)
    }
    setItems(itemsList)

    // ---- TASKS
    let qbTasks = supabase.from('tasks').select('id,title,lat,lng,price') // предполагаются поля lat/lng
    if (whereBounds) {
      qbTasks = qbTasks
        .gte('lat', whereBounds.swLat).lte('lat', whereBounds.neLat)
        .gte('lng', whereBounds.swLng).lte('lng', whereBounds.neLng)
    }
    const { data: tasksIn } = await qbTasks.limit(24)
    let tasksList = (tasksIn ?? []).filter((d: any) => typeof d.lat === 'number' && typeof d.lng === 'number')
    if (tasksList.length === 0) {
      const { data: allT } = await supabase.from('tasks').select('id,title,lat,lng,price').limit(200)
      tasksList = (allT ?? [])
        .filter((d: any) => typeof d.lat === 'number' && typeof d.lng === 'number')
        .sort((a: any, b: any) => sqDist([a.lat, a.lng], center) - sqDist([b.lat, b.lng], center))
        .slice(0, 24)
    }
    setTasks(tasksList)

    // маркеры на карте из items (по желанию можно смешать с задачами)
    setMarkers(itemsList.map((d: any) => ({ id: String(d.id), lat: d.lat, lng: d.lng, title: d.title })))
  }

  useEffect(() => { fetchItemsAndTasks() }, [whereBounds]) // eslint-disable-line

  return (
    <main className="container pb-20">
      <header className="py-10 text-center">
        <h1 className="mb-3 text-5xl font-semibold tracking-tight">Nadoo</h1>
        <p className="text-neutral-600">Сервис аренды вещей и выполнения заданий рядом с вами. Безопасные сделки, прозрачные условия, удобная карта.</p>
      </header>

      {/* карта во всю ширину */}
      <div className="mb-8">
        <YandexMap
          center={center}
          showSearch
          onBoundsChange={(b, c) => { setBounds(b); setCenter(c) }}
          markers={markers}
          height={420}
        />
      </div>

      {/* ТОП АРЕНДЫ */}
      <section className="mb-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Топ аренды <span className="text-xs text-neutral-500">(в текущей области; если пусто — ближайшие)</span></h2>
          <Link href="/search?type=items" className="text-blue-600 hover:underline">Все объявления</Link>
        </div>
        {items.length === 0 ? (
          <p className="text-neutral-500">Нет объявлений — попробуйте изменить масштаб карты.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it: any) => (
              <li key={it.id} className="rounded-xl border p-4">
                <div className="font-medium line-clamp-1">{it.title || 'Объявление'}</div>
                <div className="mt-1 text-sm text-neutral-500">{it.price_per_day ? `${it.price_per_day} ₽/сутки` : 'Цена не указана'}</div>
                <Link href={`/item/${it.id}`} className="mt-3 inline-block text-blue-600 hover:underline">Открыть</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ТОП ЗАДАНИЙ */}
      <section className="mb-12">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Топ заданий <span className="text-xs text-neutral-500">(в текущей области; если пусто — ближайшие)</span></h2>
          <Link href="/search?type=tasks" className="text-blue-600 hover:underline">Все задания</Link>
        </div>
        {tasks.length === 0 ? (
          <p className="text-neutral-500">Нет заданий — попробуйте изменить масштаб карты.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((t: any) => (
              <li key={t.id} className="rounded-xl border p-4">
                <div className="font-medium line-clamp-1">{t.title || 'Задание'}</div>
                <div className="mt-1 text-sm text-neutral-500">{t.price ? `${t.price} ₽` : 'Бюджет не указан'}</div>
                <Link href={`/task/${t.id}`} className="mt-3 inline-block text-blue-600 hover:underline">Открыть</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* КАТЕГОРИИ */}
      <section className="mb-12">
        <h3 className="mb-4 text-lg font-semibold">Популярные категории</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {['Электроника','Инструменты','Спорт','Праздники','Фото/Видео','Авто-товары'].map((c) => (
            <button key={c} className="rounded-xl border px-4 py-3 hover:bg-neutral-50">{c}</button>
          ))}
        </div>
      </section>

      {/* КАК ЭТО РАБОТАЕТ */}
      <section className="mb-16 rounded-2xl border p-6">
        <h3 className="mb-4 text-lg font-semibold">Как это работает</h3>
        <ol className="grid gap-4 sm:grid-cols-3">
          <li className="rounded-xl border p-4">1. Разместите вещь или задание — это бесплатно.</li>
          <li className="rounded-xl border p-4">2. Выберите даты/условия и общайтесь в чате.</li>
          <li className="rounded-xl border p-4">3. Безопасная сделка: прозрачно и удобно.</li>
        </ol>
      </section>
    </main>
  )
}
