'use client';

import {
  YMaps,
  Map,
  Placemark,
  GeolocationControl,
  ZoomControl,
  SearchControl,
} from '@pbe/react-yandex-maps';
import { useCallback, useRef, useState } from 'react';

type BBox = {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
};

type Marker = { id?: string; lat: number; lng: number };

type Props = {
  center?: [number, number];
  zoom?: number;
  className?: string;
  showSearch?: boolean;
  markers?: Marker[];
  onBoundsChange?: (bbox: BBox) => void;
  onPlacePicked?: (p: { address: string; lat: number; lng: number }) => void;
};

export function YandexMap({
  center = [55.7558, 37.6173],
  zoom = 10,
  className,
  showSearch = false,
  markers = [],
  onBoundsChange,
  onPlacePicked,
}: Props) {
  const mapRef = useRef<any>(null);
  const searchRef = useRef<any>(null);
  const [dynamicMarker, setDynamicMarker] = useState<[number, number] | null>(
    null
  );

  const emitBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map || !onBoundsChange) return;
    const b = map.getBounds?.();
    if (!b) return;
    const [[swLat, swLng], [neLat, neLng]] = b;
    onBoundsChange({
      sw_lat: swLat,
      sw_lng: swLng,
      ne_lat: neLat,
      ne_lng: neLng,
    });
  }, [onBoundsChange]);

  const handleMapLoad = useCallback((mapInstance: any) => {
    mapRef.current = mapInstance;
    emitBounds();
  }, [emitBounds]);

  // выбор из поисковой строки
  const attachSearchHandlers = useCallback((ctrl: any) => {
    if (!ctrl) return;
    searchRef.current = ctrl;

    ctrl.events.add('resultselect', (e: any) => {
      const index = e.get('index');
      const res = ctrl.getResultsArray?.()[index];
      if (!res) return;
      const coords = res.geometry?.getCoordinates?.();
      const address =
        res.properties?.get?.('text') ||
        res.properties?.get?.('name') ||
        'Выбранный адрес';

      if (Array.isArray(coords)) {
        setDynamicMarker([coords[0], coords[1]]);
        mapRef.current?.setCenter(coords, 15, { duration: 300 });
        onPlacePicked?.({
          address,
          lat: coords[0],
          lng: coords[1],
        });
      }
    });
  }, [onPlacePicked]);

  // клик по карте — ставим маркер и отдаём адрес через геокодер
  const handleMapClick = useCallback(async (e: any) => {
    const coords: [number, number] = e.get('coords');
    setDynamicMarker(coords);

    try {
      const ymaps = (window as any).ymaps;
      if (ymaps?.geocode) {
        const r = await ymaps.geocode(coords);
        const first = r.geoObjects.get(0);
        const address =
          first?.getAddressLine?.() ||
          first?.getPremiseNumber?.() ||
          'Выбранная точка';
        onPlacePicked?.({
          address,
          lat: coords[0],
          lng: coords[1],
        });
      } else {
        onPlacePicked?.({
          address: 'Выбранная точка',
          lat: coords[0],
          lng: coords[1],
        });
      }
    } catch {
      // тихо игнорируем ошибку геокодирования
    }
  }, [onPlacePicked]);

  return (
    <div className={className}>
      <YMaps query={{ apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY }}>
        <Map
          defaultState={{ center, zoom }}
          width="100%"
          height="500px"
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          // уведомляем о смене границ (перетаскивание/зум)
          onBoundsChange={emitBounds}
          options={{ suppressMapOpenBlock: true }}
        >
          {showSearch && (
            <SearchControl
              // вместо float используем position
              options={{ position: { top: 10, left: 10 }, size: 'large' }}
              instanceRef={attachSearchHandlers}
            />
          )}

          {/* Контролы без свойства float */}
          <ZoomControl options={{ position: { top: 10, right: 10 } }} />
          <GeolocationControl options={{ position: { top: 60, right: 10 } }} />

          {/* Маркеры из пропов */}
          {markers.map((m) => (
            <Placemark
              key={m.id ?? `${m.lat}-${m.lng}`}
              geometry={[m.lat, m.lng]}
            />
          ))}

          {/* Временный маркер при поиске/клике */}
          {dynamicMarker && <Placemark geometry={dynamicMarker} />}
        </Map>
      </YMaps>
    </div>
  );
}

export default YandexMap;
