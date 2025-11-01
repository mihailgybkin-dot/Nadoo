'use client';

import { useEffect, useRef } from 'react';

type Props = {
  value?: string;
  onChange?: (v: { address: string; lat: number; lng: number }) => void;
  placeholder?: string;
};

declare global {
  interface Window { ymaps: any }
  var ymaps: any;
}

export default function AddressPicker({ value = '', onChange, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!window.ymaps || !inputRef.current) return;

    const s = new window.ymaps.SuggestView(inputRef.current, { results: 5 });
    s.events.add('select', async (e: any) => {
      const addr = e.get('item').value;
      const res = await window.ymaps.geocode(addr);
      const obj = res.geoObjects.get(0);
      if (!obj) return;
      const [lat, lng] = obj.geometry.getCoordinates();
      onChange?.({ address: addr, lat, lng });
    });

    const el = inputRef.current;
    const handler = async (ev: KeyboardEvent) => {
      if (ev.key !== 'Enter') return;
      const addr = el.value;
      const res = await window.ymaps.geocode(addr);
      const obj = res.geoObjects.get(0);
      if (!obj) return;
      const [lat, lng] = obj.geometry.getCoordinates();
      onChange?.({ address: addr, lat, lng });
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      defaultValue={value}
      placeholder={placeholder ?? 'Введите адрес...'}
      className="w-full rounded-md border px-3 py-2 text-sm outline-none"
    />
  );
}
