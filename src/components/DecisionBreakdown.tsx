import type { Recommendation } from '../types'
import { RATING_COLORS } from './shared'

export default function DecisionBreakdown({ rec }: { rec: Recommendation }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
          Why {rec.location.name}?
        </h3>
        <span className="text-xs font-medium" style={{ color: 'var(--color-ink-300)' }}>
          {rec.score}/100
        </span>
      </div>

      <div className="space-y-3">
        {rec.factors.map((f) => {
          const c = RATING_COLORS[f.rating]
          const pct = Math.round((f.points / f.maxPoints) * 100)
          return (
            <div key={f.key}>
              <div className="mb-1 flex items-baseline justify-between text-[13px]">
                <span className="font-medium" style={{ color: 'var(--color-ink-700)' }}>
                  {f.label}
                </span>
                <span style={{ color: c.fg }} className="font-semibold">
                  {f.points}/{f.maxPoints}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
                <div className="bar-grow h-full rounded-full" style={{ width: `${pct}%`, background: c.fg }} />
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-300)' }}>
                {f.detail}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-4 rounded-lg p-3.5 text-[13px] leading-relaxed" style={{ background: 'var(--color-brand-50)', color: 'var(--color-ink-700)' }}>
        {rec.explanation}
      </div>
    </div>
  )
}
