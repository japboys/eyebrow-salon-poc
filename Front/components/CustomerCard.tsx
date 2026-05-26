'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Customer, VisitRecord, DesignPlan, TreatmentRecord, Reaction } from '@/Other/types'

interface CustomerCardProps {
  customer: Customer
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'なし'
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function isToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
}

function getVisitBadgeColor(count: number): string {
  if (count === 0 || count === 1) return 'bg-roseLight text-rose'
  if (count <= 3) return 'bg-accentLight text-accent'
  return 'bg-cardAlt text-primary'
}

function buildVisitSummaryLine(visit: VisitRecord): string {
  const vDesign = (visit.designPlan as DesignPlan | null)?.desiredDesign
  const vTreatment = (visit.treatmentRecord as TreatmentRecord | null)?.treatmentTags
  const vConcerns = (visit.reaction as Reaction | null)?.concernTags

  const parts: string[] = []
  if (vDesign) parts.push(vDesign)
  if (vTreatment?.length) parts.push(vTreatment.slice(0, 2).join('・'))
  if (vConcerns?.length) parts.push(`懸念:${vConcerns[0]}`)
  return parts.join(' / ')
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  const router = useRouter()

  const isNewCustomer = customer.visitCount <= 1
  const allVisits: VisitRecord[] = customer.visitRecords ?? []
  const latestVisit = allVisits[0]
  const hasTodayKarte = isToday(latestVisit?.visitDate)

  // Show latest 2 visits (including today's if it exists)
  const displayedVisits = allVisits.slice(0, 2)

  // Previous visit for summary link (latest non-today)
  const summaryVisit = hasTodayKarte ? allVisits[1] : latestVisit

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
      {/* Header: name + visit count */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-bold text-text">{customer.name}</h3>
          {isNewCustomer && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-roseLight text-rose font-medium border border-rose border-opacity-30">
              初回
            </span>
          )}
          {hasTodayKarte && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-success bg-opacity-20 text-success font-medium">
              本日完了
            </span>
          )}
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getVisitBadgeColor(customer.visitCount)}`}>
          {customer.visitCount}回目
        </span>
      </div>

      {/* Visit history: latest 2 visits with 1-line summary */}
      {displayedVisits.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-textLight font-medium mb-1.5">来店履歴</p>
          <div className="space-y-1.5">
            {displayedVisits.map((visit) => {
              const visitIsToday = isToday(visit.visitDate)
              const summaryLine = buildVisitSummaryLine(visit)
              return (
                <button
                  key={visit.id}
                  onClick={() => router.push(`/customers/${customer.id}/visit/${visit.id}`)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-prev border border-dashed border-prevText hover:bg-accentLight hover:border-accent hover:border-solid transition-all"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-semibold text-prevText">{formatDate(visit.visitDate)}</span>
                    {visitIsToday && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success bg-opacity-20 text-success font-medium">本日</span>
                    )}
                  </div>
                  {summaryLine && (
                    <p className="text-[11px] text-textLight leading-tight line-clamp-1">{summaryLine}</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 前回サマリーを見る */}
      {summaryVisit && (
        <button
          onClick={() => router.push(`/customers/${customer.id}`)}
          className="w-full text-xs text-textLight hover:text-primary text-left mb-3 flex items-center gap-1 py-1 transition-colors"
        >
          <span>前回サマリーを見る</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Action buttons */}
      {isNewCustomer ? (
        <button
          onClick={() => router.push(`/customers/${customer.id}/visit/new`)}
          className="w-full py-3 px-6 bg-rose text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
        >
          <span>✦</span>
          新規カルテ作成
        </button>
      ) : hasTodayKarte ? (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/customers/${customer.id}/visit/${latestVisit.id}`)}
            className="flex-1 py-2.5 px-4 bg-success bg-opacity-10 border border-success border-opacity-30 text-success rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-success hover:bg-opacity-20 transition-colors"
          >
            <span>✓</span>
            本日カルテを確認
          </button>
        </div>
      ) : (
        <button
          onClick={() => router.push(`/customers/${customer.id}/visit/new`)}
          className="w-full py-3 px-6 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primaryLight transition-colors shadow-sm"
        >
          本日のカルテを作成する
        </button>
      )}
    </div>
  )
}
