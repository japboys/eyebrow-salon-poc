// 新規顧客 / 指名なしリピーター向けの担当スタッフ自動割当ロジック。
// LP等からの予約で staffId が未指定の場合に POST /api/appointments から呼び出される。

export interface RotationStaffCandidate {
  id: string
  /** 直前のローテーションで時間重複のため見送られた場合 true（次回最優先） */
  skipPriority: boolean
}

export interface RotationExistingAppointment {
  staffId: string | null
  date: string // "YYYY-MM-DD"
  time: string // "HH:MM"
  duration: number // 分
}

export interface RotationResult {
  assignedStaffId: string
  /** 重複のため今回見送られたスタッフ。呼び出し側で skipPriority=true に更新する */
  skippedStaffIds: string[]
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function overlaps(aStart: number, aDuration: number, bStart: number, bDuration: number): boolean {
  return aStart < bStart + bDuration && bStart < aStart + aDuration
}

/**
 * 担当スタッフの自動割当先を決定する。
 *
 * 優先順位:
 * 1. 前回ローテーションで重複のため見送られたスタッフ（skipPriority）を最優先 = 「飛ばされた人は次回優先」
 * 2. 今月の新規/指名なし対応件数（monthlyCounts）が少ないスタッフを優先 = 「月単位で対応回数を均等化」（ローテーションの実体）
 * 3. id昇順（決定的な最終タイブレーク）
 *
 * 上記順で並べた候補リストを先頭から見て、その日時に重複する予約を持たない
 * 最初のスタッフに割り当てる（重複時は次のローテーション順へ）。
 * 通過時にスキップしたスタッフは skippedStaffIds に積み、呼び出し側で次回優先扱いにする。
 * 全員重複する場合は、最優先候補（先頭）にそのまま割り当てる。
 *
 * 「出勤者のみ」に絞る処理は呼び出し側で candidates を事前に絞り込むことで対応する
 * （現状シフト管理が無いため、全スタッフを出勤扱いとする運用を想定）。
 */
export function pickStaffByRotation(
  candidates: RotationStaffCandidate[],
  monthlyCounts: Map<string, number>,
  existingAppointments: RotationExistingAppointment[],
  date: string,
  time: string,
  duration: number
): RotationResult | null {
  if (candidates.length === 0) return null

  const sorted = [...candidates].sort((a, b) => {
    if (a.skipPriority !== b.skipPriority) return a.skipPriority ? -1 : 1
    const countDiff = (monthlyCounts.get(a.id) ?? 0) - (monthlyCounts.get(b.id) ?? 0)
    if (countDiff !== 0) return countDiff
    return a.id.localeCompare(b.id)
  })

  const start = timeToMinutes(time)
  const skippedStaffIds: string[] = []

  for (const candidate of sorted) {
    const hasConflict = existingAppointments.some(
      (a) =>
        a.staffId === candidate.id &&
        a.date === date &&
        overlaps(start, duration, timeToMinutes(a.time), a.duration)
    )
    if (!hasConflict) {
      return { assignedStaffId: candidate.id, skippedStaffIds }
    }
    skippedStaffIds.push(candidate.id)
  }

  // 全員重複: ローテーション最優先のスタッフに割り当てる（見送り扱いにはしない）
  return { assignedStaffId: sorted[0].id, skippedStaffIds: skippedStaffIds.slice(1) }
}
