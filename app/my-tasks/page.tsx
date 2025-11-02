'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

type TaskRow = {
  id: string
  title: string
  description?: string | null
  category?: string | null
  budget?: number | null
  price_total?: number | null
  remote?: boolean | null
  address?: string | null
  due_at?: string | null
  images?: any
  created_at?: string | null
}

function firstImage(images: any): string | null {
  try {
    if (!images) return null
    if (Array.isArray(images) && images.length) return images[0]
    if (typeof images === 'string') {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed) && parsed.length) return parsed[0]
    }
  } catch {}
  return null
}

function fmtDate(iso?: string | null) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function MyTasksPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<TaskRow[]>([])

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const uid = data.user?.id
      if (!uid) {
        router.replace('/login?next=/my-tasks')
        return
      }
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('owner', uid)
        .order('created_at', { ascending: false })
      if (error) console.error(error)
      setRows(tasks || [])
      setLoading(false)
    })()
  }, [router])

  const empty = !loading && rows.length === 0

  return (
    <section className="container pb-20 pt-10">
      <h1 className="mb-6 text-2xl font-semibold">Мои задания</h1>

      {loading && <p className="text-sm text-neutral-600">Загружаем…</p>}

      {empty && (
        <div className="rounded border p-5 text-sm text-neutral-600">
          Тут пока пусто. <a className="text-blue-600 underline" href="/post-task">Разместить задание</a>
        </div>
      )}

      {!empty && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((t) => {
            const img = firstImage(t.images)
            return (
              <div key={t.id} className="overflow-hidden rounded border">
                <div className="h-40 w-full bg-neutral-100">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={t.title} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center text-xs text-neutral-500">
                      Без фото
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-3">
                  <div className="line-clamp-1 font-medium">{t.title}</div>
                  <div className="text-sm text-neutral-700">
                    {t.price_total ?? t.budget ?? 0} ₽ • {t.category || 'Другое'}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {t.remote ? 'Удалённо' : (t.address || 'Адрес не указан')}
                    {t.due_at && <> • срок: {fmtDate(t.due_at)}</>}
                  </div>
                  <div className="pt-2">
                    <a
                      href={`/task/${t.id}`}
                      className="inline-block rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      Открыть
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
