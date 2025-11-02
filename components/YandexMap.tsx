'use client'
import { YMaps, Map, Placemark, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps'

type Marker = { id?: string|number; lat: number; lng: number; title?: string; hint?: string }

type Props = {
  center: [number, number]
  zoom?: number
  markers?: Marker[]
  className?: string
  onBoundsChange?: (bounds: number[][], center: [number, number], zoom: number) => void
  onClick?: (coords: [number, number]) => void
  draggableMarker?: boolean
  markerOptions?: Record<string, any>
  height?: number
}

export default function YandexMap({
  center, zoom = 12, markers = [], onBoundsChange, onClick,
  draggableMarker = false, markerOptions, height = 360, className
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_API_KEY
  return (
    <div className={`w-full overflow-hidden rounded-xl border ${className || ''}`} style={{ height }}>
      <YMaps query={{ apikey: apiKey || undefined, load: 'package.full' }}>
        <Map
          state={{ center, zoom }}
          width="100%" height="100%"
          onBoundsChange={(e:any)=> {
            if (!onBoundsChange) return
            const map = e.get('target')
            onBoundsChange(map.getBounds?.() ?? [], map.getCenter?.() ?? center, map.getZoom?.() ?? zoom)
          }}
          onClick={(e:any)=> onClick?.(e.get('coords') as [number, number])}
        >
          <ZoomControl options={{ position: { right: 10, top: 10 } }} />
          <GeolocationControl options={{ position: { right: 10, top: 60 } }} />
          {markers.map((m, i)=>(
            <Placemark
              key={m.id ?? i}
              geometry={[m.lat, m.lng]}
              options={{ preset: 'islands#dotIcon', iconColor: '#22C55E', draggable: draggableMarker, ...markerOptions }}
              properties={{ balloonContent: m.title ?? '', hintContent: m.hint ?? m.title ?? '' }}
              onDragEnd={(e:any)=> {
                if (!draggableMarker || !onClick) return
                const coords = e.get('target')?.geometry?.getCoordinates?.() as [number, number]
                if (coords) onClick(coords)
              }}
            />
          ))}
        </Map>
      </YMaps>
    </div>
  )
}
