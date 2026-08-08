import type { EngineResult } from '../types'

export default function ComparisonViz({ result }: { result: EngineResult }) {
  const closest = [...result.ranked, ...result.ineligible].sort((a, b) => a.location.distanceMiles - b.location.distanceMiles)[0]
  const aiPick = result.best
  if (!closest || !aiPick || closest.location.id === aiPick.location.id) return null

  return (
    <div className="card p-4 sm:p-5">
      <h3 className="mb-3 text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
        AI vs. simple distance
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-3.5" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-ink-300)' }}>
            Basic distance algorithm
          </p>
          <p className="mt-1 text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
            {closest.location.name}
          </p>
          <p className="text-[13px]" style={{ color: 'var(--color-ink-500)' }}>
            {closest.location.distanceMiles} mi away — closest option
          </p>
        </div>
        <div className="rounded-lg border-2 p-3.5" style={{ borderColor: 'var(--color-brand-500)', background: 'var(--color-brand-50)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-brand-700)' }}>
            Human-centered AI
          </p>
          <p className="mt-1 text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
            {aiPick.location.name}
          </p>
          <p className="text-[13px]" style={{ color: 'var(--color-ink-500)' }}>
            {aiPick.location.distanceMiles} mi away — {aiPick.score}/100 match
          </p>
        </div>
      </div>
      <p className="mt-3 text-[13px]" style={{ color: 'var(--color-ink-700)' }}>
        The AI isn't just finding the closest place — it's finding the place that actually works for you.
      </p>
    </div>
  )
}
