'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function StorageDebug() {
  const [log, setLog] = useState<string>('Проверяем...')

  useEffect(() => {
    (async () => {
      try {
        const bucketEnv = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || '(нет)'
        const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL || '(нет)'
        let text = `BUCKET (env): ${bucketEnv}\nSUPABASE_URL: ${urlEnv}\n\n`

        // 1) Список бакетов, которые видит сайт
        const list = await supabase.storage.listBuckets()
        if ('error' in list && list.error) {
          text += `listBuckets error: ${list.error.message}\n`
        } else {
          text += 'Buckets:\n' + list.data.map(b => ` - ${b.name}`).join('\n') + '\n\n'
        }

        // 2) Проба загрузки маленького файла в указанный бакет
        const blob = new Blob([`test ${Date.now()}`], { type: 'text/plain' })
        const bucket = bucketEnv === '(нет)' ? 'nadoo-files' : bucketEnv
        const path = `items/debug/test-${Date.now()}.txt`
        const up = await supabase.storage.from(bucket).upload(path, blob, { upsert: true })

        if (up.error) {
          text += `upload error: ${up.error.message}\n(bucket used: ${bucket})\n`
        } else {
          text += `upload ok → ${bucket}/${path}\n`
        }
        setLog(text)
      } catch (e: any) {
        setLog('Fatal error: ' + (e?.message || e))
      }
    })()
  }, [])

  return (
    <pre className="whitespace-pre-wrap p-4 text-sm">{log}</pre>
  )
}
