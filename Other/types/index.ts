export interface Customer {
  id: string
  name: string
  nameKana: string | null
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
  status: 'scheduled' | 'completed' | 'cancelled'
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
  desiredDesign: string
  thicknessLevel: number
  densityLevel: number
  changeReason: string[]
  majorChangeReason: string[]
  customerRequestNote: string
}

export type SkinRiskLevel = 'ok' | 'caution' | 'medication'

export interface TodayObservation {
  browConditionTags: string[]
  selfCareImpactExists: boolean
  selfCareImpactArea: string[]
  selfCareImpactLevel: number
  todaySkinConditionTags: string[]
  todaySkinRiskLevel: SkinRiskLevel | SkinRiskLevel[]
  medicationTags: string[]
  medicationOtherNote: string
  observationNote: string
}

export interface TreatmentRecord {
  treatmentTags: string[]
  rightBrowTreatmentTags: string[]
  leftBrowTreatmentTags: string[]
  customerStance: string
  particularNote?: string
  treatmentNote: string
}

export interface Handover {
  handoverText: string
  staffEditNote: string
  aiGeneratedPlaceholderText?: string
  skinCautionTags?: string[]
  nextImprovementTags?: string[]
  asymmetryCautionTags?: string[]
}
