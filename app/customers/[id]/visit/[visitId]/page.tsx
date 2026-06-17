'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Customer, VisitRecord, DesignPlan, TodayObservation, TreatmentRecord, Handover, SkinRiskLevel, EyebrowTreatmentMark } from '@/Other/types'
import SectionCard from '@/Front/components/SectionCard'
import ChipSelector from '@/Front/components/ChipSelector'
import DesignOptionChips from '@/Front/components/DesignOptionChips'
import ProfileSection from '@/Front/components/ProfileSection'
import CautionBadges, { getCautionInfo } from '@/Front/components/CautionBadges'
import BeforeAfterPhotos from '@/Front/components/BeforeAfterPhotos'
import StructuredBriefingPanel from '@/Front/components/StructuredBriefingPanel'
import EyebrowMarkAccordion from '@/Front/components/EyebrowMarkAccordion'
import { hasAnySkinCaution, hasSkinRisk, normalizeSkinRiskLevels, toggleSkinRiskLevel } from '@/Other/lib/skin-risk'

const DESIGN_OPTIONS = ['ナチュラル', '平行', 'アーチ', 'ストレート', '優しく', 'きりっと', '自眉いかす', '左右差近づけ', 'モード']
const DESIGN_SUB_OPTIONS: Record<string, string[]> = {
  '平行': ['山カク', '山ナチュラル'],
  'ストレート': ['平行め', '角度つける'],
  'きりっと': ['山カク', '山ナチュラル'],
}
const THICKNESS_OPTIONS = ['細く', '少し細く', '太さキープ']
const DENSITY_OPTIONS = ['少し薄く', '薄く', '状態キープ', 'カット']
const SKIN_CONDITION_TAGS = ['問題なし', '赤み', '乾燥', 'ニキビ', '傷', '皮むけ', '自己処理あり', '日焼け']
const SKIN_RISK_OPTIONS: { value: SkinRiskLevel; label: string }[] = [
  { value: 'ok', label: '問題なし' },
  { value: 'caution', label: '注意' },
  { value: 'medication', label: '薬服用' },
]
const MEDICATION_TAGS = ['アトピー', 'ニキビ用']
const MEDICATION_OTHER = 'その他'
const CUSTOMER_STANCE_OPTIONS = ['こだわり強い', 'お任せ', '特になし']
const PERMA_MEDICATION_OPTIONS = ['ハード', 'ミディアム']
const PERMA_TIME_OPTIONS = ['5', '10', '15', 'カスタム']

interface FormState {
  desiredDesign: string[]
  designSubOptions: Record<string, string>
  thickness: string
  density: string
  designMemo: string
  eyebrowMarkMemo: string
  customerStance: string
  particularNote: string
  permaEnabled: boolean
  permaMedication: string
  permaTime: string
  permaCustomTime: number
  todaySkinConditionTags: string[]
  todaySkinRiskLevel: SkinRiskLevel[]
  medicationTags: string[]
  medicationOtherNote: string
  observationNote: string
  staffEditedHandover: string
  handoverText: string
  staffEditNote: string
  staffEditNoteImportant: boolean
  skinCautionTags: string[]
  eyebrowTreatmentMarks: EyebrowTreatmentMark[]
}

function normalizeDesiredDesign(val: string | string[] | null | undefined): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  return [val]
}

function normalizeDesignSubOptions(
  subOptions: Record<string, string> | null | undefined,
  legacySubOption: string | undefined,
  legacyDesign: string | string[] | undefined,
): Record<string, string> {
  if (subOptions && Object.keys(subOptions).length > 0) return subOptions
  if (legacySubOption && legacyDesign) {
    const design = Array.isArray(legacyDesign) ? legacyDesign[0] : legacyDesign
    if (design) return { [design]: legacySubOption }
  }
  return {}
}

function getDisplayObservationNote(visit: VisitRecord): string {
  return visit.staffEditedHandover || visit.aiGeneratedHandover || visit.originalObservationMemo || ''
}

function visitToForm(visit: VisitRecord): FormState {
  const dp = visit.designPlan as (DesignPlan & {
    designSubOptions?: Record<string, string>
    customerStance?: string
    particularNote?: string
    permaEnabled?: boolean
    permaMedication?: string
    permaTime?: string
    permaCustomTime?: number
  }) | null
  const to = visit.todayObservation as TodayObservation | null
  const tr = visit.treatmentRecord as (TreatmentRecord & { eyebrowMarkMemo?: string }) | null
  const h = visit.handover as (Handover & { staffEditNoteImportant?: boolean }) | null
  return {
    desiredDesign: normalizeDesiredDesign(dp?.desiredDesign),
    designSubOptions: normalizeDesignSubOptions(dp?.designSubOptions, dp?.designSubOption, dp?.desiredDesign),
    thickness: dp?.thickness ?? '太さキープ',
    density: dp?.density ?? '状態キープ',
    designMemo: dp?.designMemo ?? '',
    eyebrowMarkMemo: tr?.eyebrowMarkMemo ?? '',
    customerStance: dp?.customerStance ?? tr?.customerStance ?? '',
    particularNote: dp?.particularNote ?? tr?.particularNote ?? '',
    permaEnabled: dp?.permaEnabled ?? false,
    permaMedication: dp?.permaMedication ?? '',
    permaTime: dp?.permaTime ?? '',
    permaCustomTime: dp?.permaCustomTime ?? 5,
    todaySkinConditionTags: to?.todaySkinConditionTags ?? [],
    todaySkinRiskLevel: normalizeSkinRiskLevels(to?.todaySkinRiskLevel),
    medicationTags: to?.medicationTags ?? [],
    medicationOtherNote: to?.medicationOtherNote ?? '',
    observationNote: getDisplayObservationNote(visit),
    staffEditedHandover: visit.staffEditedHandover ?? '',
    handoverText: h?.handoverText ?? '',
    staffEditNote: h?.staffEditNote ?? '',
    staffEditNoteImportant: h?.staffEditNoteImportant ?? false,
    skinCautionTags: h?.skinCautionTags ?? [],
    eyebrowTreatmentMarks: tr?.eyebrowTreatmentMarks ?? [],
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
    setError(null)
    try {
      const body = {
        designPlan: {
          desiredDesign: form.desiredDesign,
          designSubOptions: form.designSubOptions,
          thickness: form.thickness,
          density: form.density,
          designMemo: form.designMemo,
          customerStance: form.customerStance,
          particularNote: form.particularNote,
          permaEnabled: form.permaEnabled,
          permaMedication: form.permaMedication,
          permaTime: form.permaTime,
          permaCustomTime: form.permaCustomTime,
        },
        todayObservation: {
          todaySkinConditionTags: form.todaySkinConditionTags,
          todaySkinRiskLevel: form.todaySkinRiskLevel,
          medicationTags: form.medicationTags,
          medicationOtherNote: form.medicationOtherNote,
          observationNote: form.observationNote,
        },
        treatmentRecord: {
          rightBrowTreatmentTags: [],
          leftBrowTreatmentTags: [],
          customerStance: form.customerStance,
          particularNote: form.particularNote,
          treatmentNote: '',
          eyebrowTreatmentMarks: form.eyebrowTreatmentMarks,
          eyebrowMarkMemo: form.eyebrowMarkMemo,
        },
        handover: {
          handoverText: form.handoverText,
          staffEditNote: form.staffEditNote,
          staffEditNoteImportant: form.staffEditNoteImportant,
          skinCautionTags: form.skinCautionTags,
        },
        staffEditedHandover: form.staffEditedHandover || form.observationNote || undefined,
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
  const hasSkinCaution = hasAnySkinCaution(form.todaySkinRiskLevel) || form.todaySkinConditionTags.some(t => t !== '問題なし')

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

      {visitCautions.length > 0 && (
        <div className="px-4 py-2.5" style={{ background: '#F8F3EE', borderBottom: '1px solid #E8E0D7' }}>
          <div className="max-w-3xl mx-auto">
            <CautionBadges customer={customer} latestVisit={visit} />
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* 施術マーク記録 */}
        <EyebrowMarkAccordion
          marks={form.eyebrowTreatmentMarks}
          onChange={(marks) => updateForm('eyebrowTreatmentMarks', marks)}
          markMemo={form.eyebrowMarkMemo}
          onMarkMemoChange={(memo) => updateForm('eyebrowMarkMemo', memo)}
          customerId={customerId}
          treatmentId={visit.treatmentId}
          visitNumber={visit.visitNumber}
          readOnly={!isEditing}
          defaultOpen={form.eyebrowTreatmentMarks.length > 0}
        />

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

        {/* デバッグ用JSONデータ */}
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

            {/* デザイン調整 */}
            <SectionCard title="デザイン調整" collapsible defaultOpen>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-text mb-2">デザイン</p>
                  <DesignOptionChips
                    options={DESIGN_OPTIONS}
                    subOptionsMap={DESIGN_SUB_OPTIONS}
                    selected={form.desiredDesign}
                    subSelected={form.designSubOptions}
                    onChange={(v) => updateForm('desiredDesign', v)}
                    onSubChange={(v) => updateForm('designSubOptions', v)}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-text mb-2">太さ</p>
                  <ChipSelector
                    options={THICKNESS_OPTIONS}
                    selected={form.thickness ? [form.thickness] : []}
                    onChange={(v) => updateForm('thickness', v[0] ?? '')}
                    multiSelect={false}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-text mb-2">濃さ</p>
                  <ChipSelector
                    options={DENSITY_OPTIONS}
                    selected={form.density ? [form.density] : []}
                    onChange={(v) => updateForm('density', v[0] ?? '')}
                    multiSelect={false}
                  />
                </div>

                {/* お客様の施術方針・こだわり */}
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

                {/* 施術内容: パーマ */}
                <div>
                  <p className="text-sm font-medium text-text mb-2">施術内容</p>
                  <button
                    type="button"
                    onClick={() => updateForm('permaEnabled', !form.permaEnabled)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      form.permaEnabled
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-textLight border-border hover:border-primary'
                    }`}
                  >
                    パーマ
                  </button>
                  {form.permaEnabled && (
                    <div className="mt-3 space-y-4 bg-cardAlt rounded-xl p-4 border border-border">
                      <div>
                        <p className="text-xs font-medium text-text mb-2">薬剤</p>
                        <div className="flex gap-2">
                          {PERMA_MEDICATION_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => updateForm('permaMedication', form.permaMedication === opt ? '' : opt)}
                              className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                                form.permaMedication === opt
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-card text-textLight border-border hover:border-primary'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-text mb-2">時間</p>
                        <div className="flex gap-2 flex-wrap">
                          {PERMA_TIME_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => updateForm('permaTime', form.permaTime === opt ? '' : opt)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                                form.permaTime === opt
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-card text-textLight border-border hover:border-primary'
                              }`}
                            >
                              {opt === 'カスタム' ? opt : `${opt}分`}
                            </button>
                          ))}
                        </div>
                        {form.permaTime === 'カスタム' && (
                          <div className="mt-3">
                            <p className="text-xs text-muted mb-2">時間を選択（3〜15分）</p>
                            <div className="flex flex-wrap gap-1.5">
                              {Array.from({ length: 13 }, (_, i) => i + 3).map((min) => (
                                <button
                                  key={min}
                                  type="button"
                                  onClick={() => updateForm('permaCustomTime', min)}
                                  className={`w-10 h-9 rounded-lg text-xs font-semibold border transition-all ${
                                    form.permaCustomTime === min
                                      ? 'bg-primary text-white border-primary'
                                      : 'bg-card text-textLight border-border hover:border-primary'
                                  }`}
                                >
                                  {min}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-primary font-medium mt-2">選択中: {form.permaCustomTime}分</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-text mb-2">施術メモ</p>
                  <textarea
                    value={form.designMemo}
                    onChange={(e) => updateForm('designMemo', e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text focus:outline-none focus:border-primary resize-none"
                    rows={2}
                    placeholder="デザインに関するメモ（任意）"
                  />
                </div>
              </div>
            </SectionCard>

            {/* お客様状態 */}
            <SectionCard title="お客様状態" collapsible defaultOpen>
              <div className="space-y-4">
                <div>
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
                {hasSkinRisk(form.todaySkinRiskLevel, 'medication') && (
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

            {/* 肌状態注意（スキン警告がある場合のみ） */}
            {hasSkinCaution && (
              <SectionCard title="次回スタッフへの肌注意は？" collapsible defaultOpen badge="肌状態注意" badgeColor="bg-orange-50 text-warning">
                <ChipSelector
                  options={['赤みが出やすい', '乾燥あり', 'ワックス範囲注意', '一部施術を避ける', '痛みを感じやすい', '施術前に肌状態を再確認']}
                  selected={form.skinCautionTags}
                  onChange={(v) => updateForm('skinCautionTags', v)}
                />
              </SectionCard>
            )}

            {/* 会話・次回共有メモ */}
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
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-text">スタッフ内部メモ</p>
                    <button
                      type="button"
                      onClick={() => updateForm('staffEditNoteImportant', !form.staffEditNoteImportant)}
                      className="flex items-center gap-1 text-xs font-medium transition-colors"
                      title="重要フラグ"
                    >
                      {form.staffEditNoteImportant ? (
                        <svg className="w-5 h-5 text-warning" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      )}
                    </button>
                    {form.staffEditNoteImportant && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(203,111,81,0.12)', color: '#CB6F51' }}>重要</span>
                    )}
                  </div>
                  <p className="text-xs text-muted mb-2">
                    領収書など特殊対応がある時だけ。基本は空欄でOK。
                  </p>
                  <textarea
                    value={form.staffEditNote}
                    onChange={(e) => updateForm('staffEditNote', e.target.value)}
                    className={`w-full p-3 rounded-xl border text-sm text-text placeholder-muted focus:outline-none resize-none ${
                      form.staffEditNoteImportant
                        ? 'border-warning border-opacity-50 bg-orange-50'
                        : 'border-border bg-cardAlt focus:border-primary'
                    }`}
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
