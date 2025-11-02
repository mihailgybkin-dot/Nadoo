import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/profile');
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-semibold mb-6">Личный кабинет</h1>

      <div className="rounded-2xl border border-black/10 p-6 bg-white/60">
        <div className="text-lg font-medium">{user.email}</div>
        <div className="text-sm text-black/60 mt-1">ID: {user.id}</div>

        <form
          action="/api/logout"
          method="post"
          className="mt-6"
        >
          <button className="btn-primary" type="submit">Выйти</button>
        </form>
      </div>
    </main>
  );
}
