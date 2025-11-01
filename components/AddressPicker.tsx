'use client'
const inputId = useMemo(() => `addr-${Math.random().toString(36).slice(2)}`,[ ])


// Вешаем SuggestView, если доступен ymaps
useEffect(() => {
const ymaps = window.ymaps
const el = document.getElementById(inputId)
if (!ymaps || !el || !ymaps.SuggestView) return
const suggest = new ymaps.SuggestView(inputId, { results: 7 })
suggest.events.add('select', async (e: any) => {
const v = e.get('item')?.value as string
if (!v) return
try {
const res = await ymaps.geocode(v)
const first = res.geoObjects.get(0)
if (!first) return
const c = first.geometry.getCoordinates() as [number, number]
onPick?.({ address: v, lat: c[0], lng: c[1] })
} catch {}
})
return () => suggest?.destroy?.()
}, [inputId, onPick])


// Нажали Enter — геокодим
const handleEnter: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
if (e.key !== 'Enter') return
const val = (e.target as HTMLInputElement).value.trim()
if (!val) return
const ymaps = window.ymaps
try {
if (ymaps?.geocode) {
const res = await ymaps.geocode(val)
const first = res.geoObjects.get(0)
const c = first?.geometry?.getCoordinates?.() as [number, number] | undefined
if (c) return onPick?.({ address: val, lat: c[0], lng: c[1] })
}
// Фолбэк на HTTP геокодер Яндекса
const key = process.env.NEXT_PUBLIC_YANDEX_API_KEY
const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${key}&format=json&geocode=${encodeURIComponent(val)}`
const j = await fetch(url).then((r) => r.json())
const p = j?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point?.pos as string | undefined
if (p) {
const [lng, lat] = p.split(' ').map(Number)
onPick?.({ address: val, lat, lng })
}
} catch {}
}


return (
<input
id={inputId}
ref={inputRef}
className="input"
placeholder={placeholder}
defaultValue={value}
onChange={(e) => onChange?.(e.target.value)}
onKeyDown={handleEnter}
autoComplete="off"
/>
)
}
