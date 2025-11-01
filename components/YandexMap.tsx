'use client'
import {
  YMaps,
  Map,
  Placemark,
  ZoomControl,
  GeolocationControl,
  SearchControl,
} from '@pbe/react-yandex-maps'

type Marker = { id?: string | number; lat: number; lng: number; title?: string; hint?: string }

type Props = {
  center: [number, number]
  zoom?: number
  showSearch?: boolean
  markers?: Marker[]
  className?: string
  onBoundsChange?: (bounds: number[][], center: [number, number], zoom: number) => void
  onClick?: (coords: [number, number]) => void
  draggableMarker?: boolean
  markerOptions?: Record<string, any>
  height?: number
}

export default function YandexMap({
  className,
  center,
  zoom = 10,
  showSearch = false,
  markers = [],
  onBoundsChange,
  onClick,
  draggableMarker = false,
  markerOptions,
  height = 360,
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_API_KEY
  return (
    <div className={`w-full rounded-xl border overflow-hidden ${className ?? ''}`} style={{ height }}>
      <YMaps query={{ apikey: apiKey || undefined, load: 'package.full' }}>
        <Map
          state={{ center, zoom }}
          width="100%"
          height="100%"
          onBoundsChange={(e: any) => {
            if (!onBoundsChange) return
            const map = e.get('target')
            const b = (map.getBounds?.() as number[][] | undefined) ?? []
            const c = (map.getCenter?.() as [number, number]) ?? center
            const z = (map.getZoom?.() as number) ?? zoom
            onBoundsChange(b, c, z)
          }}
          onClick={(e: any) => {
            if (!onClick) return
            const coords = e.get('coords') as [number, number]
            onClick(coords)
          }}
        >
          <ZoomControl options={{ position: { right: 10, top: 10 } }} />
          <GeolocationControl options={{ position: { right: 10, top: 60 } }} />
          {showSearch && <SearchControl options={{ position: { left: 10, top: 10 } }} />}
          {markers.map((m, idx) => (
            <Placemark
              key={m.id ?? `${m.lat}-${m.lng}-${idx}`}
              geometry={[m.lat, m.lng]}
              options={{
                preset: 'islands#dotIcon',
                iconColor: '#22C55E',
                draggable: draggableMarker,
                ...markerOptions,
              }}
              properties={{
                balloonContent: m.title ?? '',
                hintContent: m.hint ?? m.title ?? '',
              }}
              onDragEnd={(e: any) => {
                if (!draggableMarker || !onClick) return
                const coords = e.get('target')?.geometry?.getCoordinates?.() as [number, number]
                if (coords) onClick(coords) // используем тот же колбэк, что и клик
              }}
            />
          ))}
        </Map>
      </YMaps>
    </div>
  )
}
