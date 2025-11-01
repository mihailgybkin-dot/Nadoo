import { Badge } from "../components/ui/badge";
import YandexMap from "../components/YandexMap";

export default function Home() {
  return (
    <main className="container mx-auto p-6 space-y-6">
      <section className="h-[500px]">
        <YandexMap
          className="w-full h-full rounded-lg"
          showSearch
          onBoundsChange={(bbox) => {
            console.log("bbox:", bbox);
          }}
          onPlacePicked={(p) => {
            console.log("picked:", p);
          }}
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
