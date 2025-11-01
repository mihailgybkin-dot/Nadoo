"use client";

import { YMaps, Map, Placemark, SearchControl, GeolocationControl, ZoomControl } from "@pbe/react-yandex-maps";
import { useState, useCallback } from "react";

type Bounds = { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number };

export function YandexMap({
  center,
  zoom = 10,
  className,
  showSearch = false,
  onBoundsChange,
  onPlacePicked,
}: {
  center: [number, number];
  zoom?: number;
  className?: string;
  showSearch?: boolean;
  onBoundsChange?: (b: Bounds) => void;
  onPlacePicked?: (p: { address: string; lat: number; lng: number }) => void;
}) {
  const [markers, setMarkers] = useState<{ lat: number; lng: number; id?: string }[]>([]);

  const apikey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || process.env.YANDEX_MAPS_API_KEY;

  const handleBounds = useCallback(
    (e: any) => {
      const b = e.get("newBounds") as [[number, number], [number, number]];
      if (!b) return;
      const [[swLat, swLng], [neLat, neLng]] = b;
      onBoundsChange?.({ sw_lat: swLat, sw_lng: swLng, ne_lat: neLat, ne_lng: neLng });
    },
    [onBoundsChange]
  );

  return (
    <div className={className}>
      <YMaps query={{ apikey, lang: "ru_RU", load: "package.full" }}>
        <Map
          state={{ center, zoom }}
          width="100%"
          height="100%"
          onBoundsChange={handleBounds}
          onClick={(e: any) => {
            const [lat, lng] = e.get("coords") as [number, number];
            setMarkers([{ lat, lng }]);
            onPlacePicked?.({ address: "", lat, lng });
          }}
          modules={["control.SearchControl", "control.ZoomControl", "control.GeolocationControl"]}
        >
          {showSearch && <SearchControl />}
          <ZoomControl />
          <GeolocationControl />
          {markers.map((m, i) => (
            <Placemark key={i} geometry={[m.lat, m.lng]} />
          ))}
        </Map>
      </YMaps>
    </div>
  );
}
