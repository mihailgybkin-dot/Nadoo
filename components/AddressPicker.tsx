'use client'
import { useEffect, useMemo } from 'react'

type Props = {
  value?: string
  placeholder?: string
  onChange?: (text: string) => void
  onPick?: (r: { address: string; lat: number; lng: number }) => void
}

declare global { interface Window { ymaps?: any } }

function loadYandex(apiKey?: string) {
  if (typeof window === 'undefined') return Promise.resolve(undefined)
  // Уже загружено
  if (window.ymaps?.ready) return new Promise((res) => window.ymaps.ready(() => res(window.ymaps)))
  // Подключаем скрипт
  return new Promise((resolve) => {
    const id = 'yandex-maps-api'
    if (!document.getElementById(id)) {
      const s = document.createElement('script')
      s.id = id
      // Явно просим полный пакет, чтобы был SuggestView и geocode
      const qp = new URLSearchParams({
        lang: 'ru_RU',
        load: 'package.full',
        apikey: (apiKey || '')
      })
      s.src = `https://api-maps.yandex.ru/2.1/?${qp.toString()}`
      s.async = true
      document.head.appendChild(s)
      s.onload = () => window.ymaps?.ready(() => resolve(window.ymaps))
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

  // Вешаем подсказки Яндекса
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_API_KEY
    let suggest: any
    loadYandex(apiKey).then((ymaps: any) => {
      const el = document.getElementById(inputId)
      if (!ymaps || !el || !ymaps.SuggestView) return
      suggest = new ymaps.SuggestView(inputId, { results: 7 })
      // Выбор из списка — сразу геокодим и ставим метку
      suggest.events.add('select', async (e: any) => {
        const v = e.get('item')?.value as string
        if (!v) return
        try {
          const res = await ymaps.geocode(v)
          const first = res.geoObjects.get(0)
          const c = first?.geometry?.getCoordinates?.() as [number, number] | undefined
          if (c) onPick?.({ address: v, lat: c[0], lng: c[1] })
        } catch {}
      })
    })
    return () => suggest?.destroy?.()
  }, [inputId, onPick])

  // ENTER — пытаемся geocode через JS-API, если нет — уходим в HTTP-геокодер
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const v = (e.target as HTMLInputElement).value.trim()
    if (!v) return
    try {
      const ymaps = window.ymaps
      if (ymaps?.geocode) {
        const res = await ymaps.geocode(v)
        const first = res.geoObjects.get(0)
        const c = first?.geometry?.getCoordinates?.() as [number, number] | undefined
        if (c) return onPick?.({ address: v, lat: c[0], lng: c[1] })
      }
    } catch {}
    // Фолбэк: HTTP-геокодер Яндекса
    try {
      const key = process.env.NEXT_PUBLIC_YANDEX_API_KEY || ''
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${key}&format=json&geocode=${encodeURIComponent(v)}`
      const j = await fetch(url).then((r) => r.json())
      const pos: string | undefined = j?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point?.pos
      if (pos) {
        const [lng, lat] = pos.split(' ').map(Number) // порядок lon lat!
        onPick?.({ address: v, lat, lng })
      }
    } catch {}
  }

  return (
    <input
      id={inputId}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
    />
  )
}
