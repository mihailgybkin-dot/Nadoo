"use client";

import { useCallback } from "react";
import { Badge } from "../components/ui/badge";
import YandexMap from "../components/YandexMap";

export default function Home() {
  const handleBoundsChange = useCallback((bbox: any) => {
    console.log("bbox:", bbox);
    // TODO: здесь позже дернём Supabase RPC для "топ объявлений" по текущей области
  }, []);

  const handlePlacePicked = useCallback((p: { address?: string; lat: number; lng: number }) => {
    console.log("picked:", p);
    // TODO: здесь позже будем подставлять адрес/координаты в форму создания объявления
  }, []);

  return (
    <main className="container mx-auto p-6 space-y-6">
      <section className="h-[500px]">
        <YandexMap
          className="w-full h-full rounded-lg"
          showSearch
          onBoundsChange={handleBoundsChange}
          onPlacePicked={handlePlacePicked}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Топ аренды</h2>
          <Badge variant="outline">В текущей области</Badge>
        </div>
        <div className="text-neutral-500">Тут будет лента карточек из БД</div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Топ заданий</h2>
          <Badge variant="outline">В текущей области</Badge>
        </div>
        <div className="text-neutral-500">И здесь — лента карточек из БД</div>
      </section>
    </main>
  );
}
