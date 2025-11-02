'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function AuthCallbackPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const next = sp.get('next') || '/'
  const [msg, setMsg] = useState('Завершаем вход…')

  useEffect(() => {
    const code = sp.get('code') || sp.get('token_hash') // поддержим оба варианта
    if (!code) {
      setMsg('Не найден код авторизации')
      return
    }
    ;(async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
        setMsg('Готово, перенаправляем…')
        router.replace(next)
      } catch (e: any) {
        setMsg('Не удалось завершить вход: ' + (e?.message || 'ошибка'))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="container max-w-xl pb-16 pt-10">
      <h1 className="mb-4 text-xl font-semibold">Вход</h1>
      <p className="text-sm text-neutral-700">{msg}</p>
    </section>
  )
}
