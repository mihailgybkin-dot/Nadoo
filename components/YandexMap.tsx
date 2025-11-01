'use client';

import React from 'react';
import {
  YMaps,
  Map,
  Placemark,
  ZoomControl,
  GeolocationControl,
  SearchControl,
} from '@pbe/react-yandex-maps';

type Marker = { id?: string | number; lat: number; lng: number };

type Props = {
  center: [number, number];
  zoom?: number;
  showSearch?: boolean;
  onBoundsChange?: (
    bounds: unknown,
    center: [number, number],
    zoom: number
  ) => void;
  markers?: Marker[];
  /** можно передать класс для внешнего контейнера карты */
  className?: string;
};

export default function YandexMap({
  className,
  center,
  zoom = 10,
  showSearch = false,
  onBoundsChange,
  markers = [],
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY;

  // простая утилита для объединения классов, чтобы не тянуть сторонние либы
  const cx = (...a: Array<string | undefined>) => a.filter(Boolean).join(' ');

  return (
    <div
      className={cx(
        'w-full h-[520px] rounded-xl border border-neutral-200 overflow-hidden',
        className
      )}
    >
      <YMaps query={{ apikey: apiKey || undefined, load: 'package.full' }}>
        <Map
          state={{ center, zoom }}
          width="100%"
          height="100%"
          onBoundsChange={(e: any) => {
            if (!onBoundsChange) return;
            const map = e.get('target');
            const b = map.getBounds?.();
            const c = map.getCenter?.();
            const z = map.getZoom?.();
            if (c && z != null) onBoundsChange(b, c as [number, number], z);
          }}
        >
          {/* Контролы размещаем через position (у @pbe/react-yandex-maps так типы безопаснее) */}
          <ZoomControl options={{ position: { right: 10, top: 10 } }} />
          <GeolocationControl options={{ position: { right: 10, top: 60 } }} />
          {showSearch && (
            <SearchControl options={{ position: { left: 10, top: 10 } }} />
          )}

          {markers.map((m) => (
            <Placemark
              key={m.id ?? `${m.lat}-${m.lng}`}
              geometry={[m.lat, m.lng]}
            />
          ))}
        </Map>
      </YMaps>
    </div>
  );
}
