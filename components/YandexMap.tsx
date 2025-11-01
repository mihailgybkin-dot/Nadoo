// components/YandexMap.tsx
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
  /** уведомлять страницу при изменении границ карты */
  onBoundsChange?: (bbox: BBox) => void;
  /** уведомлять при выборе точки (клик или поиск) */
  onPlacePicked?: (p: { address?: string; lat: number; lng: number }) => void;
  /** показать строку поиска */
  showSearch?: boolean;
};

export const YandexMap: React.FC<Props> = ({
  center = [55.7558, 37.6173],
  zoom = 10,
  className,
  onBoundsChange,
  onPlacePicked,
  showSearch = false
}) => {
  const [point, setPoint] = useState<[number, number] | null>(null);

  const mapState = useMemo(
    () => ({ center, zoom, controls: [] as string[] }),
    [center, zoom]
  );

  const handleClick = useCallback(
    async (e: any) => {
      const coords = e.get("coords") as [number, number];
      setPoint(coords);
      onPlacePicked?.({ lat: coords[0], lng: coords[1] });
    },
    [onPlacePicked]
  );

  const handleBounds = useCallback(
    (ymap: any) => {
      try {
        const bounds = ymap.getBounds(); // [[swLat, swLng],[neLat, neLng]]
        if (bounds && onBoundsChange) {
          onBoundsChange({
            sw_lat: bounds[0][0],
            sw_lng: bounds[0][1],
            ne_lat: bounds[1][0],
            ne_lng: bounds[1][1]
          });
        }
      } catch {
        // ignore
      }
    },
    [onBoundsChange]
  );

  // обработчик результата поиска
  const onSearchResultShow = useCallback(
    (ymapsMap: any) => {
      if (!onPlacePicked) return;
      try {
        const searchControl = ymapsMap.controls.get("searchControl");
        searchControl.events.add("resultshow", async (e: any) => {
          const index = e.get("index");
          const result = searchControl.getResultsArray()[index];
          if (!result) return;
          const coords = result.geometry.getCoordinates();
          const address = result.properties.get("text");
          setPoint(coords);
          onPlacePicked({ address, lat: coords[0], lng: coords[1] });
        });
      } catch {
        // ignore
      }
    },
    [onPlacePicked]
  );

  return (
    <div className={className}>
      <YMaps
        query={{
          // если используешь ключ — добавь ENV-переменную NEXT_PUBLIC_YANDEX_API_KEY в Vercel
          // apikey: process.env.NEXT_PUBLIC_YANDEX_API_KEY,
          lang: "ru_RU",
          coordorder: "latlong",
          load: "package.full"
        }}
      >
        <Map
          defaultState={mapState}
          onClick={handleClick}
          onLoad={(ymaps: any) => {
            // когда карта готова — подвяжем обработчик для searchControl
            onSearchResultShow(ymaps);
          }}
          onActionEnd={(e: any) => handleBounds(e.get("target"))}
          width="100%"
          height="100%"
          instanceRef={(m: any) => m && handleBounds(m)}
          modules={[
            "control.SearchControl",
            "control.ZoomControl",
            "control.GeolocationControl"
          ]}
          state={mapState}
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
