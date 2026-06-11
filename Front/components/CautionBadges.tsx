'use client'

import React from 'react'
import { Customer, VisitRecord, TodayObservation } from '@/Other/types'
import { hasSkinRisk } from '@/Other/lib/skin-risk'

export interface CautionInfo {
  key: string
  label: string
  icon: string
  colorClass: string
}

function parseNgPoints(ngPoints: string | string[] | null | undefined): string[] {
  if (!ngPoints) return []
  if (Array.isArray(ngPoints)) return ngPoints
  try { return JSON.parse(ngPoints) } catch { return [] }
}

export function getCautionInfo(customer: Customer | null | undefined, latestVisit?: VisitRecord | null): CautionInfo[] {
  if (!customer) return []
  const cautions: CautionInfo[] = []

  const ngPoints = parseNgPoints(customer.profile?.ngPoints as string | string[] | null | undefined)
  if (ngPoints.length > 0) {
    cautions.push({ key: 'treatment', label: '施術要注意', icon: '!', colorClass: 'bg-rose text-white' })
  }

  const todayObservation = latestVisit?.todayObservation as TodayObservation | null | undefined
  const skinRiskProfile = customer.profile?.skinRiskProfile
  const hasSkinAllergyCaution =
    (!!skinRiskProfile && skinRiskProfile !== '特になし') ||
    hasSkinRisk(todayObservation?.todaySkinRiskLevel, 'caution') ||
    hasSkinRisk(todayObservation?.todaySkinRiskLevel, 'medication')
  if (hasSkinAllergyCaution) {
    cautions.push({ key: 'skin', label: '肌・アレルギー注意', icon: '△', colorClass: 'bg-warning text-white' })
  }

  if (hasSkinRisk(todayObservation?.todaySkinRiskLevel, 'medication')) {
    cautions.push({ key: 'medication', label: '薬使用中', icon: '+', colorClass: 'bg-primary text-white' })
  }

  return cautions
}

export function CautionBadgeChip({ info, compact = false }: { info: CautionInfo; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${info.colorClass} ${
      compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'
    }`}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  )
}

interface CautionBadgesProps {
  customer: Customer | null | undefined
  latestVisit?: VisitRecord | null
  compact?: boolean
  className?: string
}

export default function CautionBadges({ customer, latestVisit, compact = false, className = '' }: CautionBadgesProps) {
  const cautions = getCautionInfo(customer, latestVisit)
  if (cautions.length === 0) return null
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {cautions.map((c) => <CautionBadgeChip key={c.key} info={c} compact={compact} />)}
    </div>
  )
}
