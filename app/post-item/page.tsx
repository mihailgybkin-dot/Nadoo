"use client";

import Header from "../../components/Header";
import YandexAddressPicker from "../../components/YandexAddressPicker";

export default function PostItemPage() {
  return (
    <>
      <Header />
      <div className="container section">
        <h1 className="h2">Сдать в аренду</h1>
        <div className="card">
          <form className="form">
            <input className="input" placeholder="Название" />
            <div className="grid2">
              <input className="input" placeholder="Цена за день (₽)" type="number" />
              <input className="input" placeholder="Залог (₽)" type="number" />
            </div>
            <YandexAddressPicker />
            <button className="btn btn--primary" type="button">Создать объявление</button>
          </form>
        </div>
      </div>
    </>
  );
}
