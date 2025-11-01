// components/YandexMap.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

type Bounds = {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
};

type Props = {
  className?: string;
  center?: [number, number];
  zoom?: number;
  showSearch?: boolean;
  onBoundsChange?: (b: Bounds) => void;
  onPlacePicked?: (p: { address: string; lat: number; lng: number }) => void;
};

export function YandexMap({
  className,
  center = [55.751244, 37.618423],
  zoom = 10,
  showSearch = true,
  onBoundsChange,
  onPlacePicked,
}: Props) {
  const ymapsKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY!;
  const [mapState, setMapState] = useState<{ center: [number, number]; zoom: number }>({
    center,
    zoom,
  });
  const [marker, setMarker] = useState<[number, number] | null>(null);

  const modules = useMemo(
    () => (showSearch ? ['control.SearchControl', 'geocode'] : []),
    [showSearch]
  );

  const handleBounds = (ymap: any) => {
    try {
      const bounds = ymap.getBounds(); // [[swLat, swLng], [neLat, neLng]]
      if (!bounds || !onBoundsChange) return;
      const [[sw_lat, sw_lng], [ne_lat, ne_lng]] = bounds;
      onBoundsChange({ sw_lat, sw_lng, ne_lat, ne_lng });
    } catch {}
  };

  const handleMapClick = async (e: any, ymaps: any) => {
    const coords = e.get('coords') as [number, number];
    setMarker(coords);

    if (onPlacePicked && ymaps?.geocode) {
      try {
        const res = await ymaps.geocode(coords);
        const first = res.geoObjects.get(0);
        const address = first?.getAddressLine?.() || 'Адрес не найден';
        onPlacePicked({ address, lat: coords[0], lng: coords[1] });
      } catch {}
    }
  };

  return (
    <div className={className}>
      <YMaps query={{ apikey: ymapsKey, load: 'package.full' }}>
        <Map
          defaultState={mapState}
          state={mapState}
          width="100%"
          height="100%"
          modules={modules}
          onLoad={(ymaps: any) => {
            // Установим локаль RU
            if (ymaps?.culture) ymaps.culture = 'ru-RU';
          }}
          onBoundsChange={(inst: any) => handleBounds(inst)}
          onClick={(e: any) => {
            // @ts-ignore
            const ymaps = (window as any).ymaps;
            handleMapClick(e, ymaps);
          }}
          instanceRef={(inst) => {
            if (!inst) return;
            handleBounds(inst);
          }}
        >
          {marker && <Placemark geometry={marker} />}
        </Map>
      </YMaps>
    </div>
  );
}
