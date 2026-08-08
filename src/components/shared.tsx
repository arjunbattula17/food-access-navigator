import type { FactorScore } from '../types'

export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = ((h + 11) % 12) + 1
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

export const RATING_COLORS: Record<FactorScore['rating'], { fg: string; bg: string; dot: string }> = {
  excellent: { fg: 'var(--color-good-600)', bg: 'var(--color-good-100)', dot: '🟢' },
  good: { fg: 'var(--color-good-600)', bg: 'var(--color-good-100)', dot: '🟢' },
  fair: { fg: 'var(--color-warn-600)', bg: 'var(--color-warn-100)', dot: '🟡' },
  poor: { fg: 'var(--color-bad-600)', bg: 'var(--color-bad-100)', dot: '🔴' },
}

export function RatingTag({ rating, label }: { rating: FactorScore['rating']; label: string }) {
  const c = RATING_COLORS[rating]
  return (
    <span className="tag" style={{ background: c.bg, color: c.fg }}>
      <span>{c.dot}</span>
      {label}
    </span>
  )
}

export function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score)) / 100
  const color = score >= 80 ? 'var(--color-good-600)' : score >= 55 ? 'var(--color-warn-600)' : 'var(--color-bad-600)'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-border)" strokeWidth={6} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={6}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.28} fontWeight={700} fill="var(--color-ink-900)">
        {score}
      </text>
    </svg>
  )
}
