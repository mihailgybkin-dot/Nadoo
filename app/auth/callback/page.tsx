'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [msg, setMsg] = useState('Завершаем вход…')

  useEffect(() => {
    (async () => {
      try {
        const sp = new URLSearchParams(window.location.search)
        const code = sp.get('code') || sp.get('token_hash')
        const next = sp.get('next') || '/'
        if (!code) { setMsg('Не найден код авторизации'); return }
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
        setMsg('Готово, перенаправляем…')
        router.replace(next)
      } catch (e: any) {
        setMsg('Не удалось завершить вход: ' + (e?.message || 'ошибка'))
      }
    })()
  }, [router])

  return (
    <section className="container max-w-xl pb-16 pt-10">
      <h1 className="mb-4 text-xl font-semibold">Вход</h1>
      <p className="text-sm text-neutral-700">{msg}</p>
    </section>
  )
}
