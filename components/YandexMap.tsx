"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  YMaps,
  Map,
  Placemark,
  type YMapsApi,
} from "@pbe/react-yandex-maps";

type BoundsBBox = {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
};

type Props = {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  className?: string;
  showSearch?: boolean;
  onBoundsChange?: (bbox: BoundsBBox) => void;
  onPlacePicked?: (p: { address: string; lat: number; lng: number }) => void;
};

export function YandexMap({
  center = [55.7558, 37.6173],
  zoom = 10,
  className,
  showSearch = true,
  onBoundsChange,
  onPlacePicked,
}: Props) {
  const mapRef = useRef<ymaps.Map | null>(null);
  const [marker, setMarker] = useState<[number, number] | null>(null);

  const query = useMemo(
    () => ({
      apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY || "",
      lang: "ru_RU",
      coordorder: "latlong",
      load: "package.full",
    }),
    []
  );

  const handleBounds = useCallback(
    (e: any) => {
      try {
        const b = e.get("newBounds");
        if (b && Array.isArray(b) && b.length === 2) {
          const [[swLng, swLat], [neLng, neLat]] = b;
          onBoundsChange?.({
            sw_lat: swLat,
            sw_lng: swLng,
            ne_lat: neLat,
            ne_lng: neLng,
          });
        }
      } catch {}
    },
    [onBoundsChange]
  );

  const handleClick = useCallback(
    (e: any) => {
      const coords = e.get("coords") as [number, number];
      setMarker(coords);
      onPlacePicked?.({ address: "", lat: coords[0], lng: coords[1] });
    },
    [onPlacePicked]
  );

  const handleLoad = useCallback(
    (ymaps: YMapsApi) => {
      if (!mapRef.current || !showSearch) return;

      const searchControl = new ymaps.control.SearchControl({
        options: {
          size: "large",
          useMapBounds: true,
          noPlacemark: true,
          float: "right",
          placeholderContent: "Введите адрес…",
        },
      });

      mapRef.current.controls.add(searchControl, {
        position: { top: 10, left: 10 },
      });

      searchControl.events.add("resultshow", () => {
        const res = searchControl.getResultsArray()?.[0];
        if (!res) return;

        const geometry = res.geometry as any;
        if (!geometry) return;

        const coords = geometry.getCoordinates() as [number, number];
        setMarker(coords);
        mapRef.current?.setCenter(coords, 15, { duration: 300 });

        const name = res.properties.get("name") || "";
        const desc = res.properties.get("description") || "";
        const address = [name, desc].filter(Boolean).join(", ");

        onPlacePicked?.({ address, lat: coords[0], lng: coords[1] });
      });
    },
    [onPlacePicked, showSearch]
  );

  return (
    <YMaps query={query}>
      <div className={className}>
        <Map
          defaultState={{ center, zoom }}
          instanceRef={(ref) => (mapRef.current = ref as unknown as ymaps.Map)}
          onLoad={handleLoad}
          onBoundsChange={handleBounds}
          onClick={handleClick}
          width="100%"
          height="100%"
          modules={[
            "control.SearchControl",
            "control.ZoomControl",
            "control.GeolocationControl",
            "geoObject.addon.balloon",
          ]}
        >
          {marker && <Placemark geometry={marker} />}
        </Map>
      </div>
    </YMaps>
  );
}

export default YandexMap;
