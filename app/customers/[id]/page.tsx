'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Customer, VisitRecord, Handover, DesignPlan } from '@/Other/types'
import SectionCard from '@/Front/components/SectionCard'
import CautionBadges from '@/Front/components/CautionBadges'
import BeforeAfterPhotos from '@/Front/components/BeforeAfterPhotos'
import StructuredBriefingPanel from '@/Front/components/StructuredBriefingPanel'
import SurveyContent, { DUMMY_SURVEY } from '@/Front/components/SurveyContent'

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

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/customers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('顧客データの取得に失敗しました')
        return res.json()
      })
      .then((data) => {
        setCustomer(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-textLight">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-warning font-medium">{error || '顧客が見つかりません'}</p>
          <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm font-medium">
            一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  const allVisits: VisitRecord[] = customer.visitRecords ?? []
  const latestVisit = allVisits[0]
  const hasTodayDraft = isToday(latestVisit?.visitDate) && latestVisit?.visitPolicy === 'draft'
  const hasTodayKarte = isToday(latestVisit?.visitDate) && latestVisit?.visitPolicy !== 'draft'
  const isNewCustomer = customer.visitCount <= 1

  const summaryVisit = hasTodayKarte
    ? allVisits.find(v => v.visitPolicy !== 'draft' && !isToday(v.visitDate)) ?? null
    : (hasTodayDraft ? allVisits.find(v => v.visitPolicy !== 'draft') ?? null : latestVisit ?? null)

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="bg-card sticky top-0 z-10" style={{ boxShadow: '0 1px 0 #E8E0D7, 0 2px 12px rgba(90,62,43,0.05)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-textLight transition-colors"
            style={{ background: '#F8F3EE' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-lg font-semibold text-primary truncate">{customer.name}</h1>
            <p className="text-xs text-muted">顧客詳細 / カルテ</p>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-25" />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* ── Summary card ── */}
        <div className="bg-card rounded-2xl p-5" style={{ border: '1px solid #E8E0D7', boxShadow: '0 1px 4px rgba(90,62,43,0.06), 0 4px 16px rgba(90,62,43,0.06)' }}>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="font-serif text-2xl font-semibold text-text">{customer.name}</h2>
                <span className="text-sm px-3 py-0.5 rounded-full font-medium"
                  style={
                    isNewCustomer
                      ? { background: '#F4E4E8', color: '#B87484' }
                      : customer.visitCount <= 3
                      ? { background: '#EDD9C8', color: '#BE8A68' }
                      : { background: '#F8F3EE', color: '#5A3E2B' }
                  }>
                  {isNewCustomer ? '初回' : `${customer.visitCount}回目`}
                </span>
                {hasTodayKarte && (
                  <span className="text-sm px-3 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(76,139,98,0.10)', color: '#4C8B62' }}>
                    本日完了
                  </span>
                )}
                {hasTodayDraft && (
                  <span className="text-sm px-3 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(203,111,81,0.10)', color: '#CB6F51' }}>
                    入力中
                  </span>
                )}
              </div>
              {customer.nameKana && <p className="text-sm text-muted mb-1">{customer.nameKana}</p>}
              <p className="text-sm text-textLight">
                前回来店: <span className="text-text font-medium">{formatDate(customer.lastVisitDate)}</span>
              </p>
            </div>
            <button
              onClick={() => router.push(`/customers/${id}/edit`)}
              className="px-4 py-2 text-primary text-sm font-medium rounded-xl transition-colors"
              style={{ background: '#F8F3EE', border: '1px solid #E8E0D7' }}
            >
              情報を編集
            </button>
          </div>
        </div>

        {/* 要注意顧客の警告エリア */}
        <CautionBadges customer={customer} latestVisit={summaryVisit} />

        {/* 前回のBefore/After写真 */}
        {summaryVisit && (
          <div className="bg-card rounded-2xl p-5" style={{ border: '1px solid #E8E0D7', boxShadow: '0 1px 4px rgba(90,62,43,0.05)' }}>
            <BeforeAfterPhotos />
          </div>
        )}

        {/* 前回施術サマリー */}
        {summaryVisit && (
          <SectionCard
            title="前回施術サマリー"
            collapsible
            defaultOpen
            badge={`第${summaryVisit.visitNumber}回 ${formatDate(summaryVisit.visitDate)}`}
            badgeColor="bg-prev text-prevText"
          >
            <div className="space-y-4">
              <StructuredBriefingPanel customer={customer} visit={summaryVisit} />
            </div>
          </SectionCard>
        )}

        {/* 事前アンケート（お客様情報枠の代替） */}
        <SectionCard
          title="事前アンケート"
          collapsible
          defaultOpen
          badge={`回答日: ${DUMMY_SURVEY.submittedAt}`}
          badgeColor="bg-accentLight text-primary"
        >
          <div
            className="mb-4 px-3.5 py-2.5 rounded-xl text-[12px] text-textLight flex items-center gap-2"
            style={{ background: 'rgba(203,111,81,0.07)', border: '1px solid rgba(203,111,81,0.18)' }}
          >
            <svg className="w-4 h-4 text-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            現在はサンプルデータを表示しています。データ連携は今後実装予定です。
          </div>
          <SurveyContent />
        </SectionCard>

        {/* 本日のカルテ作成 */}
        <SectionCard title="本日のカルテ作成" defaultOpen>
          {hasTodayDraft ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-warning bg-opacity-15 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-warning mb-1">一時保存中</p>
              <p className="text-xs text-textLight mb-4">カルテID: {latestVisit?.treatmentId}</p>
              <button
                onClick={() => router.push(`/customers/${id}/visit/new?draft=${latestVisit?.treatmentId}`)}
                className="w-full py-3 px-5 bg-warning text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                続きから始める
              </button>
            </div>
          ) : hasTodayKarte ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-success bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-success">✓</span>
              </div>
              <p className="text-sm font-semibold text-success mb-1">本日のカルテ完了</p>
              <p className="text-xs text-textLight mb-4">記録日: {formatDate(latestVisit?.visitDate)}</p>
              <button
                onClick={() => router.push(`/customers/${id}/visit/${latestVisit?.treatmentId}`)}
                className="w-full py-3 px-5 bg-cardAlt border border-border text-primary rounded-xl text-sm font-medium hover:bg-accentLight transition-colors"
              >
                本日のカルテを確認・編集する
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              {isNewCustomer && (
                <p className="text-sm text-textLight mb-5">初回来店のお客様です。新規カルテを作成してください。</p>
              )}
              <button
                onClick={() => router.push(`/customers/${id}/visit/new`)}
                className="w-full py-4 px-6 bg-primary text-white rounded-xl font-bold text-base hover:bg-primaryLight transition-colors shadow-sm flex items-center justify-center gap-3"
              >
                <span className="text-xl">✎</span>
                本日のカルテを作成する
              </button>
            </div>
          )}
        </SectionCard>

        {/* 来店履歴 */}
        {allVisits.filter(v => v.visitPolicy !== 'draft').length > 0 && (
          <SectionCard
            title="来店履歴"
            collapsible
            defaultOpen={false}
            badge={`${allVisits.filter(v => v.visitPolicy !== 'draft').length}件`}
          >
            <div className="space-y-2">
              {allVisits.filter(v => v.visitPolicy !== 'draft').map((visit) => {
                const vHandover = visit.handover as Handover | null
                const vDesign = visit.designPlan as DesignPlan | null
                return (
                  <button
                    key={visit.treatmentId}
                    onClick={() => router.push(`/customers/${id}/visit/${visit.treatmentId}`)}
                    className="w-full flex gap-3 py-3 border-b border-border last:border-0 hover:bg-cardAlt rounded-xl px-2 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-cardAlt rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      {visit.visitNumber}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-text">{formatDate(visit.visitDate)}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-prev text-prevText">
                          {visit.visitType === 'first_visit' ? '初回' : '通常'}
                        </span>
                        {vDesign?.desiredDesign && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accentLight text-primary">
                            {vDesign.desiredDesign}
                          </span>
                        )}
                      </div>
                      {vHandover?.handoverText && (
                        <p className="text-xs text-textLight mt-1 line-clamp-2">{vHandover.handoverText}</p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-textLight self-center flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )
              })}
            </div>
          </SectionCard>
        )}
      </main>
    </div>
  )
}
