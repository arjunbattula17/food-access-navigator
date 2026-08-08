import type {
  EngineResult,
  FactorScore,
  FoodLocation,
  Recommendation,
  Situation,
} from '../types'

function overlapMinutes(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart))
}

function rateFromRatio(ratio: number): FactorScore['rating'] {
  if (ratio >= 0.85) return 'excellent'
  if (ratio >= 0.6) return 'good'
  if (ratio >= 0.35) return 'fair'
  return 'poor'
}

function scoreTransportation(loc: FoodLocation, s: Situation): { points: number; detail: string } {
  const max = 30
  switch (s.transportation) {
    case 'car':
      return { points: max, detail: 'Reachable by car; distance is a minor factor.' }
    case 'rideshare':
      return { points: 27, detail: 'Reachable by rideshare or a ride from someone else.' }
    case 'transit':
      return loc.transitAccessible
        ? { points: max, detail: `Direct transit access — ${loc.transitDescription}.` }
        : { points: 8, detail: `${loc.transitDescription}, which makes transit difficult.` }
    case 'bike':
      return loc.bikeAccessible
        ? { points: 28, detail: 'Bike-friendly route to this location.' }
        : { points: 14, detail: 'No dedicated bike route, but reachable.' }
    case 'walk': {
      const w = loc.walkableMinutes
      if (w === null) return { points: 4, detail: 'Too far to walk safely.' }
      if (w <= 12) return { points: max, detail: `About a ${w}-minute walk.` }
      if (w <= 25) return { points: 20, detail: `About a ${w}-minute walk.` }
      if (w <= 40) return { points: 11, detail: `A long, ${w}-minute walk.` }
      return { points: 4, detail: `A very long, ${w}-minute walk.` }
    }
    case 'none': {
      if (loc.transitAccessible) return { points: 26, detail: `No car needed — ${loc.transitDescription}.` }
      if (loc.walkableMinutes !== null && loc.walkableMinutes <= 25)
        return { points: 18, detail: `Walkable in about ${loc.walkableMinutes} minutes without a car.` }
      return { points: 2, detail: 'Hard to reach without a car or transit.' }
    }
  }
}

function isTransportationUnreachable(loc: FoodLocation, s: Situation): boolean {
  if (s.transportation !== 'none') return false
  if (loc.transitAccessible) return false
  if (loc.walkableMinutes !== null && loc.walkableMinutes <= 60) return false
  // No transit, no reasonable walk data, and genuinely far — treat as truly unreachable.
  // Closer locations without transit are still listed, just heavily penalized on the
  // transportation factor, matching the "less ideal" vs "not actually possible" distinction.
  return loc.distanceMiles > 10
}

function scoreHours(loc: FoodLocation, s: Situation): { points: number; detail: string; overlap: number } {
  const max = 20
  const overlap = overlapMinutes(loc.openMinutes, loc.closeMinutes, s.timeWindow.startMinutes, s.timeWindow.endMinutes)
  const windowLen = s.timeWindow.endMinutes - s.timeWindow.startMinutes
  if (overlap <= 0) return { points: 0, detail: 'Not open during your available time.', overlap }
  const ratio = Math.min(1, overlap / windowLen)
  const closesSoonAfterStart = loc.closeMinutes - s.timeWindow.startMinutes <= 45
  let points = Math.round(max * ratio)
  if (closesSoonAfterStart) points = Math.max(0, points - 6)
  const closeH = Math.floor(loc.closeMinutes / 60)
  const closeM = loc.closeMinutes % 60
  const closeLabel = `${((closeH + 11) % 12) + 1}:${closeM.toString().padStart(2, '0')} ${closeH >= 12 ? 'PM' : 'AM'}`
  const detail =
    ratio >= 0.95
      ? `Open for your full time window, until ${closeLabel}.`
      : `Open during part of your window, closes at ${closeLabel}.`
  return { points, detail, overlap }
}

function scoreWait(loc: FoodLocation): { points: number; detail: string } {
  const w = loc.waitMinutes
  if (w <= 15) return { points: 15, detail: `Short expected wait, about ${w} minutes.` }
  if (w <= 30) return { points: 12, detail: `Moderate expected wait, about ${w} minutes.` }
  if (w <= 45) return { points: 9, detail: `Wait is around ${w} minutes.` }
  if (w <= 60) return { points: 6, detail: `Longer wait, around ${w} minutes.` }
  if (w <= 90) return { points: 3, detail: `Wait is currently high, around ${w} minutes.` }
  return { points: 1, detail: `Wait is currently very high, around ${w} minutes.` }
}

function scoreDistance(loc: FoodLocation): { points: number; detail: string } {
  const d = loc.distanceMiles
  if (d <= 2) return { points: 15, detail: `Very close, ${d} miles away.` }
  if (d <= 5) return { points: 12, detail: `${d} miles away.` }
  if (d <= 8) return { points: 9, detail: `${d} miles away.` }
  if (d <= 12) return { points: 6, detail: `${d} miles away, farther out.` }
  return { points: 3, detail: `${d} miles away, a longer trip.` }
}

function scoreFood(loc: FoodLocation, s: Situation): { points: number; detail: string; blocking: boolean } {
  if (s.neededFood) {
    const item = loc.inventory.find((i) => i.category === s.neededFood)
    if (!item || item.status === 'unavailable') {
      return { points: 0, detail: 'Does not currently have the food category you need.', blocking: true }
    }
    if (item.status === 'limited') {
      return { points: 6, detail: 'Has what you need, but supply is limited today.', blocking: false }
    }
    return { points: 10, detail: 'Has what you need in stock today.', blocking: false }
  }
  const available = loc.inventory.filter((i) => i.status === 'available').length
  const limited = loc.inventory.filter((i) => i.status === 'limited').length
  const ratio = (available + limited * 0.5) / loc.inventory.length
  const points = Math.round(ratio * 10)
  const detail =
    ratio >= 0.8
      ? 'Good variety of food currently available.'
      : ratio >= 0.5
        ? 'Some food categories are limited today.'
        : 'Limited food variety available today.'
  return { points, detail, blocking: false }
}

function scoreAccessibility(loc: FoodLocation, s: Situation): { points: number; detail: string; blocking: string | null } {
  const needs = s.accessibilityNeeds.filter((n) => n !== 'none')
  if (needs.length === 0) {
    const bonus = (loc.wheelchairAccessible ? 1 : 0) + (loc.accessibleParking ? 1 : 0)
    return { points: 8 + bonus, detail: 'No accessibility needs specified.', blocking: null }
  }
  for (const need of needs) {
    if ((need === 'wheelchair' || need === 'accessible_entrance') && !loc.wheelchairAccessible) {
      return { points: 0, detail: 'Does not have an accessible entrance.', blocking: 'This location does not have a wheelchair-accessible entrance.' }
    }
    if (need === 'limited_mobility' && !loc.accessibleParking) {
      return { points: 3, detail: 'No dedicated accessible parking.', blocking: null }
    }
    if (need === 'language_assistance' && loc.languageAssistance.length === 0) {
      return { points: 2, detail: 'No language assistance currently listed.', blocking: null }
    }
  }
  return { points: 10, detail: 'Supports the accessibility needs you selected.', blocking: null }
}

export function evaluateLocation(loc: FoodLocation, s: Situation): Recommendation {
  const ineligibleReasons: string[] = []

  const hours = scoreHours(loc, s)
  if (!loc.isOpenToday || hours.overlap <= 0) {
    ineligibleReasons.push(
      !loc.isOpenToday ? 'Closed today.' : 'Closed during the time window you selected.',
    )
  }

  const accessibility = scoreAccessibility(loc, s)
  if (accessibility.blocking) ineligibleReasons.push(accessibility.blocking)

  if (loc.maxHouseholdSize !== null && s.householdSize > loc.maxHouseholdSize) {
    ineligibleReasons.push(`Cannot accommodate a household of ${s.householdSize}.`)
  }

  const food = scoreFood(loc, s)
  if (food.blocking) ineligibleReasons.push('Does not have the food category you need today.')

  if (isTransportationUnreachable(loc, s)) {
    ineligibleReasons.push('Not reachable with your current transportation.')
  }

  const transportation = scoreTransportation(loc, s)
  const wait = scoreWait(loc)
  const distance = scoreDistance(loc)

  const factors: FactorScore[] = [
    { key: 'transportation', label: 'Transportation', points: transportation.points, maxPoints: 30, rating: rateFromRatio(transportation.points / 30), detail: transportation.detail },
    { key: 'hours', label: 'Hours', points: hours.points, maxPoints: 20, rating: rateFromRatio(hours.points / 20), detail: hours.detail },
    { key: 'wait', label: 'Wait time', points: wait.points, maxPoints: 15, rating: rateFromRatio(wait.points / 15), detail: wait.detail },
    { key: 'distance', label: 'Distance', points: distance.points, maxPoints: 15, rating: rateFromRatio(distance.points / 15), detail: distance.detail },
    { key: 'food', label: 'Food availability', points: food.points, maxPoints: 10, rating: rateFromRatio(food.points / 10), detail: food.detail },
    { key: 'accessibility', label: 'Accessibility', points: accessibility.points, maxPoints: 10, rating: rateFromRatio(accessibility.points / 10), detail: accessibility.detail },
  ]

  const score = factors.reduce((sum, f) => sum + f.points, 0)
  const eligible = ineligibleReasons.length === 0

  const shortReasons = buildShortReasons(loc, s, factors)
  const explanation = buildExplanation(loc, s, factors, eligible, ineligibleReasons)

  return { location: loc, score, eligible, ineligibleReasons, factors, explanation, shortReasons }
}

function buildShortReasons(loc: FoodLocation, s: Situation, factors: FactorScore[]): string[] {
  const reasons: string[] = []
  const t = factors.find((f) => f.key === 'transportation')!
  const h = factors.find((f) => f.key === 'hours')!
  const w = factors.find((f) => f.key === 'wait')!
  const f = factors.find((f) => f.key === 'food')!
  const a = factors.find((f) => f.key === 'accessibility')!

  if (t.rating === 'excellent' || t.rating === 'good') {
    if (s.transportation === 'none' || s.transportation === 'transit') reasons.push('Accessible by public transportation')
    else if (s.transportation === 'walk') reasons.push('A manageable walk from you')
    else reasons.push('Easy to reach with your transportation')
  }
  if (h.rating === 'excellent') reasons.push('Open during your available time')
  if (w.points >= 12) reasons.push('Short expected wait')
  if (s.householdSize > 1 && loc.maxHouseholdSize === null) reasons.push('Can accommodate your household')
  if (f.points >= 8) reasons.push('Food currently available')
  if (s.accessibilityNeeds.some((n) => n !== 'none') && a.points >= 8) reasons.push('Supports your accessibility needs')
  return reasons.slice(0, 5)
}

function buildExplanation(
  loc: FoodLocation,
  s: Situation,
  factors: FactorScore[],
  eligible: boolean,
  ineligibleReasons: string[],
): string {
  if (!eligible) {
    return `${loc.name} isn't a match right now: ${ineligibleReasons.join(' ')}`
  }
  const parts: string[] = []
  if (s.transportation === 'none' || s.transportation === 'transit') {
    if (loc.transitAccessible) parts.push(`you don't have a car and this location is accessible by public transportation`)
  } else if (s.transportation === 'walk' && loc.walkableMinutes !== null && loc.walkableMinutes <= 25) {
    parts.push(`it's a reasonable walk from you`)
  }
  const hoursFactor = factors.find((f) => f.key === 'hours')!
  if (hoursFactor.rating === 'excellent') parts.push(`it's open during your available time`)
  const waitFactor = factors.find((f) => f.key === 'wait')!
  if (waitFactor.points >= 12) parts.push(`it currently has a shorter expected wait`)
  const distFactor = factors.find((f) => f.key === 'distance')!
  if (parts.length === 0) parts.push(`it best balances distance, hours, and wait time for your situation`)

  let sentence = `${loc.name} works well for your situation because ${parts.join(', and ')}.`
  if (distFactor.rating !== 'excellent' && distFactor.rating !== 'poor') {
    sentence += ` It's a bit farther than the closest option, but more likely to work for your situation right now.`
  }
  return sentence
}

export function runRecommendationEngine(locations: FoodLocation[], situation: Situation): EngineResult {
  const all = locations.map((loc) => evaluateLocation(loc, situation))
  const eligible = all.filter((r) => r.eligible).sort((a, b) => b.score - a.score)
  const ineligible = all.filter((r) => !r.eligible).sort((a, b) => b.score - a.score)
  return {
    best: eligible[0] ?? null,
    ranked: eligible,
    ineligible,
  }
}
