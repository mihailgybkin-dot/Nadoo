'use client'
import { useEffect, useState } from 'react'


export default function GlobalSearch() {
const [q, setQ] = useState('')
const [items, setItems] = useState<any[]>([])
useEffect(() => {
const i = setTimeout(async () => {
if (!q.trim()) return setItems([])
const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
const j = await res.json()
setItems(j.items)
}, 200)
return () => clearTimeout(i)
}, [q])
return (
<div className="relative mx-auto w-full max-w-3xl">
<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Искать на Nadoo…" className="h-12 w-full rounded-full border px-5 pr-12 text-[15px] shadow-sm focus:outline-none focus:ring" />
<div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">🔍</div>
{items.length > 0 && (
<div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow">
{items.map((it) => (
<a key={it.id} href={`/item/${it.id}`} className="block px-4 py-3 hover:bg-gray-50">
<div className="font-medium">{it.title}</div>
<div className="text-xs text-gray-500 line-clamp-1">{it.description}</div>
</a>
))}
</div>
)}
</div>
)
}
