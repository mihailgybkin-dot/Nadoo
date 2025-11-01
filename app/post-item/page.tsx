'use client'
import { useCallback, useEffect, useState } from 'react'
import AddressPicker from '../../components/AddressPicker'
import YandexMap from '../../components/YandexMap'

const MOSCOW: [number, number] = [55.751244, 37.618423]

async function reverseGeocode(lat: number, lng: number) {
  const key = process.env.NEXT_PUBLIC_YANDEX_API_KEY || ''
  const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${key}&format=json&geocode=${lng},${lat}`
  try {
    const j = await fetch(url).then((r) => r.json())
    return j?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.text || ''
  } catch {
    return ''
  }
}

export default function PostItemPage() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [deposit, setDeposit] = useState('')
  const [address, setAddress] = useState('')

  // СТАРТОВАЯ ТОЧКА: ставим метку в центре (можно перетащить)
  const [point, setPoint] = useState<{ lat: number; lng: number }>({ lat: MOSCOW[0], lng: MOSCOW[1] })

  // При первом рендере подгрузим адрес стартовой точки
  useEffect(() => {
    ;(async () => {
      const full = await reverseGeocode(point.lat, point.lng)
      if (full) setAddress(full)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Клик/перетаскивание метки — обновляем и координаты, и адрес
  const movePoint = useCallback(async (coords: [number, number]) => {
    const [lat, lng] = coords
    setPoint({ lat, lng })
    const full = await reverseGeocode(lat, lng)
    if (full) setAddress(full)
  }, [])

  return (
    <section className="container pb-20 pt-10">
      <h1 className="mb-6 text-2xl font-semibold">Сдать в аренду</h1>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_520px]">
        {/* Форма */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Название</label>
            <input className="w-full rounded border px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Цена/сутки</label>
              <input className="w-full rounded border px-3 py-2" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Залог (опц.)</label>
              <input className="w-full rounded border px-3 py-2" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Адрес</label>
            <AddressPicker
              value={address}
              onChange={setA
