'use client'

import { useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'nadoo-files'

export default function AvatarUploader({
  uid,
  avatarUrl,
  onUploaded,
}: {
  uid: string
  avatarUrl?: string
  onUploaded: (publicUrl: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [up, setUp] = useState(false)

  const src = useMemo(() => {
    return avatarUrl || 'https://placehold.co/96x96/png?text=%20'
  }, [avatarUrl])

  const pick = () => inputRef.current?.click()

  const upload = async (file: File) => {
    setUp(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `avatars/${uid}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, cacheControl: '3600' })
      if (error) throw error
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      onUploaded(data.publicUrl)
    } catch (e: any) {
      alert('Не удалось загрузить аватар: ' + (e?.message || 'ошибка'))
    } finally {
      setUp(false)
    }
  }

  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="avatar"
        className="h-16 w-16 rounded-full object-cover ring-2 ring-white cursor-pointer"
        onClick={pick}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0]
          if (f) upload(f)
          e.currentTarget.value = ''
        }}
      />
      {up && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-xs text-white">
          …
        </div>
      )}
    </div>
  )
}
