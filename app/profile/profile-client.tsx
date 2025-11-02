// app/profile/profile-client.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Props = {
  user: { id: string; email: string }
  initialProfile: {
    full_name: string
    phone: string
    avatar_url: string
    currency: string
    language: string
  }
}

export default function ProfileClient({ user, initialProfile }: Props) {
  const supabase = createClientComponentClient()
  const [fullName, setFullName] = useState(initialProfile.full_name)
  const [phone, setPhone] = useState(initialProfile.phone)
  const [currency, setCurrency] = useState(initialProfile.currency)
  const [language, setLanguage] = useState(initialProfile.language)
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const uploadAvatar = async (file: File) => {
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('nadoo-files')       // твой бакет
      .upload(path, file, { upsert: true })

    if (error) throw error

    const { data } = supabase.storage.from('nadoo-files').getPublicUrl(path)
    return data.publicUrl
  }

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setMsg(null)
      const publicUrl = await uploadAvatar(file)
      setAvatarUrl(publicUrl)
    } catch (err: any) {
      setMsg(err?.message ?? 'Ошибка загрузки файла')
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    setMsg(null)
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        phone,
        currency,
        language,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      if (error) throw error
      setMsg('Сохранено ✅')
    } catch (err: any) {
      setMsg(err?.message ?? 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="grid" style={{display:'grid', gridTemplateColumns:'280px 1fr', gap:24}}>
      <div className="card" style={{padding:16}}>
        <div style={{display:'flex', flexDirection:'column', gap:12, alignItems:'center'}}>
          <div style={{width:140, height:140, position:'relative', borderRadius:'9999px', overflow:'hidden', background:'#f1f1f1'}}>
            {avatarUrl ? (
              <Image src={avatarUrl} alt="avatar" fill style={{objectFit:'cover'}} />
            ) : (
              <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%'}}>
                <span style={{fontSize:48}}>{user.email[0]?.toUpperCase()}</span>
              </div>
            )}
          </div>
          <label className="btn" style={{cursor:'pointer'}}>
            Загрузить фото
            <input type="file" accept="image/*" hidden onChange={onAvatarChange}/>
          </label>
          <button className="btn" onClick={logout}>Выйти</button>
        </div>
      </div>

      <div className="card" style={{padding:16}}>
        <div style={{display:'grid', gap:12}}>
          <div>
            <label className="text-sm">Имя</label>
            <input className="input" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
          </div>

          <div>
            <label className="text-sm">Телефон</label>
            <input className="input" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          </div>

          <div>
            <label className="text-sm">E-mail</label>
            <input className="input" value={user.email} disabled />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div>
              <label className="text-sm">Валюта</label>
              <select className="input" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
                <option value="RUB">RUB</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Язык</label>
              <select className="input" value={language} onChange={(e)=>setLanguage(e.target.value)}>
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div style={{display:'flex', gap:8}}>
            <a className="btn" href="/my-rentals">Мои аренды</a>
            <a className="btn" href="/my-tasks">Мои задания</a>
            <button className="btn" onClick={saveProfile} disabled={saving}>
              {saving ? 'Сохраняю…' : 'Сохранить'}
            </button>
          </div>

          {msg && <div style={{color: msg.includes('✅') ? 'green' : 'crimson'}}>{msg}</div>}
        </div>
      </div>
    </div>
  )
}
