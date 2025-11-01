'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [phase, setPhase] = useState<'enter' | 'sent'>('enter')
  const [msg, setMsg] = useState('')

  const send = async () => {
    setMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setMsg(error.message)
    else setPhase('sent')
  }

  const verify = async () => {
    setMsg('')
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    if (error) setMsg(error.message)
    else if (data?.session) window.location.href = '/'
  }

  return (
    <section className="container pb-16 pt-10">
      <h1 className="mb-6 text-2xl font-semibold">Войти</h1>
      <div className="flex gap-3">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={send}>
          Получить ссылку / код
        </button>
      </div>

      {phase !== 'enter' && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-neutral-500">Пришёл 6-значный код? Введите ниже:</p>
          <input
            className="w-full rounded border px-3 py-2 tracking-widest"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="rounded border px-4 py-2" onClick={verify}>
            Войти по коду
          </button>
        </div>
      )}

      {msg && <p className="mt-3 text-red-600">{msg}</p>}
    </section>
  )
}
