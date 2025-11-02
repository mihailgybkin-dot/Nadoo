'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

declare global { interface Window { ymaps:any } }

export default function HomeClient() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Яндекс.Карты — мягкая инициализация
  useEffect(() => {
    const init = () => {
      if (!window.ymaps || !mapRef.current) return;
      window.ymaps.ready(() => {
        new window.ymaps.Map(mapRef.current!, { center:[55.751244,37.618423], zoom:11 });
      });
    };

    if (window.ymaps) { init(); return; }

    const s = document.createElement('script');
    s.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${process.env.NEXT_PUBLIC_YANDEX_API_KEY || ''}`;
    s.onload = init;
    s.onerror = () => setError('Не удалось загрузить карту');
    document.head.appendChild(s);
  }, []);

  // Пробный запрос, чтобы не падать главной (если RLS пока закрыт)
  useEffect(() => {
    (async () => {
      const { error } = await supabase.from('items').select('id').limit(1);
      if (error) setError('Не удалось загрузить данные');
    })();
  }, []);

  return (
    <main style={{ maxWidth: 1200, margin:'0 auto', padding:24 }}>
      <h1>Nadoo</h1>
      {error && <div style={{background:'#ffe0e0',border:'1px solid #ffb4b4',padding:12,marginBottom:12}}>
        {error}
      </div>}
      <div ref={mapRef} style={{ height: 420, width:'100%', background:'#f5f5f5' }} />
      <h3 style={{marginTop:24}}>Топ аренды рядом</h3>
      <p>Пока пусто</p>
      <h3 style={{marginTop:16}}>Топ заданий рядом</h3>
      <p>Пока пусто</p>
    </main>
  );
}
