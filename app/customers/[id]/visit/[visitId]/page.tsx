'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Customer, VisitRecord, DesignPlan, TodayObservation, TreatmentRecord, Handover, SkinRiskLevel } from '@/Other/types'
import SectionCard from '@/Front/components/SectionCard'
import ChipSelector from '@/Front/components/ChipSelector'
import LevelSelector, { thicknessLabels, densityLabels } from '@/Front/components/LevelSelector'
import ProfileSection from '@/Front/components/ProfileSection'
import CautionBadges, { getCautionInfo } from '@/Front/components/CautionBadges'
import BeforeAfterPhotos from '@/Front/components/BeforeAfterPhotos'
import StructuredBriefingPanel from '@/Front/components/StructuredBriefingPanel'
import { normalizeSkinRiskLevels, toggleSkinRiskLevel } from '@/Other/lib/skin-risk'

const DESIGN_OPTIONS = ['平行', '平行アーチ', 'アーチ', 'ストレート', 'ナチュラル', '韓国風', 'お任せ']
const BROW_CONDITION_TAGS = ['通常', '伸びている', 'まばら', '不揃い', '左右差目立つ']
const SELF_CARE_AREA_TAGS = ['なし', 'あり', '右眉下', '左眉下', '眉頭', '眉山', '眉尻', '全体']
const SKIN_CONDITION_TAGS = ['問題なし', '赤み', '乾燥', 'ニキビ', '傷', '皮むけ', '施術注意']
const TREATMENT_TAGS = ['ワックス', '間引き', 'カット', '毛抜き', '眉山調整', '眉尻調整', 'メイク仕上げ']
const EYEBROW_DETAIL_TAGS = ['眉頭調整', '眉山調整', '眉尻調整', '眉下ライン', '眉上ライン', '長さカット']
const CHANGE_REASON_TAGS = ['顧客希望', 'スタッフ判断', '似合わせ調整', 'その他']
const SKIN_RISK_OPTIONS: { value: SkinRiskLevel; label: string }[] = [
  { value: 'ok', label: '問題なし' },
  { value: 'caution', label: '注意' },
  { value: 'medication', label: '薬服用' },
]
const MEDICATION_TAGS = ['アトピー', 'ニキビ用']
const MEDICATION_OTHER = 'その他'
const CUSTOMER_STANCE_OPTIONS = ['こだわり強い', 'お任せ', '特になし']

interface FormState {
  desiredDesign: string
  thicknessLevel: number
  densityLevel: number
  changeReason: string[]
  majorChangeReason: string[]
  customerRequestNote: string
  browConditionTags: string[]
  selfCareImpactExists: boolean
  selfCareImpactArea: string[]
  selfCareImpactLevel: number
  todaySkinConditionTags: string[]
  todaySkinRiskLevel: SkinRiskLevel[]
  medicationTags: string[]
  medicationOtherNote: string
  observationNote: string
  treatmentTags: string[]
  rightBrowTreatmentTags: string[]
  leftBrowTreatmentTags: string[]
  customerStance: string
  particularNote: string
  treatmentNote: string
  handoverText: string
  staffEditNote: string
  staffEditedHandover: string
  skinCautionTags: string[]
  asymmetryCautionTags: string[]
}

function getDisplayObservationNote(visit: VisitRecord): string {
  return visit.staffEditedHandover || visit.aiGeneratedHandover || visit.originalObservationMemo || ''
}

function visitToForm(visit: VisitRecord): FormState {
  const dp = visit.designPlan as DesignPlan | null
  const to = visit.todayObservation as TodayObservation | null
  const tr = visit.treatmentRecord as TreatmentRecord | null
  const h = visit.handover as Handover | null
  return {
    desiredDesign: dp?.desiredDesign ?? '',
    thicknessLevel: Math.max(-3, Math.min(3, dp?.thicknessLevel ?? 0)),
    densityLevel: Math.max(-3, Math.min(3, dp?.densityLevel ?? 0)),
    changeReason: dp?.changeReason ?? [],
    majorChangeReason: dp?.majorChangeReason ?? [],
    customerRequestNote: dp?.customerRequestNote ?? '',
    browConditionTags: to?.browConditionTags ?? [],
    selfCareImpactExists: to?.selfCareImpactExists ?? false,
    selfCareImpactArea: to?.selfCareImpactArea ?? [],
    selfCareImpactLevel: to?.selfCareImpactLevel ?? 0,
    todaySkinConditionTags: to?.todaySkinConditionTags ?? [],
    todaySkinRiskLevel: normalizeSkinRiskLevels(to?.todaySkinRiskLevel),
    medicationTags: to?.medicationTags ?? [],
    medicationOtherNote: to?.medicationOtherNote ?? '',
    observationNote: getDisplayObservationNote(visit),
    treatmentTags: tr?.treatmentTags ?? [],
    rightBrowTreatmentTags: tr?.rightBrowTreatmentTags ?? [],
    leftBrowTreatmentTags: tr?.leftBrowTreatmentTags ?? [],
    customerStance: tr?.customerStance ?? '',
    particularNote: tr?.particularNote ?? '',
    treatmentNote: tr?.treatmentNote ?? '',
    handoverText: h?.handoverText ?? '',
    staffEditNote: h?.staffEditNote ?? '',
    staffEditedHandover: visit.staffEditedHandover ?? '',
    skinCautionTags: h?.skinCautionTags ?? [],
    asymmetryCautionTags: h?.asymmetryCautionTags ?? [],
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'なし'
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function applyExclusiveOption(next: string[], previous: string[], exclusiveValue: string) {
  const hasExclusive = next.includes(exclusiveValue)
  const hadExclusive = previous.includes(exclusiveValue)
  if (hasExclusive && !hadExclusive) return [exclusiveValue]
  if (hasExclusive && next.length > 1) return next.filter((value) => value !== exclusiveValue)
  return next
}

export default function VisitDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const customerId = params?.id as string
  const visitId = params?.visitId as string
  const isDebug = searchParams?.get('debug') === 'true'

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
        const found = data.visitRecords?.find((v) => v.treatmentId === visitId) ?? null
        setVisit(found)
        if (found) {
          setForm(visitToForm(found))
          // draft状態のカルテは自動的に編集モードで開く
          if (found.visitPolicy === 'draft') setIsEditing(true)
        }
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
          medicationTags: form.medicationTags,
          medicationOtherNote: form.medicationOtherNote,
          observationNote: form.observationNote,
        },
        treatmentRecord: {
          treatmentTags: form.treatmentTags,
          rightBrowTreatmentTags: form.rightBrowTreatmentTags,
          leftBrowTreatmentTags: form.leftBrowTreatmentTags,
          customerStance: form.customerStance,
          particularNote: form.particularNote,
          treatmentNote: form.treatmentNote,
        },
        handover: {
          handoverText: form.handoverText,
          staffEditNote: form.staffEditNote,
          skinCautionTags: form.skinCautionTags,
          asymmetryCautionTags: form.asymmetryCautionTags,
        },
        // 編集時の観察メモはstaffEditedHandoverに保存（originalObservationMemoは保護）
        staffEditedHandover: form.staffEditedHandover || form.observationNote || undefined,
        // draftから本保存する場合はvisitPolicyを確定（PUT APIがvisitCountをインクリメント）
        ...(visit?.visitPolicy === 'draft' && { visitPolicy: 'partial_change' }),
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

  const visitCautions = getCautionInfo(customer, visit)

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* ── Header ── */}
      <header className="bg-card sticky top-0 z-10" style={{ boxShadow: '0 1px 0 #E8E0D7, 0 2px 12px rgba(90,62,43,0.05)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-textLight flex-shrink-0"
              style={{ background: '#F8F3EE' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-semibold text-primary truncate">{customer.name}</h1>
                <span className="text-sm text-muted flex-shrink-0">第{visit.visitNumber}回</span>
                {visit.visitPolicy === 'draft' && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(203,111,81,0.12)', color: '#CB6F51' }}>下書き</span>
                )}
              </div>
              <p className="text-xs text-muted">{formatDate(visit.visitDate)} のカルテ</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {saved && (
              <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'rgba(76,139,98,0.10)', color: '#4C8B62' }}>保存済み</span>
            )}
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="text-sm px-4 py-2 rounded-xl font-medium transition-colors"
                style={{ background: '#F8F3EE', border: '1px solid #E8E0D7', color: '#5A3E2B' }}
              >
                編集する
              </button>
            )}
            <Link href="/" className="text-xs text-muted hover:text-primary transition-colors px-2 py-1">TOP</Link>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-25" />
      </header>

      {/* 要注意顧客の表示（ヘッダー直下に固定表示） */}
      {visitCautions.length > 0 && (
        <div className="px-4 py-2.5" style={{ background: '#F8F3EE', borderBottom: '1px solid #E8E0D7' }}>
          <div className="max-w-3xl mx-auto">
            <CautionBadges customer={customer} latestVisit={visit} />
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="bg-orange-50 border border-warning border-opacity-30 rounded-xl p-3 text-warning text-sm">
            {error}
          </div>
        )}

        {/* カルテ識別情報 */}
        <div className="bg-cardAlt rounded-2xl border border-border px-4 py-3 flex flex-wrap gap-3 text-xs text-textLight">
          <span><span className="font-medium text-text">カルテID:</span> {visit.treatmentId}</span>
          <span><span className="font-medium text-text">来店回数:</span> 第{visit.visitNumber}回</span>
          <span><span className="font-medium text-text">施術日:</span> {formatDate(visit.visitDate)}</span>
          <span><span className="font-medium text-text">担当:</span> {visit.staffName ?? '未設定'}</span>
          {visit.previousTreatmentId && (
            <span><span className="font-medium text-text">前回:</span> {visit.previousTreatmentId}</span>
          )}
        </div>

        {/* 施術サマリー */}
        <SectionCard
          title="施術サマリー"
          collapsible
          defaultOpen
          badge={formatDate(visit.visitDate)}
          badgeColor="bg-prev text-prevText"
        >
          <div className="space-y-4">
            <StructuredBriefingPanel customer={customer} visit={visit} />

            <BeforeAfterPhotos title="今回の施術写真" />
          </div>
        </SectionCard>

        {/* お客様情報枠 */}
        <SectionCard title="お客様情報枠" collapsible defaultOpen>
          <ProfileSection profile={customer.profile} />
        </SectionCard>

        {/* デバッグ用JSONデータ — ?debug=true のときのみ表示 */}
        {isDebug && !isEditing && (
          <SectionCard title="データ確認（JSON）[DEBUG]" collapsible defaultOpen={false}>
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

        {/* Edit sections */}
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
                  minLevel={-3}
                  maxLevel={3}
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
                      const next = applyExclusiveOption(v, form.selfCareImpactArea, 'なし')
                      updateForm('selfCareImpactArea', next)
                      updateForm('selfCareImpactExists', next.length > 0 && !next.includes('なし'))
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text mb-2">当日の肌状態</p>
                  <ChipSelector
                    options={SKIN_CONDITION_TAGS}
                    selected={form.todaySkinConditionTags}
                    onChange={(v) => updateForm('todaySkinConditionTags', applyExclusiveOption(v, form.todaySkinConditionTags, '問題なし'))}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text mb-2">肌リスクレベル</p>
                  <div className="flex gap-2">
                    {SKIN_RISK_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateForm('todaySkinRiskLevel', toggleSkinRiskLevel(form.todaySkinRiskLevel, value))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          form.todaySkinRiskLevel.includes(value)
                            ? value === 'ok' ? 'bg-primary text-white border-primary' : 'bg-warning text-white border-warning'
                            : 'bg-card text-textLight border-border hover:border-primary'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {form.todaySkinRiskLevel.includes('medication') && (
                  <div className="bg-orange-50 rounded-xl p-3 border border-warning border-opacity-30 space-y-3">
                    <p className="text-xs text-warning font-semibold">薬の用途（複数選択可）</p>
                    <ChipSelector
                      options={[...MEDICATION_TAGS, MEDICATION_OTHER]}
                      selected={form.medicationTags}
                      onChange={(v) => updateForm('medicationTags', v)}
                    />
                    {form.medicationTags.includes(MEDICATION_OTHER) && (
                      <input
                        type="text"
                        placeholder="その他の用途を入力してください"
                        value={form.medicationOtherNote}
                        onChange={(e) => updateForm('medicationOtherNote', e.target.value)}
                        className="w-full p-2 rounded-lg border border-warning border-opacity-30 bg-white text-sm text-text placeholder-muted focus:outline-none"
                      />
                    )}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-text mb-2">観察メモ（スタッフ編集）</p>
                  {visit.originalObservationMemo && (
                    <p className="text-xs text-textLight mb-1.5 bg-prev rounded-lg px-3 py-1.5">
                      原文: {visit.originalObservationMemo}
                    </p>
                  )}
                  <textarea
                    value={form.staffEditedHandover || form.observationNote}
                    onChange={(e) => updateForm('staffEditedHandover', e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text focus:outline-none focus:border-primary resize-none"
                    rows={3}
                    placeholder="観察メモを編集（原文は保護されます）"
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
                  <p className="text-sm font-medium text-text mb-2">お客様の施術方針・こだわり</p>
                  <ChipSelector
                    options={CUSTOMER_STANCE_OPTIONS}
                    selected={form.customerStance ? [form.customerStance] : []}
                    onChange={(v) => updateForm('customerStance', v[0] ?? '')}
                    multiSelect={false}
                  />
                </div>
                {form.customerStance === 'こだわり強い' && (
                  <div className="bg-roseLight rounded-xl p-3 border border-rose border-opacity-20">
                    <p className="text-xs text-rose font-semibold mb-2">今回とくに確認したこだわり</p>
                    <textarea
                      value={form.particularNote}
                      onChange={(e) => updateForm('particularNote', e.target.value)}
                      className="w-full p-2 rounded-lg border border-rose border-opacity-30 bg-white text-sm text-text focus:outline-none resize-none"
                      rows={2}
                      placeholder="例：太さは残す、眉山は強調しない、左右差を目立たせない"
                    />
                  </div>
                )}
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

            {/* Handover */}
            <SectionCard title="会話・次回共有メモ" collapsible defaultOpen>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-text mb-1">お客様との会話・次回共有メモ</p>
                  <p className="text-xs text-muted mb-2">
                    次回担当が接客中に見てもよい内容。会話内容、好み、次回話題、ご要望など。
                  </p>
                  <textarea
                    value={form.handoverText}
                    onChange={(e) => updateForm('handoverText', e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-card text-sm text-text focus:outline-none focus:border-primary resize-none"
                    rows={4}
                    placeholder="例：次回は自然め希望。旅行の話題あり。"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text mb-1">スタッフ内部メモ</p>
                  <p className="text-xs text-muted mb-2">
                    領収書など特殊対応がある時だけ。基本は空欄でOK。
                  </p>
                  <textarea
                    value={form.staffEditNote}
                    onChange={(e) => updateForm('staffEditNote', e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text focus:outline-none focus:border-primary resize-none"
                    rows={2}
                    placeholder="例：領収書発行あり。"
                  />
                </div>
              </div>
            </SectionCard>
          </>
        )}
      </main>

      {/* ── Fixed footer (edit mode) ── */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 bg-card px-4 py-3"
          style={{ boxShadow: '0 -1px 0 #E8E0D7, 0 -4px 16px rgba(90,62,43,0.06)' }}>
          <div className="max-w-3xl mx-auto flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="flex-shrink-0 rounded-xl font-medium text-sm text-textLight transition-colors"
              style={{ height: '52px', padding: '0 20px', background: '#F8F3EE', border: '1.5px solid #E8E0D7' }}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                height: '52px',
                background: saving ? '#7AAA8A' : 'linear-gradient(135deg, #4C8B62 0%, #5EA075 100%)',
                boxShadow: '0 2px 8px rgba(76,139,98,0.28)',
              }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
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
