"use client";

import { useRef, useState } from "react";
import YandexMap from "./YandexMap";

export default function YandexAddressPicker() {
  const [address, setAddress] = useState("");
  const lastMarker = useRef<{ lat: number; lng: number } | null>(null);

  return (
    <div className="address">
      <label className="label">Адрес</label>
      <input
        className="input"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Введите адрес и нажмите «Найти» на карте"
      />
      <div className="card card--flat">
        <YandexMap
          className="map"
          center={[55.751244, 37.618423]}
          zoom={10}
          showSearch
          onBoundsChange={() => {}}
        />
      </div>
      <p className="muted">Подсказки работают: можно кликнуть по карте — метка переместится.</p>
    </div>
  );
}
