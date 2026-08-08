import { useMemo, useState } from 'react'
import type { Recommendation } from '../types'
import { formatClock } from './shared'

interface Props {
  all: Recommendation[]
  bestId: string | null
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function MapView({ all, bestId, selectedId, onSelect }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  // Fixed bbox around the Houston metro area (centered near 29.7507, -95.4106)
  // so pins line up with the real OpenStreetMap tiles below them.
  const bounds = useMemo(
    () => ({
      minLat: 29.6,
      maxLat: 30.04,
      minLng: -95.62,
      maxLng: -95.2,
    }),
    [],
  )
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bounds.minLng}%2C${bounds.minLat}%2C${bounds.maxLng}%2C${bounds.maxLat}&layer=mapnik`

  function pos(lat: number, lng: number) {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100
    const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100
    return { left: `${x}%`, top: `${y}%` }
  }

  const active = all.find((r) => r.location.id === openId)

  return (
    <div className="card relative overflow-hidden">
      <div className="relative h-64 w-full sm:h-80">
        <iframe
          title="OpenStreetMap of the Houston area"
          src={osmSrc}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
        />
        {all.map((r) => {
          const loc = r.location
          const isBest = loc.id === bestId
          const color = !r.eligible ? 'var(--color-bad-600)' : isBest ? 'var(--color-good-600)' : 'var(--color-warn-600)'
          const p = pos(loc.lat, loc.lng)
          const isSelected = selectedId === loc.id
          return (
            <button
              key={loc.id}
              aria-label={loc.name}
              onClick={() => {
                setOpenId(loc.id)
                onSelect(loc.id)
              }}
              className="focus-ring absolute -translate-x-1/2 -translate-y-full transition"
              style={{ left: p.left, top: p.top, zIndex: isSelected ? 20 : 10 }}
            >
              <div
                className="flex items-center justify-center rounded-full text-[13px] font-bold text-white shadow-md"
                style={{
                  width: isSelected ? 30 : 24,
                  height: isSelected ? 30 : 24,
                  background: color,
                  border: '2px solid white',
                }}
              >
                {isBest ? '★' : ''}
              </div>
            </button>
          )
        })}

        <div className="absolute bottom-2 left-2 flex gap-3 rounded-lg px-2.5 py-1.5 text-[11px]" style={{ background: 'rgba(255,255,255,0.9)' }}>
          <Legend color="var(--color-good-600)" label="Best match" />
          <Legend color="var(--color-warn-600)" label="Alternative" />
          <Legend color="var(--color-bad-600)" label="Unavailable" />
        </div>
      </div>

      {active && (
        <div className="border-t p-4 fade-up" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
              {active.location.name}
            </p>
            <button onClick={() => setOpenId(null)} className="focus-ring text-sm" style={{ color: 'var(--color-ink-300)' }} aria-label="Close">
              ✕
            </button>
          </div>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--color-ink-500)' }}>
            {active.location.distanceMiles} mi · {active.eligible ? `Open until ${formatClock(active.location.closeMinutes)}` : 'Not available for this trip'} · ⏱️ {active.location.waitMinutes} min wait
          </p>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--color-ink-500)' }}>
            {active.location.transitAccessible ? '🚌 Transit accessible' : '🚫 No direct transit'} · {active.eligible ? `Match ${active.score}/100` : 'Currently unavailable'}
          </p>
        </div>
      )}
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1" style={{ color: 'var(--color-ink-700)' }}>
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}
