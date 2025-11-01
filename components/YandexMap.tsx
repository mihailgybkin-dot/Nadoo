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

type Marker = {
  id?: string | number;
  lat: number;
  lng: number;
  /** опциональный заголовок/подсказка для балуна */
  title?: string;
  hint?: string;
};

type Props = {
  center: [number, number];
  zoom?: number;
  showSearch?: boolean;
  onBoundsChange?: (
    bounds: number[][],
    center: [number, number],
    zoom: number
  ) => void;
  markers?: Marker[];
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
            const b = (map.getBounds?.() as number[][] | undefined) ?? [];
            const c = (map.getCenter?.() as [number, number]) ?? center;
            const z = (map.getZoom?.() as number) ?? zoom;
            onBoundsChange(b, c, z);
          }}
        >
          <ZoomControl options={{ position: { right: 10, top: 10 } }} />
          <GeolocationControl options={{ position: { right: 10, top: 60 } }} />
          {showSearch && (
            <SearchControl options={{ position: { left: 10, top: 10 } }} />
          )}

          {markers.map((m) => (
            <Placemark
              key={m.id ?? `${m.lat}-${m.lng}`}
              geometry={[m.lat, m.lng]}
              properties={{
                balloonContent: m.title ?? '',
                hintContent: m.hint ?? m.title ?? '',
              }}
            />
          ))}
        </Map>
      </YMaps>
    </div>
  );
}
