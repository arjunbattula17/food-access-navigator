import { useState } from 'react'
import type { EngineResult, FoodLocation, Situation, Transportation } from '../types'
import { runRecommendationEngine } from '../engine/recommend'

const OPTIONS: { value: Transportation; label: string; icon: string }[] = [
  { value: 'car', label: 'Car', icon: '🚗' },
  { value: 'transit', label: 'Transit', icon: '🚌' },
  { value: 'walk', label: 'Walking', icon: '🚶' },
  { value: 'none', label: 'No transportation', icon: '🚫' },
]

export default function WhatIfPanel({ situation, locations, actual }: { situation: Situation; locations: FoodLocation[]; actual: EngineResult }) {
  const [transportation, setTransportation] = useState<Transportation>(situation.transportation)
  const whatIf = runRecommendationEngine(locations, { ...situation, transportation })
  const changed = whatIf.best?.location.id !== actual.best?.location.id

  return (
    <div className="card p-4 sm:p-5">
      <h3 className="text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
        What if…?
      </h3>
      <p className="mt-0.5 text-[13px]" style={{ color: 'var(--color-ink-500)' }}>
        Change one thing and see how the recommendation adapts.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTransportation(opt.value)}
            className="focus-ring rounded-lg border px-3 py-2 text-[13px] font-medium"
            style={{
              borderColor: transportation === opt.value ? 'var(--color-brand-500)' : 'var(--color-border)',
              background: transportation === opt.value ? 'var(--color-brand-50)' : 'var(--color-surface)',
              color: transportation === opt.value ? 'var(--color-brand-700)' : 'var(--color-ink-700)',
            }}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-lg p-3" style={{ background: changed ? 'var(--color-warn-100)' : 'var(--color-good-100)' }}>
        <span className="text-xl">{changed ? '🔄' : '✓'}</span>
        <div>
          <p className="text-[13px] font-semibold" style={{ color: changed ? 'var(--color-warn-600)' : 'var(--color-good-600)' }}>
            {changed ? 'Your recommendation would change' : 'Recommendation stays the same'}
          </p>
          <p className="text-[13px]" style={{ color: 'var(--color-ink-700)' }}>
            {whatIf.best ? `🥇 ${whatIf.best.location.name} — ${whatIf.best.score}/100` : 'No eligible location for this scenario.'}
          </p>
        </div>
      </div>
    </div>
  )
}
