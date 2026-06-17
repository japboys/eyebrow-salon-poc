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
  const dp = visit?.designPlan as (DesignPlan & {
    customerStance?: string
    particularNote?: string
    permaEnabled?: boolean
    permaMedication?: string
    permaTime?: string
    permaCustomTime?: number
    designSubOptions?: Record<string, string>
  }) | null | undefined
  const observation = visit?.todayObservation as TodayObservation | null | undefined
  const treatment = visit?.treatmentRecord as (TreatmentRecord & { eyebrowMarkMemo?: string }) | null | undefined
  const handover = visit?.handover as (Handover & { staffEditNoteImportant?: boolean }) | null | undefined
  const ngPoints = parseNgPoints(customer.profile?.ngPoints)

  const criticalItems = compact([
    ngPoints.length > 0 ? `NG: ${ngPoints.join(' / ')}` : null,
    hasSkinRisk(observation?.todaySkinRiskLevel, 'medication')
      ? `薬使用中: ${(observation?.medicationTags ?? []).join(' / ') || '用途未記録'}`
      : null,
    hasSkinRisk(observation?.todaySkinRiskLevel, 'caution') ? '肌リスク注意' : null,
    handover?.staffEditNoteImportant && handover.staffEditNote ? `★重要メモ: ${handover.staffEditNote}` : null,
  ])

  const designItems = compact([
    (() => {
      const desiredDesign = dp?.desiredDesign
      if (!desiredDesign) return null
      const designs = Array.isArray(desiredDesign) ? desiredDesign : [desiredDesign]
      if (designs.length === 0) return null
      const subOpts = designs
        .map((d) => {
          const sub =
            dp?.designSubOptions?.[d] ??
            (d === (Array.isArray(dp?.desiredDesign) ? dp?.desiredDesign[0] : dp?.desiredDesign)
              ? dp?.designSubOption
              : undefined)
          return sub ? `${d}（${sub}）` : d
        })
        .join(' / ')
      return `デザイン: ${subOpts}`
    })(),
    dp?.thickness && dp.thickness !== '太さキープ' ? `太さ: ${dp.thickness}` : null,
    dp?.density && dp.density !== '状態キープ' && dp.density !== 'キープ' ? `濃さ: ${dp.density}` : null,
    (() => {
      if (!dp?.permaEnabled) return null
      const parts = ['パーマ']
      if (dp.permaMedication) parts.push(dp.permaMedication)
      if (dp.permaTime && dp.permaTime !== 'カスタム') parts.push(`${dp.permaTime}分`)
      else if (dp.permaTime === 'カスタム' && dp.permaCustomTime) parts.push(`${dp.permaCustomTime}分`)
      return parts.join(' / ')
    })(),
    (() => {
      const stance = dp?.customerStance ?? treatment?.customerStance
      return stance && stance !== '特になし' ? `施術方針: ${stance}` : null
    })(),
    (() => {
      const note = dp?.particularNote ?? treatment?.particularNote
      return note ? `こだわり: ${note}` : null
    })(),
    dp?.designMemo ? `施術メモ: ${dp.designMemo}` : null,
  ])

  const treatmentItems = compact([
    visit?.staffName ? `担当: ${visit.staffName}` : null,
    observation?.todaySkinConditionTags?.length && !observation.todaySkinConditionTags.includes('問題なし')
      ? `肌状態: ${observation.todaySkinConditionTags.join(' / ')}`
      : null,
    observation?.observationNote ? `観察: ${observation.observationNote}` : null,
    treatment?.eyebrowMarkMemo ? `マークメモ: ${treatment.eyebrowMarkMemo}` : null,
  ])

  const handoverItems = compact([
    handover?.handoverText ? `共有メモ: ${handover.handoverText}` : null,
    handover?.skinCautionTags?.length ? `肌注意: ${handover.skinCautionTags.join(' / ')}` : null,
    handover?.staffEditNote && !handover.staffEditNoteImportant ? `内部メモ: ${handover.staffEditNote}` : null,
  ])

  return {
    customerId: customer.id,
    customerName: customer.name,
    visitNumber: visit?.visitNumber ?? null,
    sections: [
      {
        id: 'critical',
        title: '⚠ 重要注意',
        items: criticalItems,
        level: criticalItems.length ? 'danger' : 'normal',
      },
      { id: 'design', title: 'デザイン・施術内容', items: designItems, level: 'normal' },
      {
        id: 'treatment',
        title: '当日状態・観察',
        items: treatmentItems,
        level: observation?.todaySkinConditionTags?.some((tag) => tag !== '問題なし') ? 'caution' : 'normal',
      },
      {
        id: 'handover',
        title: '申し送り・共有メモ',
        items: handoverItems,
        level: handoverItems.length ? 'caution' : 'normal',
      },
    ],
  }
}
