'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type Item = { id: string; title: string; address?: string };
type Task = { id: string; title: string; address?: string };

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user }, error: uerr } = await supabase.auth.getUser();
      if (uerr) { setErr(uerr.message); return; }
      setEmail(user?.email ?? null);
      if (!user) return;

      const [{ data: it }, { data: tk }] = await Promise.all([
        supabase.from('items').select('id,title,address').eq('owner_id', user.id).order('created_at', { ascending:false }),
        supabase.from('tasks').select('id,title,address').eq('owner_id', user.id).order('created_at', { ascending:false }),
      ]);

      setItems(it || []);
      setTasks(tk || []);
    })();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <main style={{ maxWidth: 920, margin:'24px auto', padding:16 }}>
      <h1>Профиль</h1>
      <p>Вы вошли как: <b>{email ?? '—'}</b></p>
      <button onClick={logout} style={{ margin:'8px 0 24px' }}>Выйти</button>

      <h2>Мои аренды</h2>
      {items.length === 0 ? <p>Пока пусто</p> :
        <ul>{items.map(i => <li key={i.id}>{i.title} — {i.address || 'без адреса'}</li>)}</ul>}

      <h2 style={{ marginTop: 24 }}>Мои задания</h2>
      {tasks.length === 0 ? <p>Пока пусто</p> :
        <ul>{tasks.map(t => <li key={t.id}>{t.title} — {t.address || 'без адреса'}</li>)}</ul>}
    </main>
  );
}
