'use client'
import { useState } from 'react'
import AddressPicker from '../../components/AddressPicker'
import YandexMap from '../../components/YandexMap'

export default function PostItemPage() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [deposit, setDeposit] = useState('')
  const [address, setAddress] = useState('')
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null)

  return (
    <section className="container pb-20 pt-10">
      <h1 className="mb-6 text-2xl font-semibold">Сдать в аренду</h1>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_520px]">
        {/* левая колонка: форма */}
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
                setAddress(r.address)
                setPoint({ lat: r.lat, lng: r.lng })
              }}
            />
            <p className="text-xs text-neutral-500">
              Подсказки работают. Выбери из списка или нажми <kbd>Enter</kbd> — метка на карте переместится.
            </p>
          </div>

          <button className="rounded bg-blue-600 px-4 py-2 text-white">Сохранить объявление</button>
        </div>

        {/* правая колонка: карта */}
        <div>
          <YandexMap
            center={point ? [point.lat, point.lng] : [55.751244, 37.618423]}
            markers={
              point
                ? [{ id: 'p', lat: point.lat, lng: point.lng, title: address }]
                : []
            }
            markerOptions={{ preset: 'islands#dotIcon', iconColor: '#22C55E' }} // ярко-зеленый кружок
            onClick={(coords) => setPoint({ lat: coords[0], lng: coords[1] })}
            height={420}
          />
        </div>
      </div>
    </section>
  )
}
