export type { EyebrowSide, MarkerType, EyebrowTreatmentMark } from './eyebrowMark'
import { EyebrowTreatmentMark } from './eyebrowMark'

export interface Customer {
  id: string
  name: string
  nameKana: string | null
  bookingName: string | null
  age: number | null
  phone: string | null
  email: string | null
  visitCount: number
  lastVisitDate: string | null
  notes: string | null
  profile: CustomerProfile | null
  visitRecords: VisitRecord[]
}

export interface CustomerProfile {
  id: string
  customerId: string
  defaultDesign: string | null
  preferredThickness: number
  preferredDensity: number
  asymmetryType: string | null
  asymmetryLevel: number
  hairFlowNotes: string | null
  sparseAreaNotes: string | null
  skinRiskProfile: string | null
  ngPoints: string | null
  selfCareHabitNotes: string | null
  generalHandoverNotes: string | null
}

export interface Appointment {
  id: string
  customerId: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  staffId: string | null
  staffName: string | null
  visitRecordId: string | null
}

export interface Staff {
  id: string
  name: string
}

export interface VisitRecord {
  treatmentId: string
  customerId: string
  visitNumber: number
  visitDate: string
  previousTreatmentId: string | null
  visitType: 'first_visit' | 'repeat_visit'
  visitPolicy: 'same_as_previous' | 'partial_change' | 'major_change' | 'draft'
  changedFields: string[]
  designPlan: DesignPlan | null
  todayObservation: TodayObservation | null
  treatmentRecord: TreatmentRecord | null
  handover: Handover | null
  originalObservationMemo: string | null
  aiGeneratedObservationSummary: string | null
  aiGeneratedHandover: string | null
  staffEditedHandover: string | null
  staffId: string | null
  staffName: string | null
}

export interface DesignPlan {
  desiredDesign: string | string[]
  designSubOption?: string
  designSubOptions?: Record<string, string>
  thickness: string
  density: string
  designMemo?: string
  customerStance?: string
  particularNote?: string
  permaEnabled?: boolean
  permaMedication?: string
  permaTime?: string
  permaCustomTime?: number
}

export type SkinRiskLevel = 'ok' | 'caution' | 'medication'

export interface TodayObservation {
  todaySkinConditionTags: string[]
  todaySkinRiskLevel: SkinRiskLevel | SkinRiskLevel[]
  medicationTags: string[]
  medicationOtherNote: string
  observationNote: string
}

export interface TreatmentRecord {
  rightBrowTreatmentTags: string[]
  leftBrowTreatmentTags: string[]
  customerStance: string
  particularNote?: string
  treatmentNote: string
  eyebrowTreatmentMarks?: EyebrowTreatmentMark[]
  eyebrowMarkMemo?: string
}

export interface Handover {
  handoverText: string
  staffEditNote: string
  staffEditNoteImportant?: boolean
  aiGeneratedPlaceholderText?: string
  skinCautionTags?: string[]
  nextImprovementTags?: string[]
}
