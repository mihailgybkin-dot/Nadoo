'use client';

import { YMaps, Map, Placemark, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps';
import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  // типы упрощаем, чтобы не ругался TS
  interface Window { ymaps: any }
  var ymaps: any;
}

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  price?: number;
  kind?: 'item' | 'task';
};

type Bounds = { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number };

type Props = {
  center?: [number, number];
  zoom?: number;
  className?: string;
  markers?: MapMarker[];
  showSearch?: boolean;
  onBoundsChange?: (b: Bounds) => void;
  onMarkerClick?: (id: string) => void;
  onPlacePicked?: (p: { address: string; lat: number; lng: number }) => void;
};

export default function YandexMap({
  center = [55.7558, 37.6173],
  zoom = 11,
  className,
  markers = [],
  showSearch,
  onBoundsChange,
  onMarkerClick,
  onPlacePicked,
}: Props) {
  const mapRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [ymapsReady, setYmapsReady] = useState(false);

  const emitBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds(); // [[swLat, swLng], [neLat, neLng]]
    if (!b || !onBoundsChange) return;
    onBoundsChange({
      sw_lat: b[0][0],
      sw_lng: b[0][1],
      ne_lat: b[1][0],
      ne_lng: b[1][1],
    });
  }, [onBoundsChange]);

  const geocodeAndSet = useCallback(async (q: string) => {
    if (!window.ymaps) return;
    const res = await window.ymaps.geocode(q);
    const first = res.geoObjects.get(0);
    if (!first) return;
    const coords = first.geometry.getCoordinates(); // [lat, lng]
    mapRef.current.setCenter(coords, 14, { duration: 300 });
    onPlacePicked?.({ address: first.getAddressLine(), lat: coords[0], lng: coords[1] });
    emitBounds();
  }, [emitBounds, onPlacePicked]);

  useEffect(() => {
    if (!showSearch) return;
    if (!window.ymaps || !inputRef.current) return;
    const s = new window.ymaps.SuggestView(inputRef.current, { results: 5 });
    s.events.add('select', (e: any) => geocodeAndSet(e.get('item').value));
    // Enter по полю
    const el = inputRef.current;
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter') geocodeAndSet(el.value);
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [showSearch, geocodeAndSet]);

  const onMapLoad = () => {
    setYmapsReady(true);
    // отдадим стартовые границы
    setTimeout(emitBounds, 50);
  };

  return (
    <YMaps query={{ lang: 'ru_RU', apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY }}>
      <div className={`relative ${className ?? ''}`}>
        {showSearch && (
          <div className="pointer-events-auto absolute left-4 top-4 z-10 flex w-full max-w-md items-center gap-2 rounded-xl border bg-white p-2 shadow">
            <input
              ref={inputRef}
              placeholder="Адрес или объект"
              className="h-9 w-full rounded-md px-3 text-sm outline-none"
            />
            <button
              onClick={() => inputRef.current && geocodeAndSet(inputRef.current.value)}
              className="h-9 rounded-md bg-[#2F6BF2] px-3 text-sm font-medium text-white"
            >
              Найти
            </button>
          </div>
        )}

        <Map
          defaultState={{ center, zoom }}
          instanceRef={(m) => (mapRef.current = m)}
          onLoad={onMapLoad}
          onBoundsChange={() => ymapsReady && emitBounds()}
          width="100%"
          height="520px"
          options={{ suppressMapOpenBlock: true }}
        >
          <ZoomControl options={{ position: { right: 12, top: 12 } }} />
          <GeolocationControl options={{ position: { right: 12, top: 60 } }} />
          {markers.map((m) => (
            <Placemark
              key={m.id}
              geometry={[m.lat, m.lng]}
              options={{
                preset: m.kind === 'task' ? 'islands#violetDotIcon' : 'islands#blueDotIcon',
              }}
              properties={{
                balloonContentBody:
                  `<div style="font-weight:600">${m.title ?? 'Объявление'}</div>` +
                  (m.price ? `<div>от ${m.price} ₽</div>` : ''),
              }}
              onClick={() => onMarkerClick?.(m.id)}
            />
          ))}
        </Map>
      </div>
    </YMaps>
  );
}
