import { Customer, DesignPlan, Handover, TodayObservation, TreatmentRecord, VisitRecord } from '@/Other/types'
import { hasSkinRisk } from '@/Other/lib/skin-risk'

export type BriefingSectionId =
  | 'critical'
  | 'design'
  | 'treatment'
  | 'handover'

export interface BriefingSection {
  id: BriefingSectionId
  title: string
  items: string[]
  level: 'normal' | 'caution' | 'danger'
}

export interface StructuredBriefingCard {
  customerId: string
  customerName: string
  visitNumber: number | null
  sections: BriefingSection[]
}

function parseNgPoints(ngPoints: unknown): string[] {
  if (!ngPoints) return []
  if (Array.isArray(ngPoints)) return ngPoints.map(String)
  if (typeof ngPoints !== 'string') return []
  try {
    const parsed = JSON.parse(ngPoints)
    return Array.isArray(parsed) ? parsed.map(String) : [ngPoints]
  } catch {
    return [ngPoints]
  }
}

function compact(items: Array<string | null | undefined | false>): string[] {
  return items.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

export function createStructuredBriefingCard(
  customer: Customer,
  visit: VisitRecord | null | undefined
): StructuredBriefingCard {
  const designPlan = visit?.designPlan as DesignPlan | null | undefined
  const observation = visit?.todayObservation as TodayObservation | null | undefined
  const treatment = visit?.treatmentRecord as TreatmentRecord | null | undefined
  const handover = visit?.handover as Handover | null | undefined
  const ngPoints = parseNgPoints(customer.profile?.ngPoints)

  const criticalItems = compact([
    ngPoints.length > 0 ? `NG: ${ngPoints.join(' / ')}` : null,
    hasSkinRisk(observation?.todaySkinRiskLevel, 'medication') ? `薬使用中: ${(observation?.medicationTags ?? []).join(' / ') || '用途未記録'}` : null,
    hasSkinRisk(observation?.todaySkinRiskLevel, 'caution') ? '肌リスク注意' : null,
  ])

  const designItems = compact([
    designPlan?.desiredDesign
      ? `デザイン: ${designPlan.desiredDesign}${designPlan.designSubOption ? `（${designPlan.designSubOption}）` : ''}`
      : null,
    designPlan?.thickness && designPlan.thickness !== '太さキープ' ? `太さ: ${designPlan.thickness}` : null,
    designPlan?.density && designPlan.density !== 'キープ' ? `濃さ: ${designPlan.density}` : null,
    designPlan?.designMemo ? `施術メモ: ${designPlan.designMemo}` : null,
  ])

  const treatmentItems = compact([
    treatment?.rightBrowTreatmentTags?.length ? `右眉: ${treatment.rightBrowTreatmentTags.join(' / ')}` : null,
    treatment?.leftBrowTreatmentTags?.length ? `左眉: ${treatment.leftBrowTreatmentTags.join(' / ')}` : null,
    treatment?.customerStance ? `施術方針: ${treatment.customerStance}` : null,
    treatment?.particularNote ? `こだわり確認: ${treatment.particularNote}` : null,
    observation?.todaySkinConditionTags?.length && !observation.todaySkinConditionTags.includes('問題なし')
      ? `お客様状態: ${observation.todaySkinConditionTags.join(' / ')}`
      : null,
    observation?.observationNote ? `観察メモ: ${observation.observationNote}` : null,
  ])

  const handoverItems = compact([
    handover?.handoverText ? `共有メモ: ${handover.handoverText}` : null,
    handover?.skinCautionTags?.length ? `肌注意: ${handover.skinCautionTags.join(' / ')}` : null,
    handover?.staffEditNote ? `内部メモ: ${handover.staffEditNote}` : null,
  ])

  return {
    customerId: customer.id,
    customerName: customer.name,
    visitNumber: visit?.visitNumber ?? null,
    sections: [
      { id: 'critical', title: '重要注意', items: criticalItems, level: criticalItems.length ? 'danger' : 'normal' },
      { id: 'design', title: '前回デザイン・差分', items: designItems, level: 'normal' },
      {
        id: 'treatment',
        title: '施術・観察',
        items: treatmentItems,
        level: observation?.todaySkinConditionTags?.some((tag) => tag !== '問題なし') ? 'caution' : 'normal',
      },
      { id: 'handover', title: '会話・次回共有', items: handoverItems, level: handoverItems.length ? 'caution' : 'normal' },
    ],
  }
}
