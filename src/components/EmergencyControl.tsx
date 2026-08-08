export default function EmergencyControl({ triggered, onTrigger }: { triggered: boolean; onTrigger: () => void }) {
  if (triggered) {
    return (
      <div className="card fade-up p-4" style={{ background: 'var(--color-warn-100)', borderColor: 'var(--color-warn-600)' }}>
        <p className="text-[13px] font-semibold" style={{ color: 'var(--color-warn-600)' }}>
          🚨 Major location closed — conditions changed
        </p>
        <p className="mt-1 text-[13px]" style={{ color: 'var(--color-ink-700)' }}>
          A nearby food-distribution site closed unexpectedly. The AI has automatically recalculated every recommendation below.
        </p>
      </div>
    )
  }
  return (
    <button
      onClick={onTrigger}
      className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-[13.5px] font-semibold transition"
      style={{ borderColor: 'var(--color-warn-600)', color: 'var(--color-warn-600)' }}
    >
      ⚡ Simulate Emergency (demo)
    </button>
  )
}
