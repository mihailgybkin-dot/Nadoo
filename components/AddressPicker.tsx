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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_API_KEY || ''
  const inputId = useMemo(() => `addr-${Math.random().toString(36).slice(2)}`, [])

  // Загружаем «подсказки» через HTTP геокодер Яндекса по мере набора
  useEffect(() => {
    const q = (value || '').trim()
    if (q.length < 3) {
      setItems([]); setOpen(false); return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const url =
          `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&` +
          `geocode=${encodeURIComponent(q)}&results=7`
        const j = await fetch(url).then(r => r.json())
        const fm = j?.response?.GeoObjectCollection?.featureMember ?? []
        const next: Suggest[] = fm.map((it: any, i: number) => {
          const g = it.GeoObject
          const pos: string = g?.Point?.pos ?? ''
          const [lngStr, latStr] = pos.split(' ')
          const lat = Number(latStr); const lng = Number(lngStr)
          const full: string = g?.metaDataProperty?.GeocoderMetaData?.text || ''
          const name = g?.name || full
          const desc = g?.description || ''
          const label = desc ? `${name} — ${desc}` : name
          return { id: `${i}-${pos}`, label, full, lat, lng }
        }).filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng))
        setItems(next); setOpen(next.length > 0); setHover(-1)
      } catch {
        setItems([]); setOpen(false)
      }
    }, 180)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [value, apiKey])

  // Клик вне — закрыть список
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

  // Enter/стрелки/escape
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
    if (open && items.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setHover(h => Math.min(items.length - 1, h + 1)); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setHover(h => Math.max(0, h - 1)); return }
      if (e.key === 'Enter')     { e.preventDefault(); choose(items[hover >= 0 ? hover : 0]); return }
      if (e.key === 'Escape')    { setOpen(false); return }
    }
    // Если список закрыт — берём первый результат геокодера по введённому адресу
    if (e.key === 'Enter' && (value || '').trim()) {
      e.preventDefault()
      try {
        const url =
          `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&` +
          `geocode=${encodeURIComponent((value || '').trim())}&results=1`
        const j = await fetch(url).then(r => r.json())
        const go = j?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject
        const pos: string | undefined = go?.Point?.pos
        if (pos) {
          const [lngStr, latStr] = pos.split(' ')
          const lat = Number(latStr); const lng = Number(lngStr)
          const full = go?.metaDataProperty?.GeocoderMetaData?.text || (value || '').trim()
          onPick?.({ address: full, full, lat, lng })
        }
      } catch {}
    }
  }

  return (
    <div
