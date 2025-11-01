"use client";

import { YMaps, Map, Placemark, ZoomControl, GeolocationControl } from "@pbe/react-yandex-maps";
import { useCallback, useMemo, useRef, useState } from "react";

type Props = {
  className?: string;
  center: [number, number];
  zoom?: number;
  onBoundsChange?: (bbox: { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number }) => void;
  showSearch?: boolean;
};

export default function YandexMap({ className, center, zoom = 10, onBoundsChange, showSearch = false }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY!;
  const [ymapsReady, setYmapsReady] = useState<any>(null);
  const mapRef = useRef<any>(null);
  const [markers, setMarkers] = useState<{ id?: string; lat: number; lng: number }[]>([]);

  const handleReady = (ymaps: any) => setYmapsReady(ymaps);

  const updateBounds = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds(); // [[sw_lat, sw_lng],[ne_lat, ne_lng]]
    if (!bounds || !onBoundsChange) return;
    const [[sw_lat, sw_lng], [ne_lat, ne_lng]] = bounds;
    onBoundsChange({ sw_lat, sw_lng, ne_lat, ne_lng });
  }, [onBoundsChange]);

  const onMapRef = (inst: any) => {
    mapRef.current = inst;
    updateBounds();
  };

  const onClick = useCallback((e: any) => {
    const coords = e.get("coords");
    setMarkers([{ lat: coords[0], lng: coords[1] }]);
  }, []);

  const searchInputId = useMemo(() => `search-${Math.random().toString(36).slice(2)}`, []);

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ymapsReady || !mapRef.current) return;
    const q = (document.getElementById(searchInputId) as HTMLInputElement)?.value?.trim();
    if (!q) return;
    const res = await ymapsReady.geocode(q, { results: 1 });
    const first = res.geoObjects.get(0);
    if (!first) return;
    const coords: [number, number] = first.geometry.getCoordinates();
    mapRef.current.setCenter(coords, 14, { duration: 200 });
    setMarkers([{ lat: coords[0], lng: coords[1] }]);
  };

  return (
    <div className={className}>
      {showSearch && (
        <form className="map-search" onSubmit={onSearchSubmit}>
          <input id={searchInputId} className="input" placeholder="Адрес или объект" />
          <button className="btn btn--ghost" type="submit">Найти</button>
        </form>
      )}
      <YMaps query={{ apikey: apiKey, lang: "ru_RU", load: "package.full" }}>
        <Map
          instanceRef={onMapRef}
          onLoad={handleReady}
          onBoundsChange={updateBounds}
          onClick={onClick}
          defaultState={{ center, zoom, controls: [] }}
          width="100%"
          height="520px"
        >
          <ZoomControl options={{ position: { right: 10, top: 100 } }} />
          <GeolocationControl options={{ position: { right: 10, top: 160 } }} />
          {markers.map((m) => (
            <Placemark key={m.id ?? `${m.lat}-${m.lng}`} geometry={[m.lat, m.lng]} />
          ))}
        </Map>
      </YMaps>
    </div>
  );
}
