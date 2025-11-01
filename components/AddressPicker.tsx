'use client'
import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  value?: string
  placeholder?: string
  onChange?: (text: string) => void
  onPick?: (r: { address: string; lat: number; lng: number }) => void
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
  const key = process.env.NEXT_PUBLIC_YANDEX_API_KEY || ''
  const debounce = useRef<number | null>(null)
  const inputId = useMemo(() => `addr-${Math.random().toString(36).slice(2)}`, [])

  // загрузка подсказок по мере ввода (через geocode API, без зависимостей)
  useEffect(() => {
    if (!value || value.trim().length < 3) {
      setItems([])
      setOpen(false)
      return
    }
    if (debounce.current) window.clearTimeout(debounce.current)
    debounce.current = window.setTimeout(async () => {
      try {
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${key}&format=json&geocode=${encodeURIComponent(
          value.trim()
        )}&results=6`
        const j = await fetch(url).then((r) => r.json())
        const fm = j?.response?.GeoObjectCollection?.featureMember ?? []
        const next: Suggest[] = fm.map((it: any, i: number) => {
          const g = it.GeoObject
          const pos = g?.Point?.pos as string
          const [lng, lat] = (pos || '').split(' ').map(Number)
          const name = g?.name || ''
          const desc = g?.description || ''
          const full = g?.metaDataProperty?.GeocoderMetaData?.text || `${name}, ${desc}`
          return { id: `${i}-${full}`, label: `${name}${desc ? ` — ${desc}` : ''}`, full, lat, lng }
        })
        setItems(next)
        setOpen(next.length > 0)
        setHover(-1)
      } catch {
        setOpen(false)
        setItems([])
      }
    }, 200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // клик вне — закрыть список
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
    onPick?.({ address: s.full, lat: s.lat, lng: s.lng })
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open || items.length === 0) {
      if (e.key === 'Enter' && value.trim()) {
        // если список закрыт — попробуем выбрать первый вариант
        e.preventDefault()
        choose(items[0] ?? { full: value.trim(), label: value.trim(), lat: 0, lng: 0, id: '0' })
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHover((h) => Math.min(items.length - 1, h + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHover((h) => Math.max(0, h - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const s = items[hover >= 0 ? hover : 0]
      if (s) choose(s)
    } else if (e.key === 'Escape') {
      setOpen(false)
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
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow">
          {items.map((s, i) => (
            <button
              type="button"
              key={s.id}
              onMouseEnter={() => setHover(i)}
              onClick={() => choose(s)}
              className={`block w-full px-3 py-2 text-left text-sm ${
                hover === i ? 'bg-neutral-100' : ''
              }`}
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
