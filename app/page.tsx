// app/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import YandexMap from '../components/YandexMap';
import { supabase } from '../integrations/supabase/client';

type Marker = { id: string; lat: number; lng: number; title?: string };

export default function HomePage() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [bounds, setBounds] = useState<number[][] | null>(null);
  const [center, setCenter] = useState<[number, number]>([55.751244, 37.618423]);

  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [address, setAddress] = useState('');

  const whereBounds = useMemo(() => {
    if (!bounds) return null;
    const [[swLat, swLng], [neLat, neLng]] = bounds;
    return { swLat, swLng, neLat, neLng };
  }, [bounds]);

  const runSearch = async (params?: { category: string; query: string; address: string }) => {
    const cat = params?.category ?? category;
    const q = params?.query ?? query;

    if (params?.address && params.address.trim()) {
      try {
        const y = (window as any).ymaps;
        if (y) {
          await y.ready();
          const res = await y.geocode(params.address);
          const first = res.geoObjects.get(0);
          if (first) {
            const coords = first.geometry.getCoordinates();
            setCenter([coords[0], coords[1]]);
          }
        }
      } catch {}
    }

    // Пример запроса в Supabase. Таблица items: lat, lng, status, title, category
    let queryBuilder = supabase
      .from('items')
      .select('id,title,lat,lng,status,category')
      .eq('status', 'published');

    if (cat !== 'all') queryBuilder = queryBuilder.eq('category', cat);
    if (q.trim()) queryBuilder = queryBuilder.ilike('title', `%${q}%`);

    if (whereBounds) {
      queryBuilder = queryBuilder
        .gte('lat', whereBounds.swLat)
        .lte('lat', whereBounds.neLat)
        .gte('lng', whereBounds.swLng)
        .lte('lng', whereBounds.neLng);
    }

    const { data, error } = await queryBuilder.limit(100);
    if (!error && data) {
      setMarkers(
        data
          .filter((d) => typeof d.lat === 'number' && typeof d.lng === 'number')
          .map((d) => ({ id: String(d.id), lat: d.lat, lng: d.lng, title: d.title ?? '' }))
      );
    }
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whereBounds]);

  return (
    <>
      <Hero />
      <SearchBar
        onSearch={(p) => {
          setCategory(p.category);
          setQuery(p.query);
          setAddress(p.address);
          runSearch(p);
        }}
      />

      <YandexMap
        center={center}
        markers={markers}
        onBoundsChange={(b) => setBounds(b)}
      />

      <section className="container pb-12">
        <h2 className="mb-2 text-xl font-semibold">Топ аренды <span className="text-xs text-neutral-500">(в текущей области)</span></h2>
        {markers.length === 0 ? (
          <p className="text-neutral-500">Нет объявлений в пределах области</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {markers.slice(0, 6).map((m) => (
              <li key={m.id} className="rounded-2xl border border-neutral-200 p-4">
                <div className="text-sm font-medium">{m.title || 'Объявление'}</div>
                <div className="mt-1 text-xs text-neutral-500">
                  {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="container pb-20">
        <h2 className="mb-2 text-xl font-semibold">Топ заданий <span className="text-xs text-neutral-500">(в текущей области)</span></h2>
        <p className="text-neutral-500">Нет заданий в пределах области</p>
      </section>
    </>
  );
}
