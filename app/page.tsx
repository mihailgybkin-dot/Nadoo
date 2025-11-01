// app/page.tsx
'use client'
import { useEffect, useMemo, useState } from 'react'
import Hero from '../components/Hero'
import YandexMap from '../components/YandexMap'
import { supabase } from '../integrations/supabase/client'


type Marker = { id: string; lat: number; lng: number; title?: string }


export default function HomePage() {
const [markers, setMarkers] = useState<Marker[]>([])
const [bounds, setBounds] = useState<number[][] | null>(null)
const [center, setCenter] = useState<[number, number]>([55.751244, 37.618423])


const whereBounds = useMemo(() => {
if (!bounds) return null
const [[swLat, swLng], [neLat, neLng]] = bounds
return { swLat, swLng, neLat, neLng }
}, [bounds])


const runSearch = async () => {
let queryBuilder = supabase.from('items').select('id,title,lat,lng,status,category').eq('status', 'published')
if (whereBounds) {
queryBuilder = queryBuilder
.gte('lat', whereBounds.swLat)
.lte('lat', whereBounds.neLat)
.gte('lng', whereBounds.swLng)
.lte('lng', whereBounds.neLng)
}
const { data } = await queryBuilder.limit(100)
setMarkers((data ?? [])
.filter((d: any) => typeof d.lat === 'number' && typeof d.lng === 'number')
.map((d: any) => ({ id: String(d.id), lat: d.lat, lng: d.lng, title: d.title ?? '' })))
}


useEffect(() => { runSearch() }, [whereBounds])


return (
<>
<Hero />
<section className="container grid grid-cols-1 gap-8 pb-16 lg:grid-cols-[1fr_420px]">
<div>
<YandexMap
center={center}
showSearch
onBoundsChange={(b) => setBounds(b)}
markers={markers}
/>
</div>
<aside className="space-y-4">
<h2 className="text-xl font-semibold">Топ предложений аренды <span className="text-xs text-neutral-500">(в текущей области)</span></h2>
{markers.length === 0 ? (
<p className="text-neutral-500">Нет объявлений в пределах области</p>
) : (
<ul className="space-y-3">
{markers.slice(0, 8).map((m) => (
<li key={m.id} className="rounded-xl border p-4">
<div className="font-medium">{m.title || 'Объявление'}</div>
<div className="text-xs text-neutral-500">[{m.lat.toFixed(3)}, {m.lng.toFixed(3)}]</div>
</li>
))}
</ul>
)}
</aside>
</section>
</>
)
}
