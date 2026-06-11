import { SkinRiskLevel } from '@/Other/types'

export function normalizeSkinRiskLevels(value: SkinRiskLevel | SkinRiskLevel[] | null | undefined): SkinRiskLevel[] {
  if (!value) return ['ok']
  if (Array.isArray(value)) return value.length > 0 ? value : ['ok']
  return [value]
}

export function hasSkinRisk(value: SkinRiskLevel | SkinRiskLevel[] | null | undefined, risk: SkinRiskLevel) {
  return normalizeSkinRiskLevels(value).includes(risk)
}

export function hasAnySkinCaution(value: SkinRiskLevel | SkinRiskLevel[] | null | undefined) {
  const levels = normalizeSkinRiskLevels(value)
  return levels.some((level) => level !== 'ok')
}

export function toggleSkinRiskLevel(current: SkinRiskLevel[], value: SkinRiskLevel): SkinRiskLevel[] {
  if (value === 'ok') return ['ok']
  const withoutOk = current.filter((level) => level !== 'ok')
  if (withoutOk.includes(value)) {
    const next = withoutOk.filter((level) => level !== value)
    return next.length > 0 ? next : ['ok']
  }
  return [...withoutOk, value]
}
