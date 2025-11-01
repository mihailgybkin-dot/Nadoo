'use client'
import GlobalSearch from './GlobalSearch'


export default function Hero() {
return (
<section className="container py-12 text-center">
<h1 className="text-5xl font-semibold tracking-tight md:text-6xl">Nadoo</h1>
<p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600">Сервис аренды вещей и выполнения заданий рядом с вами. Безопасные сделки, прозрачные условия, удобная карта.</p>
<div className="mt-6"><GlobalSearch /></div>
</section>
)
}
