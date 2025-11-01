'use client'
import { useCallback, useState } from 'react'
import AddressPicker from '../../components/AddressPicker'
import YandexMap from '../../components/YandexMap'

async function reverseGeocode(lat: number, lng: number) {
  const key = process.env.NEXT_PUBLIC_YANDEX_API_KEY || ''
  const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${key}&format=json&geocode=${lng},${lat}`
  try {
    const j = await fetch(url).then((r) => r.json())
    return (
      j?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.text || ''
    )
  } catch {
    return ''
  }
}

export default function PostItemPage() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [deposit, setDeposit] = useState('')
  const [address, setAddress] = useState('')
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null)

  // когда двигаем метку/кликаем по карте — обновляем координаты и адрес
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
        {/* форма */}
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
              onChange={setAddress}
              onPick={(r) => {
                setAddress(r.full ?? r.address) // если придёт full
                setPoint({ lat: r.lat, lng: r.lng })
              }}
              placeholder="Начните вводить адрес…"
            />
            <p className="text-xs text-neutral-500">
              Выберите адрес из подсказок или кликните по карте/перетащите метку — поле адреса заполнится автоматически.
            </p>
          </div>
          <button className="rounded bg-blue-600 px-4 py-2 text-white">Сохранить объявление</button>
        </div>

        {/* карта */}
        <div>
          <YandexMap
            center={point ? [point.lat, point.lng] : [55.751244, 37.618423]}
            markers={point ? [{ id: 'm', lat: point.lat, lng: point.lng, title: address }] : []}
            draggableMarker
            onClick={movePoint}
            height={420}
          />
        </div>
      </div>
    </section>
  )
}
