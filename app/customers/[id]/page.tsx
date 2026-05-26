'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Customer, VisitRecord, Reaction, TreatmentRecord, Handover, DesignPlan } from '@/Other/types'
import SectionCard from '@/Front/components/SectionCard'
import ProfileSection from '@/Front/components/ProfileSection'
import { thicknessLabels, angleLabels, densityLabels } from '@/Front/components/LevelSelector'

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

function StarDisplay({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-lg ${i <= level ? 'text-accent' : 'text-border'}`}>★</span>
      ))}
    </div>
  )
}

function DesignBadge({ designPlan }: { designPlan: DesignPlan | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!designPlan?.desiredDesign) return null
  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold text-primary bg-accentLight px-3 py-2 rounded-xl w-full text-left hover:bg-accentLight transition-colors"
      >
        <span>{designPlan.desiredDesign}</span>
        <svg className={`w-4 h-4 ml-auto transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs pl-2">
          <span className="bg-prev text-prevText px-2 py-1 rounded-full">
            太さ {designPlan.thicknessLevel >= 0 ? '+' : ''}{designPlan.thicknessLevel}（{thicknessLabels[designPlan.thicknessLevel] ?? '-'}）
          </span>
          <span className="bg-prev text-prevText px-2 py-1 rounded-full">
            角度 {designPlan.angleLevel >= 0 ? '+' : ''}{designPlan.angleLevel}（{angleLabels[designPlan.angleLevel] ?? '-'}）
          </span>
          <span className="bg-prev text-prevText px-2 py-1 rounded-full">
            濃さ {designPlan.densityLevel >= 0 ? '+' : ''}{designPlan.densityLevel}（{densityLabels[designPlan.densityLevel] ?? '-'}）
          </span>
        </div>
      )}
    </div>
  )
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
  const hasTodayKarte = isToday(latestVisit?.visitDate)
  const isNewCustomer = customer.visitCount <= 1

  // The visit to show in 前回施術サマリー
  const summaryVisit = hasTodayKarte ? allVisits[1] : latestVisit
  const reaction = summaryVisit?.reaction as Reaction | null
  const treatmentRecord = summaryVisit?.treatmentRecord as TreatmentRecord | null
  const handover = summaryVisit?.handover as Handover | null
  const designPlan = summaryVisit?.designPlan as DesignPlan | null

  const ngPoints: string[] = (() => {
    if (!customer.profile?.ngPoints) return []
    if (Array.isArray(customer.profile.ngPoints)) return customer.profile.ngPoints as unknown as string[]
    try { return JSON.parse(customer.profile.ngPoints as string) } catch { return [] }
  })()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl hover:bg-cardAlt transition-colors text-textLight"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary">{customer.name}</h1>
            <p className="text-xs text-textLight">顧客詳細 / カルテ</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Summary card */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-text">{customer.name}</h2>
                <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                  isNewCustomer ? 'bg-roseLight text-rose' :
                  customer.visitCount <= 3 ? 'bg-accentLight text-accent' :
                  'bg-cardAlt text-primary'
                }`}>
                  {isNewCustomer ? '初回' : `${customer.visitCount}回目`}
                </span>
                {hasTodayKarte && (
                  <span className="text-sm px-3 py-1 rounded-full font-semibold bg-success bg-opacity-20 text-success">
                    本日完了
                  </span>
                )}
              </div>
              <p className="text-sm text-textLight">
                前回来店: <span className="text-text font-medium">{formatDate(customer.lastVisitDate)}</span>
              </p>
            </div>
            <button
              onClick={() => router.push(`/customers/${id}/edit`)}
              className="px-4 py-2 bg-cardAlt border border-border text-primary rounded-xl text-sm font-medium hover:bg-accentLight transition-colors"
            >
              情報を編集
            </button>
          </div>
        </div>

        {/* 前回施術サマリー */}
        {summaryVisit && (
          <SectionCard
            title="前回施術サマリー"
            collapsible
            defaultOpen
            badge={formatDate(summaryVisit.visitDate)}
            badgeColor="bg-prev text-prevText"
          >
            <div className="space-y-4">
              {/* AI placeholder text */}
              <div className="bg-primary bg-opacity-5 border border-primary border-opacity-20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary bg-opacity-10 text-primary font-medium">
                    AI生成（実装予定）
                  </span>
                </div>
                <p className="text-sm text-text leading-relaxed">
                  {customer.name}様は{customer.visitCount}回目のご来店です。
                  {treatmentRecord?.treatmentTags && treatmentRecord.treatmentTags.length > 0
                    ? `前回は${treatmentRecord.treatmentTags.join('・')}を実施しました。`
                    : ''}
                  {reaction ? `仕上がり満足度は${reaction.satisfactionLevel}/5。` : ''}
                  {handover?.handoverText ? `次回への申し送り：${handover.handoverText}` : ''}
                </p>
              </div>

              {/* NG points */}
              {ngPoints.length > 0 && (
                <div>
                  <p className="text-xs text-warning font-semibold mb-1.5">NG事項</p>
                  <div className="flex flex-wrap gap-1">
                    {ngPoints.map((ng: string) => (
                      <span key={ng} className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-warning border border-warning border-opacity-30 font-medium">
                        NG: {ng}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Design with tap-to-expand */}
              <div>
                <p className="text-xs text-textLight font-medium mb-2">前回デザイン</p>
                <DesignBadge designPlan={designPlan} />
              </div>

              {/* Treatment */}
              {treatmentRecord && (
                <div>
                  <p className="text-xs text-textLight font-medium mb-2">実施内容</p>
                  <div className="flex flex-wrap gap-1">
                    {treatmentRecord.treatmentTags?.map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-accentLight text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {treatmentRecord.treatmentNote && (
                    <p className="text-xs text-textLight mt-2 bg-cardAlt rounded-lg px-3 py-2">
                      {treatmentRecord.treatmentNote}
                    </p>
                  )}
                </div>
              )}

              {/* Reaction */}
              {reaction && (
                <div>
                  <p className="text-xs text-textLight font-medium mb-2">仕上がり反応</p>
                  <div className="flex items-center gap-3 mb-2">
                    <StarDisplay level={reaction.satisfactionLevel} />
                    <span className="text-sm font-medium text-text">{reaction.satisfactionLevel}/5</span>
                  </div>
                  {reaction.reactionTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {reaction.reactionTags.map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-success bg-opacity-20 text-success">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {reaction.concernTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {reaction.concernTags.map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-warning">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Handover → "前回から引き継ぎ" */}
              {handover?.handoverText && (
                <div>
                  <p className="text-xs text-textLight font-medium mb-2">前回から引き継ぎ</p>
                  <div className="bg-primary bg-opacity-5 border border-primary border-opacity-20 rounded-xl p-3">
                    <p className="text-sm text-primary font-medium">{handover.handoverText}</p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Customer profile — 5 fields only */}
        <SectionCard
          title="お客様情報枠"
          collapsible
          defaultOpen
          badge={customer.profile ? '登録済み' : '未登録'}
          badgeColor={customer.profile ? 'bg-accentLight text-primary' : 'bg-roseLight text-rose'}
          titleRight={
            <button
              onClick={() => router.push(`/customers/${id}/edit`)}
              className="text-xs px-3 py-1 bg-primary text-white rounded-lg hover:bg-primaryLight transition-colors"
            >
              編集
            </button>
          }
        >
          <ProfileSection profile={customer.profile} />
        </SectionCard>

        {/* 本日のカルテ作成 */}
        <SectionCard title="本日のカルテ作成" defaultOpen>
          {hasTodayKarte ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-success bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-success">✓</span>
              </div>
              <p className="text-sm font-semibold text-success mb-1">本日のカルテ完了</p>
              <p className="text-xs text-textLight mb-4">記録日: {formatDate(latestVisit?.visitDate)}</p>
              <button
                onClick={() => router.push(`/customers/${id}/visit/${latestVisit?.id}`)}
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

        {/* 来店履歴 — clickable */}
        {allVisits.length > 0 && (
          <SectionCard
            title="来店履歴"
            collapsible
            defaultOpen={false}
            badge={`${allVisits.length}件`}
          >
            <div className="space-y-2">
              {allVisits.map((visit, index) => {
                const vReaction = visit.reaction as Reaction | null
                const vHandover = visit.handover as Handover | null
                const vDesign = visit.designPlan as DesignPlan | null
                return (
                  <button
                    key={visit.id}
                    onClick={() => router.push(`/customers/${id}/visit/${visit.id}`)}
                    className="w-full flex gap-3 py-3 border-b border-border last:border-0 hover:bg-cardAlt rounded-xl px-2 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-cardAlt rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      {allVisits.length - index}
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
                      {vReaction && (
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <span key={i} className={`text-sm ${i <= vReaction.satisfactionLevel ? 'text-accent' : 'text-border'}`}>★</span>
                          ))}
                        </div>
                      )}
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
