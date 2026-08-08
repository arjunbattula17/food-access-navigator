import { useMemo, useState } from 'react'
import type { EngineResult, Situation } from './types'
import { BASE_LOCATIONS, applyEmergency } from './data/locations'
import { runRecommendationEngine } from './engine/recommend'
import SituationForm from './components/SituationForm'
import AnalyzingScreen from './components/AnalyzingScreen'
import BestPick from './components/BestPick'
import DecisionBreakdown from './components/DecisionBreakdown'
import OtherOptions from './components/OtherOptions'
import MapView from './components/MapView'
import EmergencyControl from './components/EmergencyControl'
import WhatIfPanel from './components/WhatIfPanel'
import ImpactDashboard from './components/ImpactDashboard'
import ComparisonViz from './components/ComparisonViz'

type Step = 'form' | 'analyzing' | 'results'

const DEMO_SITUATION: Situation = {
  locationLabel: 'Southwest Houston',
  zip: '77074',
  householdSize: 5,
  transportation: 'none',
  timeWindow: { label: 'Today, 4 PM – 6 PM', startMinutes: 16 * 60, endMinutes: 18 * 60 },
  accessibilityNeeds: ['none'],
  neededFood: null,
}

export default function App() {
  const [step, setStep] = useState<Step>('form')
  const [situation, setSituation] = useState<Situation | null>(null)
  const [emergency, setEmergency] = useState(false)
  const [preEmergencyBestId, setPreEmergencyBestId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showBreakdownFor, setShowBreakdownFor] = useState<string | null>(null)
  const [showWhatIf, setShowWhatIf] = useState(false)

  const locations = useMemo(() => (emergency ? applyEmergency(BASE_LOCATIONS) : BASE_LOCATIONS), [emergency])

  const result: EngineResult | null = useMemo(() => {
    if (!situation) return null
    return runRecommendationEngine(locations, situation)
  }, [locations, situation])

  function startFlow(s: Situation) {
    setSituation(s)
    setEmergency(false)
    setPreEmergencyBestId(null)
    setStep('analyzing')
  }

  function runDemo() {
    startFlow(DEMO_SITUATION)
  }

  function triggerEmergency() {
    if (!result) return
    setPreEmergencyBestId(result.best?.location.id ?? null)
    setEmergency(true)
  }

  const activeRec = result
    ? result.ranked.find((r) => r.location.id === (showBreakdownFor ?? result.best?.location.id)) ?? result.best
    : null

  const changed = emergency && preEmergencyBestId !== null && result?.best?.location.id !== preEmergencyBestId

  return (
    <div className="min-h-screen">
      <Header onDemo={runDemo} onReset={() => setStep('form')} showReset={step !== 'form'} emergency={emergency} />

      {step === 'form' && <SituationForm onSubmit={startFlow} initial={situation ?? undefined} />}

      {step === 'analyzing' && <AnalyzingScreen onDone={() => setStep('results')} />}

      {step === 'results' && situation && result && (
        <main className="mx-auto max-w-2xl px-4 pb-16 pt-5">
          <button
            onClick={() => setStep('form')}
            className="focus-ring mb-4 text-[13px] font-medium"
            style={{ color: 'var(--color-brand-600)' }}
          >
            ← Edit my situation
          </button>

          <EmergencyBanner changed={!!changed} preId={preEmergencyBestId} result={result} />

          {result.best ? (
            <>
              <BestPick
                rec={result.best}
                changed={!!changed}
                onViewDetails={() => setShowBreakdownFor(result.best!.location.id)}
                onSeeOthers={() => document.getElementById('other-options')?.scrollIntoView({ behavior: 'smooth' })}
              />

              <div className="mt-6">
                <MapView all={[...result.ranked, ...result.ineligible]} bestId={result.best.location.id} selectedId={selectedId} onSelect={setSelectedId} />
              </div>

              {activeRec && (
                <div className="mt-6">
                  <DecisionBreakdown rec={activeRec} />
                </div>
              )}

              <div id="other-options">
                <OtherOptions ranked={result.ranked} ineligible={result.ineligible} selectedId={showBreakdownFor} onSelect={setShowBreakdownFor} />
              </div>

              <div className="mt-6 space-y-6">
                <div className="card p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
                      Simulate a change in conditions
                    </h3>
                  </div>
                  <EmergencyControl triggered={emergency} onTrigger={triggerEmergency} />
                </div>

                <button
                  onClick={() => setShowWhatIf((v) => !v)}
                  className="focus-ring w-full rounded-xl border py-3 text-[13.5px] font-semibold"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-brand-600)' }}
                >
                  {showWhatIf ? 'Hide' : 'Try'} What-If mode
                </button>
                {showWhatIf && <WhatIfPanel situation={situation} locations={locations} actual={result} />}

                <ComparisonViz result={result} />
                <ImpactDashboard />
              </div>
            </>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-[15px] font-semibold" style={{ color: 'var(--color-ink-900)' }}>
                No open locations match your situation right now.
              </p>
              <p className="mt-2 text-[13px]" style={{ color: 'var(--color-ink-500)' }}>
                Try widening your available time or transportation options.
              </p>
              <button onClick={() => setStep('form')} className="focus-ring mt-4 rounded-lg px-4 py-2 text-[14px] font-semibold text-white" style={{ background: 'var(--color-brand-600)' }}>
                Update my situation
              </button>
            </div>
          )}
        </main>
      )}

      <Footer />
    </div>
  )
}

function Header({ onDemo, onReset, showReset, emergency }: { onDemo: () => void; onReset: () => void; showReset: boolean; emergency: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ borderColor: 'var(--color-border)', background: 'rgba(253,254,255,0.9)' }}>
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: 'var(--color-brand-600)' }}>
            HFB
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--color-ink-900)' }}>
              Food Access Navigator
            </p>
            <p className="text-[11px] leading-tight" style={{ color: 'var(--color-ink-300)' }}>
              Houston Food Bank · demo build
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {emergency && (
            <span className="tag" style={{ background: 'var(--color-warn-100)', color: 'var(--color-warn-600)' }}>
              ⚡ Live update
            </span>
          )}
          {showReset && (
            <button onClick={onReset} className="focus-ring rounded-lg px-2.5 py-1.5 text-xs font-semibold" style={{ color: 'var(--color-ink-500)' }}>
              Start over
            </button>
          )}
          <button onClick={onDemo} className="focus-ring rounded-lg border px-2.5 py-1.5 text-xs font-semibold" style={{ borderColor: 'var(--color-border)', color: 'var(--color-brand-600)' }}>
            ▶ Demo mode
          </button>
        </div>
      </div>
    </header>
  )
}

function EmergencyBanner({ changed, preId, result }: { changed: boolean; preId: string | null; result: EngineResult }) {
  if (!changed || !result.best) return null
  const prevName = [...result.ranked, ...result.ineligible].find((r) => r.location.id === preId)?.location.name ?? 'Previous option'
  return (
    <div className="card mb-4 p-4 fade-up" style={{ background: 'var(--color-warn-100)', borderColor: 'var(--color-warn-600)' }}>
      <p className="text-[13px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-warn-600)' }}>
        Recommendation changed
      </p>
      <p className="mt-1 text-[14px]" style={{ color: 'var(--color-ink-900)' }}>
        <span className="line-through opacity-60">{prevName}</span> → <strong>{result.best.location.name}</strong>
      </p>
      <p className="mt-1 text-[13px]" style={{ color: 'var(--color-ink-700)' }}>
        {result.best.explanation}
      </p>
    </div>
  )
}

function Footer() {
  return (
    <footer className="mx-auto max-w-2xl px-4 pb-24 pt-2 text-center">
      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-ink-300)' }}>
        This is a hackathon demo built for Houston Food Bank. All location names, hours, wait times, capacity and
        inventory shown are simulated demo data — not real operational data. We only use the information you
        enter to generate a recommendation; nothing is stored or shared.
      </p>
    </footer>
  )
}
