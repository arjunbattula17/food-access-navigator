import type { Recommendation } from '../types'
import { ScoreRing, formatClock } from './shared'

const FOOD_ICON: Record<string, string> = {
  canned: '🥫',
  produce: '🍎',
  dairy: '🥛',
  bread: '🍞',
  meat: '🍗',
  baby: '🍼',
}

export default function BestPick({
  rec,
  onViewDetails,
  onSeeOthers,
  changed,
}: {
  rec: Recommendation
  onViewDetails: () => void
  onSeeOthers: () => void
  changed?: boolean
}) {
  const loc = rec.location
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`

  return (
    <div className="card overflow-hidden fade-up">
      <div className="flex items-start justify-between gap-3 border-b p-4 sm:p-5" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <span className="tag" style={{ background: 'var(--color-good-100)', color: 'var(--color-good-600)' }}>
            🥇 Best option
          </span>
          <h2 className="mt-2 text-xl font-semibold sm:text-2xl" style={{ color: 'var(--color-ink-900)' }}>
            📍 {loc.name}
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--color-ink-500)' }}>
            {loc.neighborhood} · {loc.distanceMiles} mi away
          </p>
        </div>
        <ScoreRing score={rec.score} />
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">
        <Stat label="Match" value={`${rec.score}/100`} />
        <Stat label="Est. wait" value={`${loc.waitMinutes} min`} />
        <Stat label="Distance" value={`${loc.distanceMiles} mi`} />
        <Stat label="Open until" value={formatClock(loc.closeMinutes)} />
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <p className="mb-2 text-[13px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
          Why we recommend it
        </p>
        <ul className="space-y-1.5">
          {rec.shortReasons.map((r) => (
            <li key={r} className="flex items-start gap-2 text-[13.5px]" style={{ color: 'var(--color-ink-700)' }}>
              <span style={{ color: 'var(--color-good-600)' }}>✓</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 pb-4 sm:px-5">
        {loc.inventory.map((i) => (
          <span
            key={i.category}
            className="tag normal-case"
            style={{
              background: i.status === 'unavailable' ? 'var(--color-bad-100)' : i.status === 'limited' ? 'var(--color-warn-100)' : 'var(--color-good-100)',
              color: i.status === 'unavailable' ? 'var(--color-bad-600)' : i.status === 'limited' ? 'var(--color-warn-600)' : 'var(--color-good-600)',
            }}
          >
            {FOOD_ICON[i.category]} {i.category}
            {i.status === 'limited' ? ' · limited' : i.status === 'unavailable' ? ' · out' : ''}
          </span>
        ))}
      </div>

      {changed && (
        <div className="mx-4 mb-4 rounded-lg px-3.5 py-2.5 text-[13px] font-medium sm:mx-5" style={{ background: 'var(--color-warn-100)', color: 'var(--color-warn-600)' }}>
          ⚡ Recommendation changed based on new information — see details below.
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 border-t p-4 sm:grid-cols-3 sm:p-5" style={{ borderColor: 'var(--color-border)' }}>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring col-span-1 rounded-xl py-3.5 text-center text-[15px] font-semibold text-white sm:col-span-1"
          style={{ background: 'var(--color-brand-600)' }}
        >
          Get Directions
        </a>
        <a
          href={`tel:${loc.phone.replace(/[^\d+]/g, '')}`}
          className="focus-ring rounded-xl border py-3.5 text-center text-[15px] font-semibold"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-ink-700)' }}
        >
          Call Location
        </a>
        <button
          onClick={onViewDetails}
          className="focus-ring rounded-xl border py-3.5 text-center text-[15px] font-semibold"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-ink-700)' }}
        >
          View Details
        </button>
      </div>
      <div className="px-4 pb-4 sm:px-5">
        <button onClick={onSeeOthers} className="focus-ring text-[13.5px] font-medium underline underline-offset-2" style={{ color: 'var(--color-brand-600)' }}>
          See other options
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2.5" style={{ background: 'var(--color-canvas)' }}>
      <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--color-ink-300)' }}>
        {label}
      </p>
      <p className="mt-0.5 text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
        {value}
      </p>
    </div>
  )
}
