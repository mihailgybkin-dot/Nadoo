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

  // стартовая метка (её можно перетаскивать)
  const [point, setPoint] = useState<{ lat: number; lng: number }>({
    lat: MOSCOW[0],
    lng: MOSCOW[1],
  })

  // при первом рендере подтягиваем адрес по стартовой метке
  useEffect(() => {
    ;(async () => {
      const full = await reverseGeocode(point.lat, point.lng)
      if (full) setAddress(full)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // клик по карте / окончание перетаскивания метки
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
            <input
              className="w-full rounded border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Цена/сутки</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Залог (опц.)</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Адрес</label>
            <AddressPicker
              value={address}
              onChange={setAddress}
              onPick={(r) => {
                setAddress(r.full || r.address)
                setPoint({ lat: r.lat, lng: r.lng })
              }}
              placeholder="Начните вводить адрес…"
            />
            <p className="text-xs text-neutral-500">
              Выберите адрес из подсказок или кликните по карте/перетащите метку — поле адреса обновится.
            </p>
          </div>

          <button className="rounded bg-blue-600 px-4 py-2 text-white">Сохранить объявление</button>
        </div>

        {/* карта */}
        <div>
          <YandexMap
            center={[point.lat, point.lng]}
            markers={[{ id: 'm', lat: point.lat, lng: point.lng, title: address }]}
            draggableMarker
            onClick={movePoint}
            markerOptions={{ preset: 'islands#dotIcon', iconColor: '#22C55E' }}
            height={420}
          />
        </div>
      </div>
    </section>
  )
}
