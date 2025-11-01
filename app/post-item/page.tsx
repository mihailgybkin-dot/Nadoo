// app/post-item/page.tsx
'use client';

import { useState } from 'react';
import AddressPicker from '../../components/AddressPicker';
import YandexMap from '../../components/YandexMap';

export default function PostItemPage() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [address, setAddress] = useState('');
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <section className="container pb-20 pt-10">
      <h1 className="mb-6 text-2xl font-semibold">Сдать в аренду</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <input className="input" placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Цена за день (₽)" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input className="input" placeholder="Залог (₽)" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Адрес</div>
            <AddressPicker
              value={address}
              onChange={setAddress}
              onPick={({ address, lat, lng }) => {
                setAddress(address);
                setPoint({ lat, lng });
              }}
            />
            <p className="text-xs text-neutral-500">Подсказки работают: нажми Enter — метка переместится.</p>
          </div>

          <div>
            <button className="btn-brand">Сохранить объявление</button>
          </div>
        </div>

        <div>
          <YandexMap
            center={point ? [point.lat, point.lng] as [number, number] : [55.751244, 37.618423]}
            markers={point ? [{ id: 'p', lat: point.lat, lng: point.lng, title: address }] : []}
          />
        </div>
      </div>
    </section>
  );
}
