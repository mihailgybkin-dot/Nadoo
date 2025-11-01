"use client";

import { useState } from "react";

export default function SearchBar({
  initial = { q: "", category: "all" },
}: {
  initial?: { q: string; category: string };
}) {
  const [q, setQ] = useState(initial.q);
  const [category, setCategory] = useState(initial.category);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category && category !== "all") params.set("category", category);
    // На будущее — отдельная страница поиска:
    // location.href = `/search?${params.toString()}`
    // Пока — просто скроллим к карте:
    document.querySelector(".map")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <form className="search" onSubmit={onSubmit}>
      <select className="input input--select" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">Все категории</option>
        <option value="electronics">Электроника</option>
        <option value="home">Дом и быт</option>
        <option value="tools">Инструменты</option>
        <option value="sport">Спорт</option>
        <option value="auto">Авто</option>
        <option value="other">Другое</option>
      </select>
      <input
        className="input"
        placeholder="Поиск по названию (например, «утюг»)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button className="btn btn--primary" type="submit">Найти</button>
    </form>
  );
}
