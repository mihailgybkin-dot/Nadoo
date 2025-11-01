"use client";

import { useCallback, useState } from "react";
import Hero from "@/components/Hero";
import { YandexMap } from "@/components/YandexMap";
import { supabase } from "@/integrations/supabase/client";

export default function Page() {
  const [topItems, setTopItems] = useState<any[]>([]);
  const [topTasks, setTopTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTop = useCallback(async (bbox: any) => {
    if (!bbox) return;
    setLoading(true);
    try {
      const { data: items } = await supabase.rpc("top_items_in_bbox", {
        sw_lat: bbox.sw_lat,
        sw_lng: bbox.sw_lng,
        ne_lat: bbox.ne_lat,
        ne_lng: bbox.ne_lng,
        limit_n: 20,
      });

      const { data: tasks } = await supabase.rpc("top_tasks_in_bbox", {
        sw_lat: bbox.sw_lat,
        sw_lng: bbox.sw_lng,
        ne_lat: bbox.ne_lat,
        ne_lng: bbox.ne_lng,
        limit_n: 20,
      });

      setTopItems(items || []);
      setTopTasks(tasks || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const onBoundsChange = useCallback((bbox: any) => {
    loadTop(bbox);
  }, [loadTop]);

  return (
    <main>
      <Hero />

      {/* карта */}
      <section className="container mx-auto px-4 py-6">
        <YandexMap
          center={[55.7558, 37.6173]}
          zoom={10}
          onBoundsChange={onBoundsChange}
          showSearch
          className="w-full h-[520px] rounded-lg overflow-hidden"
        />
      </section>

      {/* топ аренды */}
      <section className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Топ аренды</h2>
          <span className="text-xs text-gray-500">в текущей области</span>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Загружаем популярные объявления…</p>
        ) : topItems.length === 0 ? (
          <p className="text-sm text-gray-500">Нет объявлений в пределах области</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topItems.map((it) => (
              <a
                key={it.id}
                href={`/item/${it.id}`}
                className="block border rounded-lg overflow-hidden hover:shadow"
              >
                <div
                  className="h-40 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${
                      it.images?.[0] || `https://picsum.photos/seed/${it.id}/600/400`
                    })`,
                  }}
                />
                <div className="p-3">
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-gray-600">
                    {it.price_per_day} ₽ / день
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* топ заданий */}
      <section className="container mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Топ заданий</h2>
          <span className="text-xs text-gray-500">в текущей области</span>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Загружаем популярные задания…</p>
        ) : topTasks.length === 0 ? (
          <p className="text-sm text-gray-500">Нет заданий в пределах области</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topTasks.map((t) => (
              <a
                key={t.id}
                href={`/task/${t.id}`}
                className="block border rounded-lg overflow-hidden hover:shadow"
              >
                <div
                  className="h-40 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${
                      t.images?.[0] || `https://picsum.photos/seed/${t.id}/600/400`
                    })`,
                  }}
                />
                <div className="p-3">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-sm text-gray-600">
                    {t.price_total} ₽ за задание
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
