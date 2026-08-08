import { useState } from 'react'
import type { AccessibilityNeed, FoodCategory, Situation, TimeWindow, Transportation } from '../types'

const TRANSPORT_OPTIONS: { value: Transportation; label: string; icon: string }[] = [
  { value: 'car', label: 'Car', icon: '🚗' },
  { value: 'transit', label: 'Public Transit', icon: '🚌' },
  { value: 'walk', label: 'Walking', icon: '🚶' },
  { value: 'bike', label: 'Bike', icon: '🚲' },
  { value: 'rideshare', label: 'Rideshare / Other', icon: '🚕' },
  { value: 'none', label: 'No transportation', icon: '🚫' },
]

const TIME_WINDOWS: TimeWindow[] = [
  { label: 'Today, 9 AM – 11 AM', startMinutes: 9 * 60, endMinutes: 11 * 60 },
  { label: 'Today, 11 AM – 1 PM', startMinutes: 11 * 60, endMinutes: 13 * 60 },
  { label: 'Today, 1 PM – 4 PM', startMinutes: 13 * 60, endMinutes: 16 * 60 },
  { label: 'Today, 4 PM – 6 PM', startMinutes: 16 * 60, endMinutes: 18 * 60 },
]

const ACCESSIBILITY_OPTIONS: { value: AccessibilityNeed; label: string }[] = [
  { value: 'wheelchair', label: 'Wheelchair accessible' },
  { value: 'limited_mobility', label: 'Limited mobility' },
  { value: 'accessible_entrance', label: 'Need accessible entrance' },
  { value: 'language_assistance', label: 'Need language assistance' },
]

const FOOD_OPTIONS: { value: FoodCategory; label: string; icon: string }[] = [
  { value: 'canned', label: 'Canned goods', icon: '🥫' },
  { value: 'produce', label: 'Produce', icon: '🍎' },
  { value: 'dairy', label: 'Dairy', icon: '🥛' },
  { value: 'bread', label: 'Bread', icon: '🍞' },
  { value: 'meat', label: 'Meat', icon: '🍗' },
  { value: 'baby', label: 'Baby items', icon: '🍼' },
]

interface Props {
  onSubmit: (situation: Situation) => void
  initial?: Situation
}

export default function SituationForm({ onSubmit, initial }: Props) {
  const [locationLabel, setLocationLabel] = useState(initial?.locationLabel ?? 'Southwest Houston')
  const [zip, setZip] = useState(initial?.zip ?? '77074')
  const [householdSize, setHouseholdSize] = useState(initial?.householdSize ?? 3)
  const [transportation, setTransportation] = useState<Transportation>(initial?.transportation ?? 'car')
  const [timeWindowIdx, setTimeWindowIdx] = useState(3)
  const [needs, setNeeds] = useState<AccessibilityNeed[]>(initial?.accessibilityNeeds ?? [])
  const [neededFood, setNeededFood] = useState<FoodCategory | null>(initial?.neededFood ?? null)

  function toggleNeed(need: AccessibilityNeed) {
    setNeeds((prev) => (prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      locationLabel,
      zip,
      householdSize,
      transportation,
      timeWindow: TIME_WINDOWS[timeWindowIdx],
      accessibilityNeeds: needs.length ? needs : ['none'],
      neededFood,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl px-4 pb-28 pt-6 sm:pt-10">
      <div className="mb-8 fade-up">
        <span className="tag bg-brand-100 text-brand-700" style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-700)' }}>
          Step 1 of 3
        </span>
        <h1 className="mt-3 text-2xl font-semibold text-ink-900 sm:text-3xl" style={{ color: 'var(--color-ink-900)' }}>
          Tell us about your situation
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--color-ink-500)' }}>
          We only ask what actually changes the recommendation. Nothing here is stored or shared.
        </p>
      </div>

      <Section label="Where are you?" hint="Approximate is fine — a neighborhood or ZIP code works.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledInput label="Neighborhood or city area" value={locationLabel} onChange={setLocationLabel} placeholder="e.g. Southwest Houston" />
          <LabeledInput label="ZIP code" value={zip} onChange={setZip} placeholder="e.g. 77074" />
        </div>
      </Section>

      <Section label="How many people need food?" hint="Include everyone in your household.">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Decrease household size"
            onClick={() => setHouseholdSize((n) => Math.max(1, n - 1))}
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-xl font-medium"
            style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-700)' }}
          >
            −
          </button>
          <div className="w-16 text-center text-2xl font-semibold" style={{ color: 'var(--color-ink-900)' }}>
            {householdSize}
          </div>
          <button
            type="button"
            aria-label="Increase household size"
            onClick={() => setHouseholdSize((n) => Math.min(12, n + 1))}
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-xl font-medium"
            style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-700)' }}
          >
            +
          </button>
          <span className="text-sm" style={{ color: 'var(--color-ink-500)' }}>
            {householdSize === 1 ? 'person' : 'people'}
          </span>
        </div>
      </Section>

      <Section label="How are you getting there?">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {TRANSPORT_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              selected={transportation === opt.value}
              onClick={() => setTransportation(opt.value)}
              icon={opt.icon}
              label={opt.label}
            />
          ))}
        </div>
      </Section>

      <Section label="When can you go?">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {TIME_WINDOWS.map((tw, idx) => (
            <ChoiceCard key={tw.label} selected={timeWindowIdx === idx} onClick={() => setTimeWindowIdx(idx)} label={tw.label} />
          ))}
        </div>
      </Section>

      <Section label="Does anyone have accessibility needs?" hint="Optional — select any that apply.">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {ACCESSIBILITY_OPTIONS.map((opt) => (
            <ChoiceCard key={opt.value} selected={needs.includes(opt.value)} onClick={() => toggleNeed(opt.value)} label={opt.label} checkbox />
          ))}
        </div>
      </Section>

      <Section label="Looking for something specific?" hint="Optional — leave blank to see everything available.">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <ChoiceCard selected={neededFood === null} onClick={() => setNeededFood(null)} label="Anything" />
          {FOOD_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              selected={neededFood === opt.value}
              onClick={() => setNeededFood(opt.value)}
              icon={opt.icon}
              label={opt.label}
            />
          ))}
        </div>
      </Section>

      <div
        className="fixed inset-x-0 bottom-0 border-t px-4 py-4"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="mx-auto max-w-2xl">
          <button
            type="submit"
            className="focus-ring w-full rounded-xl py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.99]"
            style={{ background: 'var(--color-brand-600)' }}
          >
            Find food assistance near me
          </button>
          <p className="mt-2 text-center text-xs" style={{ color: 'var(--color-ink-300)' }}>
            We only use this information to find appropriate food-access options.
          </p>
        </div>
      </div>
    </form>
  )
}

function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-7 fade-up">
      <h2 className="text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
        {label}
      </h2>
      {hint && (
        <p className="mt-0.5 text-[13px]" style={{ color: 'var(--color-ink-300)' }}>
          {hint}
        </p>
      )}
      <div className="mt-3">{children}</div>
    </div>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--color-ink-500)' }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full rounded-lg border px-3.5 py-2.5 text-[15px]"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      />
    </label>
  )
}

function ChoiceCard({
  selected,
  onClick,
  label,
  icon,
  checkbox,
}: {
  selected: boolean
  onClick: () => void
  label: string
  icon?: string
  checkbox?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="focus-ring flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-[14px] font-medium transition"
      style={{
        borderColor: selected ? 'var(--color-brand-500)' : 'var(--color-border)',
        background: selected ? 'var(--color-brand-50)' : 'var(--color-surface)',
        color: selected ? 'var(--color-brand-700)' : 'var(--color-ink-700)',
        boxShadow: selected ? '0 0 0 1px var(--color-brand-500)' : 'none',
      }}
    >
      {checkbox && (
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
          style={{
            border: `1.5px solid ${selected ? 'var(--color-brand-500)' : 'var(--color-ink-300)'}`,
            background: selected ? 'var(--color-brand-500)' : 'transparent',
          }}
        >
          {selected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      )}
      {icon && <span className="text-lg leading-none">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}
