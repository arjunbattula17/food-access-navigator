import { useEffect, useState } from 'react'

const FACTORS = ['Transportation', 'Distance', 'Hours', 'Wait time', 'Capacity', 'Food availability', 'Accessibility']

export default function AnalyzingScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    if (visible >= FACTORS.length) {
      const t = setTimeout(onDone, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setVisible((v) => v + 1), 220)
    return () => clearTimeout(t)
  }, [visible, onDone])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="pulse relative flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'var(--color-brand-100)' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-brand-600)' }}>
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="mt-6 text-xl font-semibold" style={{ color: 'var(--color-ink-900)' }}>
        Finding the best food-access options near you…
      </h1>
      <p className="mt-1.5 text-sm" style={{ color: 'var(--color-ink-500)' }}>
        Weighing every location against your specific situation.
      </p>

      <div className="mt-8 w-full space-y-2.5 text-left">
        {FACTORS.map((f, i) => (
          <div
            key={f}
            className="flex items-center gap-3 rounded-lg border px-3.5 py-2.5 fade-up"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
              opacity: i < visible ? 1 : 0.35,
            }}
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              style={{
                background: i < visible ? 'var(--color-good-100)' : 'var(--color-border)',
                color: i < visible ? 'var(--color-good-600)' : 'transparent',
              }}
            >
              {i < visible ? '✓' : ''}
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-ink-700)' }}>
              {f}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
