// components/AddressPicker.tsx
'use client';

import { useEffect, useRef } from 'react';

type Props = {
  value?: string;
  placeholder?: string;
  onChange?: (text: string) => void;
  onPick?: (result: { address: string; lat: number; lng: number }) => void;
};

export default function AddressPicker({ value = '', onChange, onPick, placeholder = 'Адрес или объект' }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const init = async () => {
      const y = (window as any).ymaps;
      if (!y) return;
      await y.ready();

      if (inputRef.current) {
        // SuggestView
        const suggest = new y.SuggestView(inputRef.current);
        suggest.events.add('select', async (e: any) => {
          const val = e.get('item')?.value;
          if (!val) return;
          onChange?.(val);

          const res = await y.geocode(val);
          const first = res.geoObjects.get(0);
          if (!first) return;

          const coords = first.geometry.getCoordinates();
          onPick?.({ address: val, lat: coords[0], lng: coords[1] });
        });
      }
    };
    init();
  }, [onChange, onPick]);

  const handleEnter = async (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key !== 'Enter') return;
    const y = (window as any).ymaps;
    if (!y || !inputRef.current) return;
    await y.ready();

    const val = inputRef.current.value;
    const res = await y.geocode(val);
    const first = res.geoObjects.get(0);
    if (!first) return;

    const coords = first.geometry.getCoordinates();
    onPick?.({ address: val, lat: coords[0], lng: coords[1] });
  };

  return (
    <input
      ref={inputRef}
      className="input"
      placeholder={placeholder}
      defaultValue={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={handleEnter}
    />
  );
}
