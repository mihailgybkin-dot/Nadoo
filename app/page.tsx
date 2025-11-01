'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import YandexMap, { MapMarker } from '@/components/YandexMap';
import { supabase } from '@/integrations/supabase/client';

type Bounds = { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number };

const categories = [
  { value: 'all', label: 'Все категории' },
  { value: 'electronics', label: 'Электроника' },
  { value: 'home', label: 'Дом и быт' },
  { value: 'tools', label: 'Инструменты' },
  { value: 'sport', label: 'Спорт' },
];

export default function Page() {
  const [bbox, setBbox] = useState<Bounds | null>(null);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [topTasks, setTopTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTop = useCallback(async (b: Bounds) => {
    try {
      const [{ data: items }, { data: tasks }] = await Promise.all([
        supabase.rpc('top_items_in_bbox', {
          sw_lat: b.sw_lat, sw_lng: b.sw_lng, ne_lat: b.ne_lat, ne_lng: b.ne_lng, limit_n: 20,
        }),
        supabase.rpc('top_tasks_in_bbox', {
          sw_lat: b.sw_lat, sw_lng: b.sw_lng, ne_lat: b.ne_lat, ne_lng: b.ne_lng, limit_n: 20,
        }),
      ]);
      setTopItems(items ?? []);
      setTopTasks(tasks ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchMarkers = useCallback(async (b: Bounds) => {
    setLoading(true);
    try {
      const base = supabase
        .from('items')
        .select('id,title,lat,lng,price_per_day,category,images')
        .eq('status', 'published')
        .gte('lat', b.sw_lat).lte('lat', b.ne_lat)
        .gte('lng', b.sw_lng).lte('lng', b.ne_lng);

      const q1 = cat !== 'all' ? base.eq('category', cat) : base;
      const q2 = query.trim() ? q1.ilike('title', `%${query}%`) : q1;
      const { data, error } = await q2.limit(500);
      if (error) console.error(error);

      const mks: MapMarker[] =
        (data ?? []).map((r: any) => ({
          id: r.id,
          lat: r.lat,
          lng: r.lng,
          title: r.title,
          price: r.price_per_day ?? undefined,
          kind: 'item',
        })) ?? [];
      setMarkers(mks);
    } finally {
      setLoading(false);
    }
  }, [cat, query]);

  const onBounds = useCallback(async (b: Bounds) => {
    setBbox(b);
    await Promise.all([fetchMarkers(b), fetchTop(b)]);
  }, [fetchMarkers, fetchTop]);

  const onSearchSubmit = useCallback(() => {
    if (bbox) fetchMarkers(bbox);
  }, [bbox, fetchMarkers]);

  const brandBtn =
    'rounded-xl bg-[#2F6BF2] px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90 disabled:opacity-60';

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <Hero />

      {/* Панель фильтров */}
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[1fr_220px_120px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Что ищем? Пример: утюг"
            className="h-11 w-full rounded-xl border px-4 text-sm outline-none"
          />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="h-11 rounded-xl border px-3 text-sm outline-none"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button onClick={onSearchSubmit} className={brandBtn} disabled={!bbox || loading}>
            Найти
          </button>
        </div>
      </section>

      {/* Карта */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <YandexMap
          className="rounded-xl border shadow-sm"
          showSearch
          markers={markers}
          onBoundsChange={onBounds}
          onMarkerClick={(id) => (window.location.href = `/item/${id}`)}
          onPlacePicked={() => {/* на главной только двигаем карту */}}
        />
        <div className="mt-2 text-right">
          <button
            className="rounded-full border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
            onClick={() => bbox && fetchTop(bbox)}
          >
            В текущей области
          </button>
        </div>
      </section>

      {/* Топ аренды */}
      <section className="mx-auto max-w-7xl px-4 pb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Топ аренды</h2>
          <span className="text-xs text-gray-500">автоматически по просмотрам и заказам</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {(topItems ?? []).map((r: any) => (
            <a
              key={r.id}
              href={`/item/${r.id}`}
              className="min-w-[260px] rounded-xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <div
                className="h-40 w-full rounded-t-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${r.images?.[0] ?? `https://picsum.photos/seed/${r.id}/600/400`})` }}
              />
              <div className="p-3">
                <div className="truncate font-medium">{r.title}</div>
                <div className="mt-1 text-sm text-gray-600">от {r.price_per_day ?? '—'} ₽ / день</div>
              </div>
            </a>
          ))}
          {!topItems?.length && <div className="text-sm text-gray-500">Нет объявлений в пределах области</div>}
        </div>
      </section>

      {/* Топ заданий */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Топ заданий</h2>
          <span className="text-xs text-gray-500">в текущей области</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {(topTasks ?? []).map((t: any) => (
            <a
              key={t.id}
              href={`/task/${t.id}`}
              className="min-w-[260px] rounded-xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <div
                className="h-40 w-full rounded-t-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${t.images?.[0] ?? `https://picsum.photos/seed/${t.id}/600/400`})` }}
              />
              <div className="p-3">
                <div className="truncate font-medium">{t.title}</div>
                <div className="mt-1 text-sm text-gray-600">бюджет {t.price_total ?? '—'} ₽</div>
              </div>
            </a>
          ))}
          {!topTasks?.length && <div className="text-sm text-gray-500">Нет заданий в пределах области</div>}
        </div>
      </section>
    </div>
  );
}
