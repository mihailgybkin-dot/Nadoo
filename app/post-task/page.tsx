"use client";

import Header from "../../components/Header";
import YandexAddressPicker from "../../components/YandexAddressPicker";

export default function PostTaskPage() {
  return (
    <>
      <Header />
      <div className="container section">
        <h1 className="h2">Разместить задание</h1>
        <div className="card">
          <form className="form">
            <input className="input" placeholder="Заголовок задания" />
            <input className="input" placeholder="Бюджет (₽)" type="number" />
            <YandexAddressPicker />
            <button className="btn btn--primary" type="button">Создать задание</button>
          </form>
        </div>
      </div>
    </>
  );
}
