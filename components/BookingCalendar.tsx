'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Props = { itemId: string; pricePerDay: number }
type Range = { from?: Date; to?: Date }

export default function BookingCalendar({ itemId, pricePerDay }: Props) {
  const supabase = createClientComponentClient()
  const [range, setRange] = useState<Range>({})
  const [disabledDays, setDisabledDays] = useState<Date[]>([])

  // Посчитаем количество суток
  const nights = useMemo(() => {
    if (!range.from || !range.to) return 0
    const ms = range.to.getTime() - range.from.getTime()
    return Math.max(0, Math.ceil(ms / 86400000))
  }, [range])

  // Подтягиваем занятые дни
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('bookings')
        .select('date_range')
        .eq('item_id', itemId)
      const blocks = (data ?? []).flatMap((r: any) => {
        const m = /([0-9]{4}-[0-9]{2}-[0-9]{2}),([0-9]{4}-[0-9]{2}-[0-9]{2})/.exec(r.date_range)
        if (!m) return []
        const start = new Date(m[1] + 'T00:00:00')
        const end = new Date(m[2] + 'T00:00:00')
        const days: Date[] = []
        for (let d = new Date(start); d < end; d = new Date(d.getTime() + 86400000)) {
          days.push(new Date(d))
        }
        return days
      })
      setDisabledDays(blocks)
    })()
  }, [itemId]) // eslint-disable-line

  // Простой «календарь» без внешней библиотеки (минимальный, чтобы не падал билд)
  // Для клика по датам используем два инпута типа date
  const [fromStr, setFromStr] = useState('')
  const [toStr, setToStr] = useState('')
  useEffect(() => {
    const from = fromStr ? new Date(fromStr + 'T00:00:00') : undefined
    const to = toStr ? new Date(toStr + 'T00:00:00') : undefined
    setRange({ from, to })
  }, [fromStr, toStr])

  const total = nights * pricePerDay

  async function createBooking() {
    if (!range.from || !range.to) return
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return alert('Войдите, чтобы оформить бронирование')
    const start = range.from.toISOString().slice(0, 10)
    const end = range.to.toISOString().slice(0, 10)
    const daterange = `[${start},${end})`
    const { error } = await supabase
      .from('bookings')
      .insert({ item_id: itemId, renter: user.id, date_range: daterange })
    if (error) alert(error.message)
    else alert('Запрос отправлен! Владелец подтвердит бронирование.')
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-sm text-neutral-500">Дата начала</div>
          <input
            type="date"
            value={fromStr}
            onChange={(e) => setFromStr(e.target.value)}
            className="w-full rounded border px-3 py-2"
            min={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div>
          <div className="text-sm text-neutral-500">Дата окончания</div>
          <input
            type="date"
            value={toStr}
            onChange={(e) => setToStr(e.target.value)}
            className="w-full rounded border px-3 py-2"
            min={fromStr || new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-500">Суток</div>
          <div className="text-lg font-semibold">{nights}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-neutral-500">Итого</div>
          <div className="text-xl font-bold">{total.toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      <button
        onClick={createBooking}
        disabled={!nights}
        className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white disabled:opacity-50"
      >
        Отправить запрос
      </button>

      {/* Пояснение: занятые дни подтягиваются, но визуально не подсвечиваются в этом простом UI */}
      {disabledDays.length > 0 && (
        <p className="mt-3 text-xs text-neutral-500">
          Занятых дней: {disabledDays.length}. Блокировку пересечений обеспечивает БД (констрейнт).
        </p>
      )}
    </div>
  )
}
