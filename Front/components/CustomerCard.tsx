'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Customer, VisitRecord, DesignPlan, TreatmentRecord } from '@/Other/types'
import CautionBadges from '@/Front/components/CautionBadges'
import SurveyResultModal from '@/Front/components/SurveyResultModal'
import CustomerInfoModal from '@/Front/components/CustomerInfoModal'

interface CustomerCardProps {
  customer: Customer
  appointmentTime?: string
  onCustomerUpdate?: (updated: Customer) => void
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

function buildVisitSummaryLine(visit: VisitRecord): string {
  const vDesign = (visit.designPlan as DesignPlan | null)?.desiredDesign
  const vTreatment = (visit.treatmentRecord as TreatmentRecord | null)?.treatmentTags
  const parts: string[] = []
  if (vDesign) parts.push(vDesign)
  if (vTreatment?.length) parts.push(vTreatment.slice(0, 2).join('・'))
  return parts.join(' / ')
}

export default function CustomerCard({ customer, appointmentTime, onCustomerUpdate }: CustomerCardProps) {
  const router = useRouter()
  const [showSurvey, setShowSurvey] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const isNewCustomer = customer.visitCount <= 1
  const allVisits: VisitRecord[] = customer.visitRecords ?? []
  const latestVisit = allVisits[0]
  const hasTodayDraft = isToday(latestVisit?.visitDate) && latestVisit?.visitPolicy === 'draft'
  const hasTodayKarte = isToday(latestVisit?.visitDate) && latestVisit?.visitPolicy !== 'draft'
  const displayedVisits = allVisits.filter(v => v.visitPolicy !== 'draft').slice(0, 2)
  const summaryVisit = !isNewCustomer && (hasTodayKarte
    ? allVisits.find(v => v.visitPolicy !== 'draft' && !isToday(v.visitDate)) ?? null
    : (hasTodayDraft ? allVisits.find(v => v.visitPolicy !== 'draft') ?? null : latestVisit ?? null))

  return (
    <>
      <div
        className="bg-card rounded-2xl overflow-hidden transition-shadow duration-200"
        style={{ boxShadow: '0 1px 4px rgba(90,62,43,0.06), 0 4px 16px rgba(90,62,43,0.06)', border: '1px solid #E8E0D7' }}
      >
        {/* ── Card body ── */}
        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h3 className="font-serif text-[17px] font-semibold text-text leading-tight">{customer.name}</h3>
                {appointmentTime && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(90,62,43,0.08)', color: '#5A3E2B' }}>
                    {appointmentTime}〜
                  </span>
                )}
                {isNewCustomer && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-roseLight text-rose font-medium">初回</span>
                )}
                {hasTodayKarte && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(76,139,98,0.12)', color: '#4C8B62' }}>
                    本日完了
                  </span>
                )}
                {hasTodayDraft && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(203,111,81,0.12)', color: '#CB6F51' }}>
                    入力中
                  </span>
                )}
              </div>
              {customer.nameKana && <p className="text-xs text-muted">{customer.nameKana}</p>}
            </div>
            {/* Visit count badge */}
            <div className="flex-shrink-0 ml-2">
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={
                  isNewCustomer
                    ? { background: '#F4E4E8', color: '#B87484' }
                    : customer.visitCount <= 3
                    ? { background: '#EDD9C8', color: '#BE8A68' }
                    : { background: '#F8F3EE', color: '#5A3E2B' }
                }
              >
                {customer.visitCount === 0 ? '初回' : `${customer.visitCount}回目`}
              </span>
            </div>
          </div>

          {/* Caution badges */}
          <CautionBadges customer={customer} latestVisit={latestVisit} compact className="mb-3" />

          {/* Past visit history */}
          <div className="mb-3">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wide mb-2">過去カルテ</p>
            {isNewCustomer || displayedVisits.length === 0 ? (
              <p className="text-xs text-muted italic">過去カルテなし</p>
            ) : (
              <div className="space-y-1.5">
                {displayedVisits.map((visit) => {
                  const visitIsToday = isToday(visit.visitDate)
                  const summaryLine = buildVisitSummaryLine(visit)
                  return (
                    <button
                      key={visit.treatmentId}
                      onClick={() => router.push(`/customers/${customer.id}/visit/${visit.treatmentId}`)}
                      className="w-full text-left px-3 py-2.5 rounded-xl transition-colors"
                      style={{ background: '#F8F3EE', border: '1px solid #E5D8CD' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#EDD9C8')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#F8F3EE')}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-prevText">第{visit.visitNumber}回</span>
                        <span className="text-xs text-muted">{formatDate(visit.visitDate)}</span>
                        {visitIsToday && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(76,139,98,0.12)', color: '#4C8B62' }}>本日</span>
                        )}
                      </div>
                      {summaryLine && <p className="text-[11px] text-muted leading-tight line-clamp-1">{summaryLine}</p>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 前回サマリーを見る — 修正３: proper button */}
          {summaryVisit && (
            <button
              onClick={() => router.push(`/customers/${customer.id}`)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl mb-3 transition-colors"
              style={{ background: '#F8F3EE', border: '1px solid #E5D8CD', color: '#7D6554' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#EDD9C8')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F8F3EE')}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6m-3-3v6" />
              </svg>
              前回サマリーを見る
              <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* 修正１・修正４: 事前アンケート + お客様情報 ボタン */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowSurvey(true)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl transition-colors"
              style={{ background: 'rgba(190,138,104,0.08)', border: '1px solid rgba(190,138,104,0.28)', color: '#876552' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              事前アンケート
            </button>
            <button
              onClick={() => setShowInfo(true)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl transition-colors"
              style={{ background: 'rgba(90,62,43,0.06)', border: '1px solid #E8E0D7', color: '#7B6A5E' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              お客様情報
            </button>
          </div>
        </div>

        {/* ── CTA button area ── */}
        <div className="px-5 pb-5">
          {hasTodayDraft ? (
            <button
              onClick={() => router.push(`/customers/${customer.id}/visit/new?draft=${latestVisit!.treatmentId}`)}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold text-sm rounded-xl"
              style={{ height: '52px', background: 'linear-gradient(135deg, #CB6F51 0%, #D4836B 100%)', boxShadow: '0 2px 8px rgba(203,111,81,0.30)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              続きから始める
            </button>
          ) : isNewCustomer ? (
            <button
              onClick={() => router.push(`/customers/${customer.id}/visit/new`)}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold text-sm rounded-xl"
              style={{ height: '52px', background: 'linear-gradient(135deg, #B87484 0%, #C48A96 100%)', boxShadow: '0 2px 8px rgba(184,116,132,0.28)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規カルテ作成
            </button>
          ) : hasTodayKarte ? (
            <button
              onClick={() => router.push(`/customers/${customer.id}/visit/${latestVisit!.treatmentId}`)}
              className="w-full flex items-center justify-center gap-2 font-semibold text-sm rounded-xl transition-colors"
              style={{ height: '52px', background: 'rgba(76,139,98,0.08)', border: '1.5px solid rgba(76,139,98,0.25)', color: '#4C8B62' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              本日カルテを確認
            </button>
          ) : (
            <button
              onClick={() => router.push(`/customers/${customer.id}/visit/new`)}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold text-sm rounded-xl"
              style={{ height: '52px', background: 'linear-gradient(135deg, #5A3E2B 0%, #7A5540 100%)', boxShadow: '0 2px 8px rgba(90,62,43,0.22)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              本日のカルテを作成する
            </button>
          )}
        </div>
      </div>

      {showSurvey && (
        <SurveyResultModal customerName={customer.name} onClose={() => setShowSurvey(false)} />
      )}
      {showInfo && (
        <CustomerInfoModal
          customer={customer}
          onClose={() => setShowInfo(false)}
          onSaved={(updated) => onCustomerUpdate?.(updated)}
        />
      )}
    </>
  )
}
