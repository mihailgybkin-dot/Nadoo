/* Главная страница */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import YandexMap from "../components/YandexMap";
import SearchBar from "../components/SearchBar";
import { supabase } from "../integrations/supabase/client";

type BBox = { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number };

export default function Page() {
  const [bbox, setBbox] = useState<BBox | null>(null);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [topTasks, setTopTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTop = useCallback(async (box: BBox) => {
    setLoading(true);
    try {
      const [{ data: items }, { data: tasks }] = await Promise.all([
        supabase.rpc("top_items_in_bbox", {
          sw_lat: box.sw_lat,
          sw_lng: box.sw_lng,
          ne_lat: box.ne_lat,
          ne_lng: box.ne_lng,
          limit_n: 20,
        }),
        supabase.rpc("top_tasks_in_bbox", {
          sw_lat: box.sw_lat,
          sw_lng: box.sw_lng,
          ne_lat: box.ne_lat,
          ne_lng: box.ne_lng,
          limit_n: 20,
        }),
      ]);
      setTopItems(items || []);
      setTopTasks(tasks || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const onBoundsChange = useCallback((box: BBox) => {
    setBbox(box);
    loadTop(box);
  }, [loadTop]);

  const searchInitial = useMemo(() => ({ q: "", category: "all" }), []);

  return (
    <>
      <Header />
      <Hero />
      <div className="container">
        <SearchBar initial={searchInitial} />
        <div className="card card--flat">
          <YandexMap
            className="map"
            center={[55.751244, 37.618423]}
            zoom={10}
            onBoundsChange={onBoundsChange}
            showSearch
          />
        </div>

        <section className="section">
          <div className="section__head">
            <h2 className="h2">Топ аренды</h2>
            <span className="chip">в текущей области</span>
          </div>
          {loading ? (
            <p className="muted">Загрузка…</p>
          ) : topItems.length ? (
            <div className="cards">
              {topItems.slice(0, 10).map((x) => (
                <a key={x.id} href={`/item/${x.id}`} className="card card--item">
                  <div
                    className="card__img"
                    style={{
                      backgroundImage: `url(${(x.images && x.images[0]) || `https://picsum.photos/seed/${x.id}/600/400`})`,
                    }}
                  />
                  <div className="card__body">
                    <div className="card__title">{x.title}</div>
                    <div className="price">{x.price_per_day} ₽ <span className="muted">/ день</span></div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">Нет объявлений в пределах области</p>
          )}
        </section>

        <section className="section">
          <div className="section__head">
            <h2 className="h2">Топ заданий</h2>
            <span className="chip">в текущей области</span>
          </div>
          {loading ? (
            <p className="muted">Загрузка…</p>
          ) : topTasks.length ? (
            <div className="cards">
              {topTasks.slice(0, 10).map((x) => (
                <a key={x.id} href={`/task/${x.id}`} className="card card--item">
                  <div
                    className="card__img"
                    style={{
                      backgroundImage: `url(${(x.images && x.images[0]) || `https://picsum.photos/seed/${x.id}/600/400`})`,
                    }}
                  />
                  <div className="card__body">
                    <div className="card__title">{x.title}</div>
                    <div className="price accent">{x.price_total} ₽ <span className="muted">за задание</span></div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">Нет заданий в пределах области</p>
          )}
        </section>
      </div>
    </>
  );
}
