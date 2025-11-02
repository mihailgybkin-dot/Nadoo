// app/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

type Item = { id: string; title: string; address: string | null; price_per_day: number | null; images: string[] | null; lat: number | null; lng: number | null; };
type Task = { id: string; title: string; address: string | null; price_total: number | null; images: string[] | null; lat: number | null; lng: number | null; };

const DEFAULT_CENTER: [number, number] = [55.751244, 37.618423];
const RADIUS_METERS = 200;

export default function HomePage() {
  const supabase = createSupabaseBrowser();
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapError, setMapError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const marker = useRef<any>(null);

  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const ymaps = await loadYandex();
        if (disposed) return;
        const map = new ymaps.Map(mapRef.current, { center, zoom: 12, controls: ['zoomControl'] });
        mapInstance.current = map;
        marker.current = new ymaps.Placemark(center, {}, { preset: 'islands#circleIcon', iconColor: '#22c55e' });
        map.geoObjects.add(marker.current);
        map.events.add('boundschange', () => {
          const c = map.getCenter(); setCenter([c[0], c[1]]);
          marker.current.geometry.setCoordinates(c);
        });
      } catch { setMapError('Не удалось загрузить карту'); }
    })();
    return () => { disposed = true; try { mapInstance.current?.destroy(); } catch {} };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: itemsData } = await supabase.from('items').select('id,title,address,price_per_day,images,lat,lng').limit(50);
      const { data: tasksData } = await supabase.from('tasks').select('id,title,address,price_total,images,lat,lng').limit(50);
      if (cancelled) return;

      const inRadiusItems = (itemsData ?? []).filter(i => i.lat && i.lng && distance(center, [i.lat, i.lng]) <= RADIUS_METERS);
      const inRadiusTasks = (tasksData ?? []).filter(t => t.lat && t.lng && distance(center, [t.lat, t.lng]) <= RADIUS_METERS);

      setItems(inRadiusItems.length ? inRadiusItems : (itemsData ?? []));
      setTasks(inRadiusTasks.length ? inRadiusTasks : (tasksData ?? []));
    })();
    return () => { cancelled = true; };
  }, [center]);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '12px 0' }}>Nadoo</h1>

      {mapError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 12 }}>{mapError}</div>}
      <div ref={mapRef} style={{ width: '100%', height: 360, border: '1px solid #eee', borderRadius: 8 }} />

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Топ аренды рядом (~{RADIUS_METERS} м)</h2>
        <Cards list={(items ?? []).map(i => ({ id: i.id, title: i.title, price: i.price_per_day ?? undefined, address: i.address ?? '', image: i.images?.[0], href: `/item/${i.id}` }))} />
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Топ заданий рядом (~{RADIUS_METERS} м)</h2>
        <Cards list={(tasks ?? []).map(t => ({ id: t.id, title: t.title, price: t.price_total ?? undefined, address: t.address ?? '', image: t.images?.[0], href: `/task/${t.id}` }))} />
      </section>
    </div>
  );
}

function Cards({ list }: { list: { id: string; title: string; price?: number; address: string; image?: string | null; href: string }[] }) {
  if (!list.length) return <div>Пока пусто</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
      {list.map(x => (
        <a key={x.id} href={x.href} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ aspectRatio: '4/3', background: '#f5f5f5' }}>
              {x.image && <img src={x.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ fontWeight: 600 }}>{x.title}</div>
              {x.price !== undefined && <div style={{ marginTop: 4 }}>{x.price} ₽</div>}
              <div style={{ marginTop: 6, color: '#666', fontSize: 12 }}>{x.address}</div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

function toRad(v: number) { return (v * Math.PI) / 180; }
function distance(a: [number, number], b: [number, number]) {
  const R = 6371000, dLat = toRad(b[0] - a[0]), dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]), lat2 = toRad(b[0]);
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

declare global { interface Window { ymaps?: any } }
async function loadYandex() {
  if (typeof window === 'undefined') throw new Error('ssr');
  if (window.ymaps) return new Promise<any>((res) => window.ymaps.ready(() => res(window.ymaps)));
  const key = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  const s = document.createElement('script');
  s.src = `https://api-maps.yandex.ru/2.1/?apikey=${key ?? ''}&lang=ru_RU`;
  s.async = true;
  const p = new Promise<any>((resolve, reject) => {
    s.onload = () => window.ymaps.ready(() => resolve(window.ymaps));
    s.onerror = () => reject(new Error('ymaps load error'));
  });
  document.head.appendChild(s);
  return p;
}
