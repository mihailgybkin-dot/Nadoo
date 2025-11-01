// app/item/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../integrations/supabase/client'
import YandexMap from '../../../components/YandexMap'
import BookingCalendar from '../../../components/BookingCalendar'


export default function ItemPage() {
const { id } = useParams<{ id: string }>()
const [item, setItem] = useState<any>(null)


useEffect(() => {
;(async () => {
const { data } = await supabase.from('items').select('*').eq('id', id).single()
setItem(data)
})()
}, [id])


if (!item) return <section className="container py-10">Загрузка…</section>


return (
<section className="container grid grid-cols-1 gap-8 py-10 lg:grid-cols-[1fr_420px]">
<div className="space-y-4">
<h1 className="text-2xl font-semibold">{item.title}</h1>
<div className="rounded-xl border p-4">
<p className="text-neutral-700">{item.description ?? 'Описание отсутствует'}</p>
</div>
<YandexMap center={[item.lat ?? 55.75, item.lng ?? 37.62]} markers={[{ id: 'm', lat: item.lat, lng: item.lng, title: item.title }]} />
</div>
<aside>
<div className="mb-4 rounded-xl border p-4 text-2xl font-semibold">{(item.price_per_day ?? 0).toLocaleString('ru-RU')} ₽ / сутки</div>
<BookingCalendar itemId={item.id} pricePerDay={item.price_per_day ?? 0} />
</aside>
</section>
)
}
