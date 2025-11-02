'use client'
import YandexMap from './YandexMap'

export default function YandexAddressPicker() {
  return (
    <div className="hidden">
      <YandexMap center={[55.751244, 37.618423]} zoom={10} onBoundsChange={() => {}} />
    </div>
  )
}
