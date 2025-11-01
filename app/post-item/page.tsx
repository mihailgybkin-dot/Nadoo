// app/post-item/page.tsx
'use client'


import { useState } from 'react'
import AddressPicker from '../../components/AddressPicker'
import YandexMap from '../../components/YandexMap'


export default function PostItemPage() {
const [title, setTitle] = useState('')
const [price, setPrice] = useState('')
const [deposit, setDeposit] = useState('')
const [address, setAddress] = useState('')
const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null)


return (
<section className="container pb-20 pt-10">
<h1 className="mb-6 text-2xl font-semibold">Сдать в аренду</h1>
<div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
{/* Левая колонка: форма */}
<div className="space-y-4">
<div>
<label className="label">Название</label>
<input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
</div>
<div className="grid grid-cols-2 gap-3">
<div>
<label className="label">Цена/сутки</label>
<input className="input" value={price} onChange={(e) => setPrice(e.target.value)} />
</div>
<div>
<label className="label">Залог (опц.)</label>
<input className="input" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
</div>
</div>
<div className="space-y-2">
<label className="label">Адрес</label>
<AddressPicker
value={address}
onChange={setAddress}
onPick={(r) => {
setAddress(r.address)
setPoint({ lat: r.lat, lng: r.lng })
}}
/>
<p className="muted">Подсказки работают. Выбери из списка или нажми <kbd>Enter</kbd> — метка на карте переместится.</p>
</div>
<div className="pt-2">
<button className="btn-brand">Сохранить объявление</button>
</div>
</div>


{/* Правая колонка: карта (уже узкая) */}
<div>
<YandexMap
center={point ? [point.lat, point.lng] : [55.751244, 37.618423]}
markers={point ? [{ id: 'p', lat: point.lat, lng: point.lng, title: address }] : []}
/>
</div>
</div>
</section>
)
}
