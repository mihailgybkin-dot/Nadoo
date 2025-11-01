"use client";

import {
  YMaps,
  Map,
  SearchControl,
  ZoomControl,
  GeolocationControl,
  Placemark,
} from "@pbe/react-yandex-maps";
import { useCallback, useRef, useState } from "react";

type BBox = {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
};

type Marker = { lat: number; lng: number; id?: string };

type Props = {
  className?: string;
  showSearch?: boolean;
  markers?: Marker[];
  onBoundsChange?: (bbox: BBox) => void;
  onPlacePicked?: (p: { address?: string; lat: number; lng: number }) => void;
};

export default function YandexMap({
  className,
  showSearch = false,
  markers = [],
  onBoundsChange,
  onPlacePicked,
}: Props) {
  const [center, setCenter] = useState<[number, number]>([55.7558, 37.6173]);
  const mapRef = useRef<any>(null);

  const emitBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;
    const [[sw_lat, sw_lng], [ne_lat, ne_lng]] = bounds;
    onBoundsChange?.({ sw_lat, sw_lng, ne_lat, ne_lng });
  }, [onBoundsChange]);

  const handleSearchSelect = useCallback(
    (e: any) => {
      const result = e.get("result");
      if (!result) return;
      const coords = result.geometry.getCoordinates();
      const address = result.properties.get("name");
      setCenter([coords[0] as number, coords[1] as number]);
      onPlacePicked?.({ address, lat: coords[0], lng: coords[1] });
      // Обновим bbox после перелёта карты
      setTimeout(() => emitBounds(), 300);
    },
    [emitBounds, onPlacePicked]
  );

  return (
    <YMaps query={{ apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY }}>
      <Map
        defaultState={{ center, zoom: 10 }}
        state={{ center, zoom: 10 }}
        instanceRef={(ref) => (mapRef.current = ref)}
        onBoundsChange={emitBounds}
        width="100%"
        height="100%"
        className={className}
        modules={[
          "control.SearchControl",
          "control.ZoomControl",
          "control.GeolocationControl",
        ]}
      >
        {showSearch && (
          <SearchControl
            options={{ float: "right", noPlacemark: true, placeholderContent: "Адрес или объект" }}
            instanceRef={(ref: any) => {
              if (ref) ref.events.add("resultshow", handleSearchSelect);
            }}
          />
        )}
        <ZoomControl options={{ float: "left" }} />
        <GeolocationControl options={{ float: "left" }} />
        {markers.map((m) => (
          <Placemark key={m.id ?? `${m.lat}-${m.lng}`} geometry={[m.lat, m.lng]} />
        ))}
      </Map>
    </YMaps>
  );
}
