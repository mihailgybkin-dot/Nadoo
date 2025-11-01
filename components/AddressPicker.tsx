'use client'
import { useEffect, useMemo } from 'react'

type PickResult = { address: string; full?: string; lat: number; lng: number }

type Props = {
  value?: string
  placeholder?: string
  onChange?: (text: string) => void
  onPick?: (r: PickResult) => void
}

declare global { interface Window { ymaps?: any } }

function ensureYmapsLoaded(apiKey?: string) {
  if (typeof window === 'undefined') return Promise.resolve(undefined)
  if (window.ymaps?.ready) {
    return new Promise((res) => window.ymaps.ready(() => res(window.ymaps)))
  }
  return new Promise((resolve) => {
    const id = 'yandex-maps-api'
    if (!document.getElementById(id)) {
      const s = document.createElement('script')
      s.id = id
      const qs = new URLSearchParams({
        lang: 'ru_RU',
        load: 'package.full',
        apikey: apiKey ?? ''
      })
      s.src = `https://api-maps.yandex.ru/2.1/?${qs.toString()}`
      s.async = true
      s.onload = () => window.ymaps?.ready(() => resolve(window.ymaps))
      document.head.appendChild(s)
    } else {
      window.ymaps?.ready(() => resolve(window.ymaps))
    }
  })
}

export default function AddressPicker({
  value = '',
  onChange,
  onPick,
  placeholder = 'Адрес или объект',
}: Props) {
  const inputId = useMemo(() => `addr-${Math.random().toString(36).slice(2)}`, [])

  // Подключаем SuggestView Яндекса к нашему инпуту
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_API_KEY
    let suggest: any
    let sub: any

    ensureYmapsLoaded(apiKey).then(async (ymaps: any) => {
      const el = document.getElementById(inputId)
      if (!ymaps || !el || !ymaps.SuggestView) return

      suggest = new ymaps.SuggestView(inputId, { results: 8 })
      sub = suggest.events.add('select', async (e: any) => {
        const text = e.get('item')?.value as string
        if (!text) return
        try {
          const res = await ymaps.geocode(text)
          const obj = res.geoObjects.get(0)
          const coords = obj?.geometry?.getCoordinates?.() as [number, number] | undefined
          if (coords) {
            onPick?.({ address: text, full: text, lat: coords[0], lng: coords[1] })
          }
        } catch {}
      })
    })

    return () => {
      try { sub?.remove?.() } catch {}
      try { suggest?.destroy?.() } catch {}
    }
  }, [inputId, onPick])

  // ENTER = геокодим введённое
  const handleEnter: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
    if (e.key !== 'Enter') return
    const text = (e.currentTarget.value || '').trim()
    if (!text) return
    const ymaps = window.ymaps
    if (!ymaps?.geocode) return
    try {
      const res = await ymaps.geocode(text)
      const obj = res.geoObjects.get(0)
      const coords = obj?.geometry?.getCoordinates?.() as [number, number] | undefined
      if (coords) onPick?.({ address: text, full: text, lat: coords[0], lng: coords[1] })
    } catch {}
  }

  return (
    <input
      id={inputId}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={handleEnter}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
    />
  )
}
