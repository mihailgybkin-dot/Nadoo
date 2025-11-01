"use client";

import { useCallback, useState } from "react";
import Badge from "../components/ui/badge";
import YandexMap from "../components/YandexMap";
import { supabase } from "../integrations/supabase/client";

type Item = {
  id: string;
  title: string;
  price_per_day: number | null;
  images?: string[] | null;
  lat: number;
  lng: number;
};

type Task = {
  id: string;
  title: string;
  price_total: number | null;
  images?: string[] | null;
  lat: number;
  lng: number;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTop = useCallback(async (bbox: any) => {
    if (!bbox) return;
    setLoading(true);
    try {
      const { data: iData, error: e1 } = await supabase.rpc("top_items_in_bbox", {
        sw_lat: bbox.sw_lat,
        sw_lng: bbox.sw_lng,
        ne_lat: bbox.ne_lat,
        ne_lng: bbox.ne_lng,
        limit_n: 20,
      });
      const { data: tData, error: e2 } = await supabase.rpc("top_tasks_in_bbox", {
        sw_lat: bbox.sw_lat,
        sw_lng: bbox.sw_lng,
        ne_lat: bbox.ne_lat,
        ne_lng: bbox.ne_lng,
        limit_n: 20,
      });
      if (e1) console.error(e1);
      if (e2) console.error(e2);
      setItems(iData || []);
      setTasks(tData || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBoundsChange = useCallback((bbox: any) => {
    // можно добавить debounce, если будет «дребезг»
    loadTop(bbox);
  }, [loadTop]);

  const handlePlacePicked = useCallback((p: { address?: string; lat: number; lng: number }) => {
    console.log("picked:", p);
  }, []);

  return (
    <main className="container mx-auto p-6 space-y-6">
      <section className="h-[500px]">
        <YandexMap
          className="w-full h-full rounded-lg"
          showSearch
          onBoundsChange={handleBoundsChange}
          onPlacePicked={handlePlacePicked}
          markers={[]} // позже подставим маркеры из items/tasks
        />
      </section>

      {/* Топ аренды */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Топ аренды</h2>
          <Badge variant="outline">В текущей области</Badge>
        </div>

        {loading && <div className="text-neutral-500">Загружаю…</div>}

        {!loading && items.length === 0 && (
          <div className="text-neutral-500">Нет объявлений в пределах области</div>
        )}

        {!loading && items.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {items.slice(0, 10).map((i) => (
              <div key={i.id} className="min-w-[280px] rounded border p-3">
                <div
                  className="h-40 rounded bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${
                      (i.images && i.images[0]) ||
                      `https://picsum.photos/seed/${i.id}/400/300`
                    })`,
                  }}
                />
                <div className="mt-2 font-semibold">{i.title}</div>
                <div className="text-neutral-600">
                  {i.price_per_day ? `${i.price_per_day} ₽ / день` : "Цена по запросу"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Топ заданий */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Топ заданий</h2>
          <Badge variant="outline">В текущей области</Badge>
        </div>

        {loading && <div className="text-neutral-500">Загружаю…</div>}

        {!loading && tasks.length === 0 && (
          <div className="text-neutral-500">Нет заданий в пределах области</div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {tasks.slice(0, 10).map((t) => (
              <div key={t.id} className="min-w-[280px] rounded border p-3">
                <div
                  className="h-40 rounded bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${
                      (t.images && t.images[0]) ||
                      `https://picsum.photos/seed/${t.id}/400/300`
                    })`,
                  }}
                />
                <div className="mt-2 font-semibold">{t.title}</div>
                <div className="text-neutral-600">
                  {t.price_total ? `${t.price_total} ₽ за задание` : "Цена по запросу"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
