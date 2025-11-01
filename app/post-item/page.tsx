"use client";

import { useState } from "react";
import { YandexMap } from "@/components/YandexMap";
import { supabase } from "@/integrations/supabase/client";

export default function PostItemPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Электроника");
  const [price, setPrice] = useState<number>(300);
  const [deposit, setDeposit] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string>("");

  async function recommend() {
    if (!coords) { setHint("Укажите точку на карте для рекомендации цены"); return; }
    setHint("Считаем…");
    const { data, error } = await supabase.rpc("recommend_item_price", {
      p_category: category,
      p_lat: coords.lat,
      p_lng: coords.lng
    });
    if (error) { setHint("Ошибка рекомендации"); return; }
    if (!data || Number(data) === 0) { setHint("Недостаточно данных рядом. Поставьте свою цену."); return; }
    setPrice(Number(data));
    setHint(`Рекомендация: ~${Number(data)} ₽/день`);
  }

  async function save(status: "draft" | "published") {
    if (!coords) { alert("Поставьте метку на карте"); return; }
    setLoading(true);
    const { error } = await supabase
      .from("items")
      .insert({
        title,
        description,
        category,
        price_per_day: price,
        deposit,
        address,
        lat: coords.lat,
        lng: coords.lng,
        status
      });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert(status === "published" ? "Опубликовано!" : "Сохранено как черновик.");
      setTitle(""); setDescription(""); setAddress(""); setCoords(null);
    }
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Сдать в аренду</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm mb-1">Название *</span>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Например, перфоратор Bosch"/>
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Категория *</span>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full border rounded px-3 py-2">
              <option>Электроника</option>
              <option>Инструменты</option>
              <option>Спорт</option>
              <option>Авто</option>
              <option>Другое</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm mb-1">Цена за день (₽) *</span>
              <input type="number" min={0} value={price} onChange={e=>setPrice(Number(e.target.value))} className="w-full border rounded px-3 py-2"/>
            </label>
            <label className="block">
              <span className="block text-sm mb-1">Залог (₽)</span>
              <input type="number" min={0} value={deposit} onChange={e=>setDeposit(Number(e.target.value))} className="w-full border rounded px-3 py-2"/>
            </label>
          </div>

          <button onClick={recommend} className="px-3 py-2 border rounded text-sm">Рекомендовать цену</button>
          {hint && <div className="text-sm text-gray-600">{hint}</div>}

          <label className="block">
            <span className="block text-sm mb-1">Адрес (произвольно)</span>
            <input value={address} onChange={e=>setAddress(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="улица, дом…"/>
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Описание</span>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={5} className="w-full border rounded px-3 py-2" placeholder="Состояние, комплектация и т.д."/>
          </label>

          <div className="flex gap-3 pt-2">
            <button disabled={loading} onClick={()=>save("draft")} className="px-4 py-2 border rounded">Сохранить черновик</button>
            <button disabled={loading} onClick={()=>save("published")} className="px-4 py-2 rounded bg-black text-white">Опубликовать</button>
          </div>
        </div>

        <div>
          <YandexMap
            center={[55.7558, 37.6173]}
            zoom={10}
            showSearch
            onPlacePicked={(p)=>{ setCoords({lat:p.lat, lng:p.lng}); setAddress(p.address || address); }}
            className="w-full h-[520px] rounded overflow-hidden"
          />
          <div className="text-xs text-gray-500 mt-2">
            Поставьте метку кликом по карте — координаты сохранятся в объявлении.
          </div>
        </div>
      </div>
    </main>
  );
}
