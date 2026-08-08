const METRICS = [
  { label: 'People successfully matched', value: '1,248' },
  { label: 'Average wait reduced', value: '23 min' },
  { label: 'Successful matches', value: '94%' },
  { label: 'Transportation-compatible recs', value: '91%' },
  { label: 'Unnecessary trips avoided', value: '187' },
]

export default function ImpactDashboard() {
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
          Impact so far
        </h3>
        <span className="tag" style={{ background: 'var(--color-border)', color: 'var(--color-ink-500)' }}>
          Simulated demo metrics
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-lg p-3" style={{ background: 'var(--color-canvas)' }}>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-brand-700)' }}>
              {m.value}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-tight" style={{ color: 'var(--color-ink-500)' }}>
              {m.label}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11.5px]" style={{ color: 'var(--color-ink-300)' }}>
        Illustrative figures for demo purposes — not official Houston Food Bank statistics.
      </p>
    </div>
  )
}
