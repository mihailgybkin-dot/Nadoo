'use client'
import { useEffect, useMemo } from 'react'

type Props = {
  value?: string
  placeholder?: string
  onChange?: (text: string) => void
  onPick?: (r: { address: string; lat: number; lng: number }) => void
}

declare global { interface Window { ymaps?: any } }

export default function AddressPicker({
  value = '',
  onChange,
  onPick,
  placeholder = 'Адрес или объект',
}: Props) {
  const inputId = useMemo(() => `addr-${Math.random().toString(36).slice(2)}`, [])

  // Подсказки Яндекса + выбор из списка
  useEffect(() => {
    const ymaps = window.ymaps
    const el = document.getElementById(inputId)
    if (!ymaps || !el || !ymaps.SuggestView) return
    const suggest = new ymaps.SuggestView(inputId, { results: 7 })
    suggest.events.add('select', async (e: any) => {
      const v = e.get('item')?.value as string
      if (!v) return
      const res = await ymaps.geocode(v)
      const first = res.geoObjects.get(0)
      if (!first) return
      const c = first.geometry.getCoordinates() as [number, number]
      onPick?.({ address: v, lat: c[0], lng: c[1] })
    })
    return () => suggest?.destroy?.()
  }, [inputId, onPick])

  // Нажали Enter — геокодим введённый текст
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
    if (e.key !== 'Enter') return
    const v = (e.target as HTMLInputElement).value.trim()
    if (!v) return
    const ymaps = window.ymaps
    if (ymaps?.geocode) {
      const res = await ymaps.geocode(v)
      const first = res.geoObjects.get(0)
      const c = first?.geometry?.getCoordinates?.() as [number, number] | undefined
      if (c) onPick?.({ address: v, lat: c[0], lng: c[1] })
    }
  }

  return (
    <input
      id={inputId}
      defaultValue={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
    />
  )
}
