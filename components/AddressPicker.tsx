'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'

type PickResult = { address: string; full?: string; lat: number; lng: number }
type Props = {
  value?: string
  placeholder?: string
  onChange?: (text: string) => void
  onPick?: (r: PickResult) => void
}

type Suggest = { id: string; label: string; full: string; lat: number; lng: number }

export default function AddressPicker({
  value = '',
  onChange,
  onPick,
  placeholder = 'Адрес или объект',
}: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Suggest[]>([])
  const [hover, setHover] = useState(-1)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const YA_KEY = process.env.NEXT_PUBLIC_YANDEX_API_KEY || ''
  const inputId = useMemo(() => `addr-${Math.random().toString(36).slice(2)}`, [])

  async function fetchYandex(q: string): Promise<Suggest[]> {
    const url =
      `https://geocode-maps.yandex.ru/1.x/?apikey=${YA_KEY}&format=json&` +
      `geocode=${encodeURIComponent(q)}&results=7&lang=ru_RU`
    const r = await fetch(url)
    if (!r.ok) throw new Error(`yandex ${r.status}`)
    const j = await r.json()
    const fm = j?.response?.GeoObjectCollection?.featureMember ?? []
    return fm.map((it: any, i: number) => {
      const g = it.GeoObject
      const pos: string = g?.Point?.pos ?? ''
      const [lngStr, latStr] = pos.split(' ')
      const lat = Number(latStr), lng = Number(lngStr)
      const full: string = g?.metaDataProperty?.GeocoderMetaData?.text || ''
      const name = g?.name || full
      const desc = g?.description || ''
      const label = desc ? `${name} — ${desc}` : name
      return { id: `ya-${i}`, label, full, lat, lng }
    }).filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng))
  }

  async function fetchOSM(q: string): Promise<Suggest[]> {
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=7&accept-language=ru&q=${encodeURIComponent(q)}`
    const r = await fetch(url, { headers: { 'User-Agent': 'Nadoo/1.0 (nadoo.ru)' } })
    if (!r.ok) throw new Error(`osm ${r.status}`)
    const arr = await r.json()
    return arr.map((it: any, i: number) => ({
      id: `osm-${i}`,
      label: it.display_name.split(',').slice(0, 2).join(' — '),
      full: it.display_name,
      lat: Number(it.lat),
      lng: Number(it.lon),
    })).filter((s: Suggest) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
  }

  // подгружаем подсказки
  useEffect(() => {
    const q = (value || '').trim()
    if (q.length < 3) { setItems([]); setOpen(false); return }
    if (debRef.current) clearTimeout(debRef.current)
    debRef.current = setTimeout(async () => {
      try {
        const list = YA_KEY ? await fetchYandex(q) : []
        if (list.length) { setItems(list); setOpen(true); setHover(-1); return }
      } catch { /* yandex упал */ }
      try {
        const list = await fetchOSM(q)         // фолбэк
        setItems(list); setOpen(list.length > 0); setHover(-1)
      } catch {
        setItems([]); setOpen(false)
      }
    }, 200)
    return () => { if (debRef.current) clearTimeout(debRef.current) }
  }, [value, YA_KEY])

  // закрытие по клику вне
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current) return
      if (!boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const choose = (s: Suggest) => {
    setOpen(false)
    onPick?.({ address: s.full, full: s.full, lat: s.lat, lng: s.lng })
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
    if (open && items.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setHover(h => Math.min(items.length - 1, h + 1)); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setHover(h => Math.max(0, h - 1)); return }
      if (e.key === 'Enter')     { e.preventDefault(); choose(items[hover >= 0 ? hover : 0]); return }
      if (e.key === 'Escape')    { setOpen(false); return }
    }
    if (e.key === 'Enter' && (value || '').trim()) {
      e.preventDefault()
      // когда список не открыт — берём первый результат напрямую
      try { const [first] = YA_KEY ? await fetchYandex(value!.trim()) : []; if (first) return choose(first) } catch {}
      try { const [first] = await fetchOSM(value!.trim()); if (first) return choose(first) } catch {}
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        id={inputId}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
      />
      {open && items.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-auto rounded-xl border bg-white shadow" style={{ maxHeight: 300 }}>
          {items.map((s, i) => (
            <button
              type="button"
              key={s.id}
              onMouseEnter={() => setHover(i)}
              onClick={() => choose(s)}
              className={`block w-full px-3 py-2 text-left text-sm ${hover === i ? 'bg-neutral-100' : ''}`}
            >
              <div className="font-medium">{s.label}</div>
              <div className="text-xs text-neutral-500">{s.full}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
