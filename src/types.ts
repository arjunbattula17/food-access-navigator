export type Transportation = 'car' | 'transit' | 'walk' | 'bike' | 'rideshare' | 'none'

export type AccessibilityNeed =
  | 'wheelchair'
  | 'limited_mobility'
  | 'accessible_entrance'
  | 'language_assistance'
  | 'none'

export type FoodCategory = 'canned' | 'produce' | 'dairy' | 'bread' | 'meat' | 'baby'

export interface TimeWindow {
  label: string
  startMinutes: number // minutes since midnight
  endMinutes: number
}

export interface Situation {
  locationLabel: string
  zip: string
  householdSize: number
  transportation: Transportation
  timeWindow: TimeWindow
  accessibilityNeeds: AccessibilityNeed[]
  neededFood: FoodCategory | null
}

export interface FoodInventory {
  category: FoodCategory
  status: 'available' | 'limited' | 'unavailable'
}

export interface FoodLocation {
  id: string
  name: string
  neighborhood: string
  address: string
  phone: string
  lat: number
  lng: number
  distanceMiles: number
  openMinutes: number
  closeMinutes: number
  isOpenToday: boolean
  status: 'open' | 'closed' | 'closing_soon'
  capacity: number // max households/hr
  currentLoad: number // 0-1 utilization
  waitMinutes: number
  transitAccessible: boolean
  transitDescription: string
  walkableMinutes: number | null
  bikeAccessible: boolean
  wheelchairAccessible: boolean
  accessibleParking: boolean
  languageAssistance: string[]
  inventory: FoodInventory[]
  maxHouseholdSize: number | null
  notes?: string
}

export interface FactorScore {
  key: 'transportation' | 'hours' | 'wait' | 'distance' | 'food' | 'accessibility'
  label: string
  points: number
  maxPoints: number
  rating: 'excellent' | 'good' | 'fair' | 'poor'
  detail: string
}

export interface Recommendation {
  location: FoodLocation
  score: number
  eligible: boolean
  ineligibleReasons: string[]
  factors: FactorScore[]
  explanation: string
  shortReasons: string[]
}

export interface EngineResult {
  best: Recommendation | null
  ranked: Recommendation[]
  ineligible: Recommendation[]
}
