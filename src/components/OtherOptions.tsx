import type { Recommendation } from '../types'
import { RatingTag } from './shared'

export default function OtherOptions({
  ranked,
  ineligible,
  selectedId,
  onSelect,
}: {
  ranked: Recommendation[]
  ineligible: Recommendation[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const alternatives = ranked.slice(1)
  if (alternatives.length === 0 && ineligible.length === 0) return null

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
        Other options
      </h3>
      <div className="space-y-3">
        {alternatives.map((rec, i) => {
          const t = rec.factors.find((f) => f.key === 'transportation')!
          const w = rec.factors.find((f) => f.key === 'wait')!
          return (
            <button
              key={rec.location.id}
              onClick={() => onSelect(rec.location.id)}
              className="focus-ring w-full rounded-xl border p-4 text-left transition"
              style={{
                borderColor: selectedId === rec.location.id ? 'var(--color-brand-500)' : 'var(--color-border)',
                background: 'var(--color-surface)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
                  {i + 2} — {rec.location.name}
                </span>
                <span className="tag" style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-700)' }}>
                  {rec.score}/100
                </span>
              </div>
              <p className="mt-1 text-[13px]" style={{ color: 'var(--color-ink-500)' }}>
                {rec.location.distanceMiles} mi away · ⏱️ {rec.location.waitMinutes} min wait
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <RatingTag rating={t.rating} label={t.detail.startsWith('No') || t.rating === 'poor' ? 'Transportation is difficult' : 'Transportation works'} />
                <RatingTag rating={w.rating} label={`${rec.location.waitMinutes} min wait`} />
              </div>
              <p className="mt-2 text-[13px] italic" style={{ color: 'var(--color-ink-500)' }}>
                {rec.explanation}
              </p>
            </button>
          )
        })}

        {ineligible.map((rec) => (
          <div key={rec.location.id} className="rounded-xl border border-dashed p-4 opacity-80" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold" style={{ color: 'var(--color-ink-500)' }}>
                {rec.location.name}
              </span>
              <span className="tag" style={{ background: 'var(--color-bad-100)', color: 'var(--color-bad-600)' }}>
                🔴 Not available
              </span>
            </div>
            <p className="mt-1.5 text-[13px]" style={{ color: 'var(--color-ink-500)' }}>
              {rec.ineligibleReasons.join(' ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
