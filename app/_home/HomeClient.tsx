// app/_home/HomeClient.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

type Item = {
  id: string;
  title: string;
  address: string | null;
  photos: string[] | null;
};

export default function HomeClient() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ── 1) Подключаем Яндекс.Карты только на клиенте
  useEffect(() => {
    const id = 'ymaps3-script';
    if (document.getElementById(id)) {
      setScriptReady(true);
      return;
    }

    const s = document.createElement('script');
    s.id = id;
    s.src = 'https://api-maps.yandex.ru/v3/?apikey=<<YOUR_YMAPS_API_KEY>>&lang=ru_RU';
    s.async = true;
    s.onload = () => setScriptReady(true);
    s.onerror = () => setError('Не удалось загрузить карту');
    document.head.appendChild(s);
  }, []);

  // ── 2) Инициализируем карту (никакого SSR, только после scriptReady)
  useEffect(() => {
    let destroyed = false;

    async function init() {
      if (!scriptReady || !mapRef.current) return;
      try {
        // @ts-ignore
        await ymaps3.ready;
        // @ts-ignore
        const { YMap, YMapDefaultSchemeLayer, YMapControls, YMapDefaultFeaturesLayer } = ymaps3;

        const map = new YMap(mapRef.current, {
          location: { center: [37.618423, 55.751244], zoom: 11 },
          behaviors: ['drag', 'scrollZoom'],
        });

        map.addChild(new YMapDefaultSchemeLayer());
        map.addChild(new YMapDefaultFeaturesLayer());
        map.addChild(new YMapControls({ position: 'right' }));

        // просто зелёная точка в центре
        addCenterDot(map);

        if (destroyed) map.destroy?.();
      } catch (e) {
        console.error(e);
        setError('Ошибка инициализации карты');
      }
    }

    init();
    return () => {
      destroyed = true;
    };
  }, [scriptReady]);

  // ── 3) Клиентская загрузка «топов»
  useEffect(() => {
    (async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        if (!url || !key) return;

        // Лёгкий клиент без сторонних пакетов
        async function s(table: string, columns = '*', limit = 10) {
          const r = await fetch(`${url}/rest/v1/${table}?select=${encodeURIComponent(columns)}&limit=${limit}`, {
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
            },
            cache: 'no-store',
          });
          if (!r.ok) throw new Error(`fetch ${table} ${r.status}`);
          return r.json();
        }

        const [itemsData, tasksData] = await Promise.all([
          s('items', 'id,title,address,photos', 8),
          s('tasks', 'id,title,address,price_total', 8),
        ]);

        setItems(itemsData || []);
        setTasks(tasksData || []);
      } catch (e: any) {
        console.error(e);
        setError('Не удалось загрузить данные');
      }
    })();
  }, []);

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 28 }}>Nadoo</div>
        <nav style={{ display: 'flex', gap: 12 }}>
          <a href="/post-item">Сдать в аренду</a>
          <a href="/post-task">Разместить задание</a>
          <a href="/login">Войти</a>
        </nav>
      </header>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <section>
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: 420,
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        />
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Топ аренды рядом</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {items.map((it) => (
            <a
              key={it.id}
              href={`/item/${it.id}`}
              style={{ border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ height: 140, background: '#f3f4f6' }}>
                {it.photos?.[0] ? (
                  <img
                    src={it.photos[0]}
                    alt={it.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontWeight: 600 }}>{it.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{it.address || '—'}</div>
              </div>
            </a>
          ))}
          {items.length === 0 && <div style={{ color: '#6b7280' }}>Пока пусто</div>}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Топ заданий рядом</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {tasks.map((t) => (
            <a
              key={t.id}
              href={`/task/${t.id}`}
              style={{ border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ padding: 10 }}>
                <div style={{ fontWeight: 600 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{t.address || '—'}</div>
              </div>
            </a>
          ))}
          {tasks.length === 0 && <div style={{ color: '#6b7280' }}>Пока пусто</div>}
        </div>
      </section>
    </main>
  );
}

/** Рисуем зелёную точку в центре карты (без зависимостей). */
function addCenterDot(map: any) {
  try {
    // @ts-ignore
    const { YMapMarker } = ymaps3;
    const el = document.createElement('div');
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.borderRadius = '9999px';
    el.style.background = '#22c55e';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 0 2px rgba(34,197,94,0.35)';
    map.addChild(new YMapMarker({ coordinates: [37.618423, 55.751244] }, el));
  } catch {
    // noop
  }
}
