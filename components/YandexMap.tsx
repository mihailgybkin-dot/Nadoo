// components/YandexMap.tsx
'use client';

import { YMaps, Map, Placemark, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps';
import { useMemo } from 'react';

type Marker = {
  id?: string;
  lat: number;
  lng: number;
  title?: string;
};

type Props = {
  markers?: Marker[];
  center?: [number, number];
  onBoundsChange?: (bounds: number[][]) => void; // [[swLat, swLng], [neLat, neLng]]
};

export default function YandexMap({ markers = [], center = [55.751244, 37.618423], onBoundsChange }: Props) {
  const defaultState = useMemo(
    () => ({ center, zoom: 10 }),
    [center]
  );

  return (
    <section className="container pb-10">
      <div className="overflow-hidden rounded-2xl border border-neutral-200">
        <YMaps
          query={{
            apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || '',
            lang: 'ru_RU',
          }}
        >
          <Map
            width="100%"
            height="520px"
            defaultState={defaultState}
            onBoundsChange={(e: any) => {
              const bounds = e.get('newBounds');
              if (onBoundsChange && Array.isArray(bounds)) onBoundsChange(bounds);
            }}
            modules={['control.ZoomControl', 'control.GeolocationControl']}
          >
            <ZoomControl options={{ position: { top: 10, left: 10 } }} />
            <GeolocationControl options={{ position: { top: 10, right: 10 } }} />
            {markers.map((m) => (
              <Placemark
                key={m.id ?? `${m.lat}-${m.lng}`}
                geometry={[m.lat, m.lng]}
                properties={{ balloonContent: m.title ?? '' }}
              />
            ))}
          </Map>
        </YMaps>
      </div>
    </section>
  );
}
