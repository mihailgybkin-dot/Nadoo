// app/page.tsx
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { YandexMap } from '@/components/YandexMap';
import { supabase } from '@/integrations/supabase/client';

export default function Home() {
  return (
    <main className="container mx-auto p-6 space-y-6">
      <section className="h-[500px]">
        <YandexMap
          className="w-full h-full rounded-lg"
          showSearch
          onBoundsChange={(bbox) => {
            // сюда позже подвяжем загрузку топ-объявлений через Supabase RPC
            console.log('bbox:', bbox);
          }}
          onPlacePicked={(p) => {
            console.log('picked:', p);
          }}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Топ аренды</h2>
          <Badge variant="outline">В текущей области</Badge>
        </div>
        <div className="text-muted-foreground">Здесь позже появятся карточки из БД</div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Топ заданий</h2>
          <Badge variant="outline">В текущей области</Badge>
        </div>
        <div className="text-muted-foreground">И тут тоже — после подключения RPC</div>
      </section>
    </main>
  );
}
