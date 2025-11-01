'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'


type Props = { itemId: string; pricePerDay: number }


type Range = { from?: Date; to?: Date }


export default function BookingCalendar({ itemId, pricePerDay }: Props) {
const supabase = createClientComponentClient()
const [range, setRange] = useState<Range>({})
const [disabled, setDisabled] = useState<any[]>([])
const nights = useMemo(() => {
if (!range.from || !range.to) return 0
return Math.ceil((range.to.getTime() - range.from.getTime()) / 86400000)
}, [range])


useEffect(() => {
supabase
.from('bookings')
.select('date_range')
.eq('item_id', itemId)
.then(({ data }) => {
const blocks = (data ?? []).flatMap((r: any) => {
const m = /([0-9]{4}-[0-9]{2}-[0-9]{2}),([0-9]{4}-[0-9]{2}-[0-9]{2})/.exec(r.date_range)
if (!m) return []
const start = new Date(m[1] + 'T00:00:00')
const end = new Date(m[2] + 'T00:00:00')
const days: Date[] = []
for (let d = new Date(start); d < end; d = new Date(d.getTime() + 86400000)) days.push(new Date(d))
return days
})
setDisabled([{ before: new Date() }, ...blocks])
})
}, [itemId])


const total = nights * pricePerDay


async function createBooking() {
if (!range.from || !range.to) return
const renter = (await supabase.auth.getUser()).data.user?.id
if (!renter) return alert('Войдите, чтобы оформить бронирование')
const start = range.from.toISOString().slice(0, 10)
const end = range.to.toISOString().slice(0, 10)
const daterange = `[${start},${end})`
const { error } = await supabase.from('bookings').insert({ item_id: itemId, renter, date_range: daterange })
if (error) alert(error.message)
else alert('Запрос отправлен! Владелец подтвердит бронирование.')
}


return (
<div className="rounded-2xl border p-4">
<DayPicker mode="range" selected={range} onSelect={(r) => setRange(r ?? {})} disabled={disabled} numberOfMonths={2} weekStartsOn={1} fromDate={new Date()} />
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
<button onClick={createBooking} disabled={!nights} className="btn-brand mt-4 w-full disabled:opacity-50">Отправить запрос</button>
</div>
)
}
