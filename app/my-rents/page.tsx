'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

type ItemRow = {
  id: string
  title: string
  description?: string | null
  images?: any
  price_per_day?: number | null
  address?: string | null
  lat?: number | null
  lng?: number | null
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

export default function MyRentalsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<ItemRow[]>([])

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const uid = data.user?.id
      if (!uid) {
        router.replace('/login?next=/my-rentals')
        return
      }
      const q = supabase
        .from('items')
        .select('*')
        .eq('owner', uid)
        .order('created_at', { ascending: false })
      const { data: items, error } = await q
      if (error) console.error(error)
      setRows(items || [])
      setLoading(false)
    })()
  }, [router])

  const empty = !loading && rows.length === 0

  return (
    <section className="container pb-20 pt-10">
      <h1 className="mb-6 text-2xl font-semibold">Мои аренды</h1>

      {loading && <p className="text-sm text-neutral-600">Загружаем…</p>}

      {empty && (
        <div className="rounded border p-5 text-sm text-neutral-600">
          Тут пока пусто. <a className="text-blue-600 underline" href="/post-item">Сдать в аренду</a>
        </div>
      )}

      {!empty && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const img = firstImage(r.images)
            return (
              <a
                key={r.id}
                href={`/item/${r.id}`}
                className="group block overflow-hidden rounded border hover:shadow"
              >
                <div className="h-44 w-full bg-neutral-100">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={r.title} className="h-44 w-full object-cover transition group-hover:scale-[1.02]" />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center text-xs text-neutral-500">
                      Без фото
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-3">
                  <div className="line-clamp-1 font-medium">{r.title}</div>
                  <div className="text-sm text-neutral-600">
                    {r.price_per_day ? `${r.price_per_day} ₽/сутки` : 'Цена не указана'}
                  </div>
                  {r.address && (
                    <div className="line-clamp-1 text-xs text-neutral-500">{r.address}</div>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}
