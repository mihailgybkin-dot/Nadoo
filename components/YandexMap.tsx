"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  YMaps,
  Map,
  Placemark,
  GeolocationControl,
  ZoomControl,
  SearchControl
} from "@pbe/react-yandex-maps";

type BBox = {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
};

type Props = {
  center?: [number, number];
  zoom?: number;
  className?: string;
  onBoundsChange?: (bbox: BBox) => void;
  onPlacePicked?: (p: { address?: string; lat: number; lng: number }) => void;
  showSearch?: boolean;
};

export const YandexMap: React.FC<Props> = ({
  center = [55.7558, 37.6173],
  zoom = 10,
  className,
  onBoundsChange,
  onPlacePicked,
  showSearch = true
}) => {
  const [point, setPoint] = useState<[number, number] | null>(null);

  const mapState = useMemo(
    () => ({ center, zoom, controls: [] as string[] }),
    [center, zoom]
  );

  const handleClick = useCallback(
    (e: any) => {
      const coords = e.get("coords") as [number, number];
      setPoint(coords);
      onPlacePicked?.({ lat: coords[0], lng: coords[1] });
    },
    [onPlacePicked]
  );

  const handleBounds = useCallback(
    (ymap: any) => {
      try {
        const b = ymap.getBounds(); // [[swLat, swLng],[neLat, neLng]]
        if (b && onBoundsChange) {
          onBoundsChange({
            sw_lat: b[0][0],
            sw_lng: b[0][1],
            ne_lat: b[1][0],
            ne_lng: b[1][1]
          });
        }
      } catch {
        // ignore
      }
    },
    [onBoundsChange]
  );

  const onSearchLoad = useCallback(
    (mapInstance: any) => {
      if (!showSearch || !mapInstance) return;
      try {
        const searchControl = mapInstance.controls.get("searchControl");
        // при показе результата поиска:
        searchControl?.events.add("resultshow", (e: any) => {
          const index = e.get("index");
          const result = searchControl.getResultsArray()?.[index];
          if (!result) return;
          const coords = result.geometry.getCoordinates();
          const address = result.properties.get("text");
          setPoint(coords);
          onPlacePicked?.({ address, lat: coords[0], lng: coords[1] });
        });
      } catch {
        // ignore
      }
    },
    [onPlacePicked, showSearch]
  );

  return (
    <div className={className}>
      <YMaps
        query={{
          // если нужен API-ключ:
          // apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY,
          lang: "ru_RU",
          coordorder: "latlong",
          load: "package.full"
        }}
      >
        <Map
          defaultState={mapState}
          state={mapState}
          onClick={handleClick}
          onLoad={onSearchLoad}
          onActionEnd={(e: any) => handleBounds(e.get("target"))}
          instanceRef={(m: any) => m && handleBounds(m)}
          width="100%"
          height="100%"
          modules={[
            "control.SearchControl",
            "control.ZoomControl",
            "control.GeolocationControl"
          ]}
          options={{ suppressMapOpenBlock: true }}
        >
          <ZoomControl />
          <GeolocationControl />
          {showSearch && <SearchControl options={{ float: "left" }} />}
          {point && <Placemark geometry={point} />}
        </Map>
      </YMaps>
    </div>
  );
};

export default YandexMap;
