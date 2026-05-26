export interface Customer {
  id: string
  name: string
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
  preferredAngle: number
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

export interface VisitRecord {
  id: string
  customerId: string
  visitDate: string
  visitType: 'first_visit' | 'repeat_visit'
  previousRecordId: string | null
  visitPolicy: 'same_as_previous' | 'partial_change' | 'major_change'
  changedFields: string[]
  designPlan: DesignPlan | null
  todayObservation: TodayObservation | null
  treatmentRecord: TreatmentRecord | null
  reaction: Reaction | null
  handover: Handover | null
}

export interface DesignPlan {
  desiredDesign: string
  thicknessLevel: number
  angleLevel: number
  densityLevel: number
  changeReason: string[]
  majorChangeReason: string[]
  customerRequestNote: string
}

export interface TodayObservation {
  browConditionTags: string[]
  selfCareImpactExists: boolean
  selfCareImpactArea: string[]
  selfCareImpactLevel: number
  todaySkinConditionTags: string[]
  todaySkinRiskLevel: number
  observationNote: string
}

export interface TreatmentRecord {
  treatmentTags: string[]
  rightBrowTreatmentTags: string[]
  leftBrowTreatmentTags: string[]
  treatmentNote: string
}

export interface Reaction {
  satisfactionLevel: number
  reactionTags: string[]
  concernTags: string[]
  nextTimeCustomerRequest: string
}

export interface Handover {
  handoverText: string
  staffEditNote: string
  aiGeneratedPlaceholderText: string
  skinCautionTags?: string[]
  nextImprovementTags?: string[]
  asymmetryCautionTags?: string[]
}
