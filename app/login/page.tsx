'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending'); setError(null)

    try {
      const origin = window.location.origin
      const redirectTo = `${origin}/auth/callback?next=/profile`
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })
      if (error) throw error
      setStatus('sent')
    } catch (err: any) {
      setError(err?.message ?? 'Ошибка отправки письма')
      setStatus('error')
    }
  }

  return (
    <div className="container" style={{maxWidth: 720, margin: '40px auto'}}>
      <h1>Войти</h1>
      <form onSubmit={onSubmit}>
        <label className="text-sm">Ваш e-mail</label>
        <input
          className="input"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <button className="btn" disabled={status==='sending'} style={{marginTop: 12}}>
          Получить ссылку для входа
        </button>
      </form>

      {status==='sent' && <p style={{marginTop:12}}>✅ Ссылка отправлена на <b>{email}</b>.</p>}
      {status==='error' && <p style={{marginTop:12, color:'crimson'}}>Ошибка: {error}</p>}
    </div>
  )
}
