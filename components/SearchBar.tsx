// components/SearchBar.tsx
'use client';

import { useState } from 'react';

type Props = {
  onSearch: (params: {
    category: string;
    query: string;
    address: string;
  }) => void;
};

const categories = [
  { value: 'all', label: 'Все категории' },
  { value: 'electronics', label: 'Электроника' },
  { value: 'tools', label: 'Инструменты' },
  { value: 'sport', label: 'Спорт' },
  { value: 'home', label: 'Дом' },
];

export default function SearchBar({ onSearch }: Props) {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [address, setAddress] = useState('');

  return (
    <section className="container pb-6">
      <div className="flex flex-col items-stretch gap-3 md:flex-row">
        <select
          className="input md:w-56"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          className="input"
          placeholder="Поиск по названию (например, «утюг»)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex w-full items-center gap-2 md:w-[420px]">
          <input
            className="input"
            placeholder="Адрес или объект"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button
            className="btn"
            onClick={() => onSearch({ category, query, address })}
          >
            Найти
          </button>
        </div>
      </div>
    </section>
  );
}
