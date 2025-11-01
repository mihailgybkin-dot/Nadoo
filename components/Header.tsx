"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setEmail(sess?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <header className="site-header">
      <div className="container site-header__row">
        <a className="brand" href="/">
          <span className="brand__logo">
            <Image src="/logo-blue.svg" width={18} height={18} alt="Nadoo" />
          </span>
          <span className="brand__name">Nadoo</span>
        </a>

        <nav className="nav">
          <a href="/" className="nav__link">Главная</a>
          <a href="/my-rentals" className="nav__link">Мои аренды</a>
          <a href="/my-tasks" className="nav__link">Мои задания</a>
        </nav>

        <div className="actions">
          <a className="btn btn--ghost" href="/post-item">Сдать в аренду</a>
          <a className="btn btn--primary" href="/post-task">Разместить задание</a>

          {email ? (
            <div className="user">
              <span className="user__email">{email}</span>
              <a className="btn btn--ghost" href="/dashboard">Кабинет</a>
              <button className="btn btn--ghost" onClick={signOut}>Выйти</button>
            </div>
          ) : (
            <a className="btn btn--ghost" href="/login">Войти</a>
          )}
        </div>
      </div>
    </header>
  );
}
