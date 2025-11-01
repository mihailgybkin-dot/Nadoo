'use client'
import { useEffect, useMemo, useRef, useState } from 'react'

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
  const key = process.env.NEXT_PUBLIC_YANDEX_API_KEY || ''
  const debounce = useRef<number | null>(null)
  const inputId = useMemo(() => `addr-${Math.random().toString(36).slice(2)}`, [])

  // грузим подсказки Яндекса по мере ввода
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
          const full = g?.metaDataProperty?.GeocoderMetaData?.text || `${name}${desc ? `, ${desc}` : ''}`
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
    onPick?.({ address: s.full, full: s.full, lat: s.la
