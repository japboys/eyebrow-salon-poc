'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Customer, VisitRecord, DesignPlan, TodayObservation, TreatmentRecord, Reaction, Handover } from '@/Other/types'
import SectionCard from '@/Front/components/SectionCard'
import ChipSelector from '@/Front/components/ChipSelector'
import LevelSelector, { thicknessLabels, angleLabels, densityLabels } from '@/Front/components/LevelSelector'
import AIPlaceholder from '@/Front/components/AIPlaceholder'
import ProfileSection from '@/Front/components/ProfileSection'

const DESIGN_OPTIONS = ['平行', '平行アーチ', 'アーチ', 'ストレート', 'ナチュラル', '韓国風', 'お任せ']
const BROW_CONDITION_TAGS = ['通常', '伸びている', 'まばら', '不揃い', '左右差目立つ']
const SELF_CARE_AREA_TAGS = ['なし', 'あり', '右眉下', '左眉下', '眉頭', '眉山', '眉尻', '全体']
const SKIN_CONDITION_TAGS = ['問題なし', '赤み', '乾燥', 'ニキビ', '傷', '皮むけ', '施術注意']
const TREATMENT_TAGS = ['ワックス', '間引き', 'カット', '毛抜き', '眉山調整', '眉尻調整', 'メイク仕上げ']
const EYEBROW_DETAIL_TAGS = ['眉頭調整', '眉山調整', '眉尻調整', '眉下ライン', '眉上ライン', '長さカット']
const REACTION_TAGS = ['満足', 'とても満足', 'ナチュラル仕上げ良い', '自然な仕上がり', '韓国風が気に入っている', '初めてで満足']
const CONCERN_TAGS = ['少し薄かったかも', '右眉尻が少し薄い', '左右差が気になる', '少し太かった', '濃さが気になる']
const CHANGE_REASON_TAGS = ['顧客希望', 'スタッフ判断', '季節の変化', 'トレンド', 'ライフスタイル変化']

interface FormState {
  desiredDesign: string
  thicknessLevel: number
  angleLevel: number
  densityLevel: number
  changeReason: string[]
  majorChangeReason: string[]
  customerRequestNote: string
  browConditionTags: string[]
  selfCareImpactExists: boolean
  selfCareImpactArea: string[]
  selfCareImpactLevel: number
  todaySkinConditionTags: string[]
  todaySkinRiskLevel: number
  observationNote: string
  treatmentTags: string[]
  rightBrowTreatmentTags: string[]
  leftBrowTreatmentTags: string[]
  treatmentNote: string
  satisfactionLevel: number
  reactionTags: string[]
  concernTags: string[]
  nextTimeCustomerRequest: string
  handoverText: string
  staffEditNote: string
  skinCautionTags: string[]
  nextImprovementTags: string[]
  asymmetryCautionTags: string[]
}

function visitToForm(visit: VisitRecord): FormState {
  const dp = visit.designPlan as DesignPlan | null
  const to = visit.todayObservation as TodayObservation | null
  const tr = visit.treatmentRecord as TreatmentRecord | null
  const r = visit.reaction as Reaction | null
  const h = visit.handover as Handover | null
  return {
    desiredDesign: dp?.desiredDesign ?? '',
    thicknessLevel: dp?.thicknessLevel ?? 0,
    angleLevel: dp?.angleLevel ?? 0,
    densityLevel: Math.max(-3, Math.min(3, dp?.densityLevel ?? 0)),
    changeReason: dp?.changeReason ?? [],
    majorChangeReason: dp?.majorChangeReason ?? [],
    customerRequestNote: dp?.customerRequestNote ?? '',
    browConditionTags: to?.browConditionTags ?? [],
    selfCareImpactExists: to?.selfCareImpactExists ?? false,
    selfCareImpactArea: to?.selfCareImpactArea ?? [],
    selfCareImpactLevel: to?.selfCareImpactLevel ?? 0,
    todaySkinConditionTags: to?.todaySkinConditionTags ?? [],
    todaySkinRiskLevel: to?.todaySkinRiskLevel ?? 0,
    observationNote: to?.observationNote ?? '',
    treatmentTags: tr?.treatmentTags ?? [],
    rightBrowTreatmentTags: tr?.rightBrowTreatmentTags ?? [],
    leftBrowTreatmentTags: tr?.leftBrowTreatmentTags ?? [],
    treatmentNote: tr?.treatmentNote ?? '',
    satisfactionLevel: r?.satisfactionLevel ?? 5,
    reactionTags: r?.reactionTags ?? [],
    concernTags: r?.concernTags ?? [],
    nextTimeCustomerRequest: r?.nextTimeCustomerRequest ?? '',
    handoverText: h?.handoverText ?? '',
    staffEditNote: h?.staffEditNote ?? '',
    skinCautionTags: h?.skinCautionTags ?? [],
    nextImprovementTags: h?.nextImprovementTags ?? [],
    asymmetryCautionTags: h?.asymmetryCautionTags ?? [],
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'なし'
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function DesignBadge({ designPlan }: { designPlan: DesignPlan | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!designPlan?.desiredDesign) return null
  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold text-primary bg-accentLight px-3 py-2 rounded-xl w-full text-left"
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

export default function VisitDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params?.id as string
  const visitId = params?.visitId as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [visit, setVisit] = useState<VisitRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (!customerId) return
    fetch(`/api/customers/${customerId}`)
      .then((res) => {
        if (!res.ok) throw new Error('顧客データの取得に失敗しました')
        return res.json()
      })
      .then((data: Customer) => {
        setCustomer(data)
        const found = data.visitRecords?.find((v) => v.id === visitId) ?? null
        setVisit(found)
        if (found) setForm(visitToForm(found))
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [customerId, visitId])

  const updateForm = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
    setIsDirty(true)
  }, [])

  const handleStartEdit = () => {
    setIsEditing(true)
    setIsDirty(false)
  }

  const handleCancelEdit = () => {
    if (isDirty && !window.confirm('変更内容が保存されていません。編集を破棄しますか？')) return
    if (visit) setForm(visitToForm(visit))
    setIsEditing(false)
    setIsDirty(false)
  }

  const handleBack = () => {
    if (isEditing && isDirty && !window.confirm('内容を保存せずに戻りますか？')) return
    router.back()
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    try {
      const body = {
        designPlan: {
          desiredDesign: form.desiredDesign,
          thicknessLevel: form.thicknessLevel,
          angleLevel: form.angleLevel,
          densityLevel: form.densityLevel,
          changeReason: form.changeReason,
          majorChangeReason: form.majorChangeReason,
          customerRequestNote: form.customerRequestNote,
        },
        todayObservation: {
          browConditionTags: form.browConditionTags,
          selfCareImpactExists: form.selfCareImpactExists,
          selfCareImpactArea: form.selfCareImpactArea,
          selfCareImpactLevel: form.selfCareImpactLevel,
          todaySkinConditionTags: form.todaySkinConditionTags,
          todaySkinRiskLevel: form.todaySkinRiskLevel,
          observationNote: form.observationNote,
        },
        treatmentRecord: {
          treatmentTags: form.treatmentTags,
          rightBrowTreatmentTags: form.rightBrowTreatmentTags,
          leftBrowTreatmentTags: form.leftBrowTreatmentTags,
          treatmentNote: form.treatmentNote,
        },
        reaction: {
          satisfactionLevel: form.satisfactionLevel,
          reactionTags: form.reactionTags,
          concernTags: form.concernTags,
          nextTimeCustomerRequest: form.nextTimeCustomerRequest,
        },
        handover: {
          handoverText: form.handoverText,
          staffEditNote: form.staffEditNote,
          aiGeneratedPlaceholderText: '（AI生成予定）',
          skinCautionTags: form.skinCautionTags,
          nextImprovementTags: form.nextImprovementTags,
          asymmetryCautionTags: form.asymmetryCautionTags,
        },
      }

      const res = await fetch(`/api/visits/${visitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('保存に失敗しました')
      setSaved(true)
      setIsEditing(false)
      setIsDirty(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!customer || !visit || !form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border">
          <p className="text-warning">{error || 'カルテが見つかりません'}</p>
          <button onClick={() => router.push(`/customers/${customerId}`)} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm">戻る</button>
        </div>
      </div>
    )
  }

  const designPlanData = visit.designPlan as DesignPlan | null
  const treatmentData = visit.treatmentRecord as TreatmentRecord | null
  const reactionData = visit.reaction as Reaction | null
  const handoverData = visit.handover as Handover | null

  const ngPoints: string[] = (() => {
    if (!customer.profile?.ngPoints) return []
    if (Array.isArray(customer.profile.ngPoints)) return customer.profile.ngPoints as unknown as string[]
    try { return JSON.parse(customer.profile.ngPoints as string) } catch { return [] }
  })()

  const visitIndex = (customer.visitRecords ?? []).findIndex(v => v.id === visitId)
  const visitNumber = (customer.visitRecords?.length ?? 0) - visitIndex

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-xl hover:bg-cardAlt transition-colors text-textLight"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-primary">{customer.name}</h1>
                <span className="text-sm text-textLight">({visitNumber}回目)</span>
              </div>
              <p className="text-xs text-textLight">{formatDate(visit.visitDate)} のカルテ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs px-2 py-1 rounded-full bg-success bg-opacity-20 text-success">保存済み</span>
            )}
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors bg-cardAlt border border-border text-primary hover:bg-accentLight"
              >
                編集する
              </button>
            )}
            <Link href="/" className="text-xs text-textLight hover:text-primary transition-colors">TOP</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="bg-orange-50 border border-warning border-opacity-30 rounded-xl p-3 text-warning text-sm">
            {error}
          </div>
        )}

        {/* 前回施術サマリー */}
        <SectionCard
          title="施術サマリー"
          collapsible
          defaultOpen
          badge={formatDate(visit.visitDate)}
          badgeColor="bg-prev text-prevText"
        >
          <div className="space-y-4">
            {/* AI placeholder */}
            <div className="bg-primary bg-opacity-5 border border-primary border-opacity-20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary bg-opacity-10 text-primary font-medium">
                  AI生成（実装予定）
                </span>
              </div>
              <p className="text-sm text-text leading-relaxed">
                {customer.name}様の{visitNumber}回目の施術記録です。
                {treatmentData?.treatmentTags && treatmentData.treatmentTags.length > 0
                  ? `${treatmentData.treatmentTags.join('・')}を実施。`
                  : ''}
                {reactionData ? `仕上がり満足度は${reactionData.satisfactionLevel}/5。` : ''}
                {handoverData?.handoverText ? `申し送り：${handoverData.handoverText}` : ''}
              </p>
            </div>

            {/* NG */}
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

            {/* Design tap-to-expand */}
            <div>
              <p className="text-xs text-textLight font-medium mb-2">デザイン</p>
              <DesignBadge designPlan={designPlanData} />
            </div>

            {/* Treatment */}
            {treatmentData?.treatmentTags && treatmentData.treatmentTags.length > 0 && (
              <div>
                <p className="text-xs text-textLight font-medium mb-2">実施内容</p>
                <div className="flex flex-wrap gap-1">
                  {treatmentData.treatmentTags.map((tag: string) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-accentLight text-primary">{tag}</span>
                  ))}
                </div>
                {treatmentData.treatmentNote && (
                  <p className="text-xs text-textLight mt-2 bg-cardAlt rounded-lg px-3 py-2">{treatmentData.treatmentNote}</p>
                )}
              </div>
            )}

            {/* Reaction */}
            {reactionData && (
              <div>
                <p className="text-xs text-textLight font-medium mb-2">仕上がり反応</p>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={`text-base ${i <= reactionData.satisfactionLevel ? 'text-accent' : 'text-border'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-sm font-medium">{reactionData.satisfactionLevel}/5</span>
                </div>
                {reactionData.reactionTags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {reactionData.reactionTags.map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-success bg-opacity-20 text-success">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Handover → 前回から引き継ぎ */}
            {handoverData?.handoverText && (
              <div>
                <p className="text-xs text-textLight font-medium mb-2">前回から引き継ぎ</p>
                <div className="bg-primary bg-opacity-5 border border-primary border-opacity-20 rounded-xl p-3">
                  <p className="text-sm text-primary font-medium">{handoverData.handoverText}</p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* お客様情報枠 */}
        <SectionCard title="お客様情報枠" collapsible defaultOpen>
          <ProfileSection profile={customer.profile} />
        </SectionCard>

        {/* JSON確認（折りたたみ） */}
        {!isEditing && (
          <SectionCard title="データ確認（JSON）" collapsible defaultOpen={false}>
            <details>
              <summary className="cursor-pointer text-sm text-textLight mb-3 hover:text-primary transition-colors">
                全データを表示
              </summary>
              <pre className="bg-cardAlt rounded-xl p-4 overflow-x-auto text-xs text-text leading-relaxed">
                {JSON.stringify(visit, null, 2)}
              </pre>
            </details>
          </SectionCard>
        )}

        {/* アクションボタン（閲覧モード時） */}
        {!isEditing && (
          <div className="flex flex-col gap-3 pb-6">
            <button
              onClick={handleStartEdit}
              className="w-full py-4 bg-cardAlt border-2 border-border text-primary rounded-2xl font-semibold hover:bg-accentLight hover:border-accent transition-all"
            >
              内容を編集する
            </button>
            <Link
              href="/"
              className="block w-full py-4 bg-primary text-white rounded-2xl font-bold text-center shadow-sm hover:bg-primaryLight transition-colors"
            >
              TOPに戻る
            </Link>
          </div>
        )}

        {/* Edit sections — shown only when isEditing */}
        {isEditing && (
          <>
            <div className="bg-primary bg-opacity-5 border border-primary border-opacity-20 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-primary">編集モード — 変更後に「保存する」を押してください</p>
            </div>

            {/* Design adjustment */}
            <SectionCard title="デザイン調整" collapsible defaultOpen>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-text mb-2">希望デザイン</p>
                  <ChipSelector
                    options={DESIGN_OPTIONS}
                    selected={form.desiredDesign ? [form.desiredDesign] : []}
                    onChange={(v) => updateForm('desiredDesign', v[0] ?? '')}
                    multiSelect={false}
                  />
                </div>
                <LevelSelector
                  title="太さ"
                  value={form.thicknessLevel}
                  onChange={(v) => updateForm('thicknessLevel', v)}
                  labels={thicknessLabels}
                  showDiff={false}
                />
                <LevelSelector
                  title="角度"
                  value={form.angleLevel}
                  onChange={(v) => updateForm('angleLevel', v)}
                  labels={angleLabels}
                  showDiff={false}
                />
                <LevelSelector
                  title="濃さ"
                  value={form.densityLevel}
                  onChange={(v) => updateForm('densityLevel', v)}
                  labels={densityLabels}
                  showDiff={false}
                  minLevel={-3}
                  maxLevel={3}
                />
                <div>
                  <p className="text-sm font-medium text-text mb-2">変更理由</p>
                  <ChipSelector
                    options={CHANGE_REASON_TAGS}
                    selected={form.changeReason}
                    onChange={(v) => updateForm('changeReason', v)}
                  />
                </div>
              </div>
            </SectionCard>

            {/* お客様眉状態 */}
            <SectionCard title="お客様眉状態" collapsible defaultOpen>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-text mb-2">当日の眉状態</p>
                  <ChipSelector
                    options={BROW_CONDITION_TAGS}
                    selected={form.browConditionTags}
                    onChange={(v) => updateForm('browConditionTags', v)}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text mb-2">自己処理の跡</p>
                  <ChipSelector
                    options={SELF_CARE_AREA_TAGS}
                    selected={form.selfCareImpactArea}
                    onChange={(v) => {
                      updateForm('selfCareImpactArea', v)
                      updateForm('selfCareImpactExists', v.length > 0 && !v.includes('なし'))
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text mb-2">当日の肌状態</p>
                  <ChipSelector
                    options={SKIN_CONDITION_TAGS}
                    selected={form.todaySkinConditionTags}
                    onChange={(v) => updateForm('todaySkinConditionTags', v)}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text mb-2">観察メモ</p>
                  <textarea
                    value={form.observationNote}
                    onChange={(e) => updateForm('observationNote', e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text focus:outline-none focus:border-primary resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Treatment */}
            <SectionCard title="実施施術内容" collapsible defaultOpen>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-text mb-2">施術内容</p>
                  <ChipSelector
                    options={TREATMENT_TAGS}
                    selected={form.treatmentTags}
                    onChange={(v) => updateForm('treatmentTags', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-text mb-2">右眉</p>
                    <ChipSelector
                      options={EYEBROW_DETAIL_TAGS}
                      selected={form.rightBrowTreatmentTags}
                      onChange={(v) => updateForm('rightBrowTreatmentTags', v)}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text mb-2">左眉</p>
                    <ChipSelector
                      options={EYEBROW_DETAIL_TAGS}
                      selected={form.leftBrowTreatmentTags}
                      onChange={(v) => updateForm('leftBrowTreatmentTags', v)}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-text mb-2">施術メモ</p>
                  <textarea
                    value={form.treatmentNote}
                    onChange={(e) => updateForm('treatmentNote', e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text focus:outline-none focus:border-primary resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Reaction */}
            <SectionCard title="仕上がり反応" collapsible defaultOpen>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-text mb-3">満足度</p>
                  <div className="flex gap-3 items-center">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateForm('satisfactionLevel', star)}
                          className={`text-3xl transition-all ${star <= form.satisfactionLevel ? 'text-accent scale-110' : 'text-border'}`}
                        >★</button>
                      ))}
                    </div>
                    <span className="text-lg font-bold text-primary">{form.satisfactionLevel}/5</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-text mb-2">反応タグ</p>
                  <ChipSelector
                    options={REACTION_TAGS}
                    selected={form.reactionTags}
                    onChange={(v) => updateForm('reactionTags', v)}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text mb-2">懸念タグ</p>
                  <ChipSelector
                    options={CONCERN_TAGS}
                    selected={form.concernTags}
                    onChange={(v) => updateForm('concernTags', v)}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text mb-2">次回へのご要望</p>
                  <textarea
                    value={form.nextTimeCustomerRequest}
                    onChange={(e) => updateForm('nextTimeCustomerRequest', e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text focus:outline-none focus:border-primary resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </SectionCard>

            {/* AI */}
            <SectionCard title="AI申し送り生成（実装予定）" collapsible defaultOpen>
              <AIPlaceholder />
            </SectionCard>

            {/* Handover */}
            <SectionCard title="次回申し送り" collapsible defaultOpen>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-text mb-2">申し送りテキスト</p>
                  <textarea
                    value={form.handoverText}
                    onChange={(e) => updateForm('handoverText', e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-card text-sm text-text focus:outline-none focus:border-primary resize-none"
                    rows={4}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text mb-2">スタッフメモ（内部用）</p>
                  <textarea
                    value={form.staffEditNote}
                    onChange={(e) => updateForm('staffEditNote', e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text focus:outline-none focus:border-primary resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </SectionCard>
          </>
        )}
      </main>

      {/* Fixed footer — only shown in edit mode */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-4 shadow-lg">
          <div className="max-w-3xl mx-auto flex gap-3">
            <button
              onClick={handleCancelEdit}
              className="flex-shrink-0 py-3 px-5 rounded-xl border-2 border-border text-textLight font-medium text-sm hover:bg-cardAlt transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 px-6 bg-success text-white rounded-xl font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <span>✓</span>
                  保存する
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
