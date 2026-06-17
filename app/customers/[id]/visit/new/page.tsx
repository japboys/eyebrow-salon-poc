'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Customer, VisitRecord, DesignPlan, TodayObservation, TreatmentRecord, Handover, SkinRiskLevel, Staff, Appointment, EyebrowTreatmentMark } from '@/Other/types'
import SectionCard from '@/Front/components/SectionCard'
import ChipSelector from '@/Front/components/ChipSelector'
import DesignOptionChips from '@/Front/components/DesignOptionChips'
import CautionBadges, { getCautionInfo } from '@/Front/components/CautionBadges'
import BeforeAfterPhotos from '@/Front/components/BeforeAfterPhotos'
import EyebrowMarkAccordion from '@/Front/components/EyebrowMarkAccordion'
import { hasAnySkinCaution, hasSkinRisk, normalizeSkinRiskLevels, toggleSkinRiskLevel } from '@/Other/lib/skin-risk'
import { toDateKey } from '@/Other/lib/date'

const DESIGN_OPTIONS = ['ナチュラル', '平行', 'アーチ', 'ストレート', '優しく', 'きりっと', '自眉いかす', '左右差近づけ', 'モード']
const DESIGN_SUB_OPTIONS: Record<string, string[]> = {
  '平行': ['山カク', '山ナチュラル'],
  'ストレート': ['平行め', '角度つける'],
  'きりっと': ['山カク', '山ナチュラル'],
}
const THICKNESS_OPTIONS = ['細く', '少し細く', '太さキープ']
const DENSITY_OPTIONS = ['少し薄く', '薄く', '状態キープ', 'カット']
const SKIN_CONDITION_TAGS = ['問題なし', '赤み', '乾燥', 'ニキビ', '傷', '皮むけ', '自己処理あり', '日焼け']
const SKIN_CAUTION_TAGS = ['赤みが出やすい', '乾燥あり', 'ワックス範囲注意', '一部施術を避ける', '痛みを感じやすい', '施術前に肌状態を再確認']
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

type VisitPolicy = 'partial_change' | 'major_change'

interface FormState {
  staffId: string
  visitPolicy: VisitPolicy
  changedFields: string[]
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

function getDefaultForm(policy: VisitPolicy, profile: Customer['profile']): FormState {
  return {
    staffId: '',
    visitPolicy: policy,
    changedFields: [],
    desiredDesign: profile?.defaultDesign ? [profile.defaultDesign] : [],
    designSubOptions: {},
    thickness: '太さキープ',
    density: '状態キープ',
    designMemo: '',
    eyebrowMarkMemo: '',
    customerStance: '特になし',
    particularNote: '',
    permaEnabled: false,
    permaMedication: '',
    permaTime: '',
    permaCustomTime: 5,
    todaySkinConditionTags: ['問題なし'],
    todaySkinRiskLevel: ['ok'],
    medicationTags: [],
    medicationOtherNote: '',
    observationNote: '',
    handoverText: '',
    staffEditNote: '',
    staffEditNoteImportant: false,
    skinCautionTags: [],
    eyebrowTreatmentMarks: [],
  }
}

function visitToNewForm(visit: VisitRecord, policy: VisitPolicy): FormState {
  const dp = visit.designPlan as (DesignPlan & {
    desiredDesign?: string | string[]
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
    staffId: visit.staffId ?? '',
    visitPolicy: policy,
    changedFields: visit.changedFields ?? [],
    desiredDesign: normalizeDesiredDesign(dp?.desiredDesign),
    designSubOptions: normalizeDesignSubOptions(dp?.designSubOptions, dp?.designSubOption, dp?.desiredDesign),
    thickness: dp?.thickness ?? '太さキープ',
    density: dp?.density ?? '状態キープ',
    designMemo: dp?.designMemo ?? '',
    eyebrowMarkMemo: tr?.eyebrowMarkMemo ?? '',
    customerStance: dp?.customerStance ?? tr?.customerStance ?? '特になし',
    particularNote: dp?.particularNote ?? tr?.particularNote ?? '',
    permaEnabled: dp?.permaEnabled ?? false,
    permaMedication: dp?.permaMedication ?? '',
    permaTime: dp?.permaTime ?? '',
    permaCustomTime: dp?.permaCustomTime ?? 5,
    todaySkinConditionTags: to?.todaySkinConditionTags ?? [],
    todaySkinRiskLevel: normalizeSkinRiskLevels(to?.todaySkinRiskLevel),
    medicationTags: to?.medicationTags ?? [],
    medicationOtherNote: to?.medicationOtherNote ?? '',
    observationNote: to?.observationNote ?? '',
    handoverText: h?.handoverText ?? '',
    staffEditNote: h?.staffEditNote ?? '',
    staffEditNoteImportant: h?.staffEditNoteImportant ?? false,
    skinCautionTags: h?.skinCautionTags ?? [],
    eyebrowTreatmentMarks: tr?.eyebrowTreatmentMarks ?? [],
  }
}

function applyExclusiveOption(next: string[], previous: string[], exclusiveValue: string) {
  const hasExclusive = next.includes(exclusiveValue)
  const hadExclusive = previous.includes(exclusiveValue)
  if (hasExclusive && !hadExclusive) return [exclusiveValue]
  if (hasExclusive && next.length > 1) return next.filter((value) => value !== exclusiveValue)
  return next
}

function getTodayLabel() {
  const now = new Date()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日（${weekdays[now.getDay()]}）`
}

export default function NewVisitPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id as string
  const policyParam = (searchParams?.get('policy') ?? 'major_change') as VisitPolicy
  const draftParam = searchParams?.get('draft') ?? null

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedTreatmentId, setSavedTreatmentId] = useState<string | null>(null)
  const [draftSaving, setDraftSaving] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [visitNumber, setVisitNumber] = useState<number>(1)

  useEffect(() => {
    fetch('/api/staff')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Staff[]) => setStaffList(data))
      .catch(() => setStaffList([]))
  }, [])

  useEffect(() => {
    if (!id) return
    const todayKey = toDateKey(new Date())
    Promise.all([
      fetch(`/api/customers/${id}`).then((res) => {
        if (!res.ok) throw new Error('顧客データの取得に失敗しました')
        return res.json() as Promise<Customer>
      }),
      fetch(`/api/appointments?date=${todayKey}`)
        .then((res) => (res.ok ? (res.json() as Promise<Appointment[]>) : []))
        .catch(() => [] as Appointment[]),
    ])
      .then(([data, appointments]) => {
        setCustomer(data)
        const draftVisit = draftParam
          ? data.visitRecords?.find((v) => v.treatmentId === draftParam) ?? null
          : null
        const prevRecord = (data.visitRecords ?? []).find((v) => v.treatmentId !== draftVisit?.treatmentId) ?? null
        const initialForm = draftVisit
          ? visitToNewForm(draftVisit, policyParam)
          : getDefaultForm(policyParam, data.profile)
        if (!initialForm.staffId) {
          const matchedAppointment = appointments.find((a) => a.customerId === id && a.staffId)
          if (matchedAppointment?.staffId) initialForm.staffId = matchedAppointment.staffId
        }
        // 前回のお客様状態を引き継ぐ
        if (!draftVisit && prevRecord) {
          const prevTo = prevRecord.todayObservation as TodayObservation | null
          if (prevTo?.todaySkinConditionTags?.length) {
            initialForm.todaySkinConditionTags = prevTo.todaySkinConditionTags
          }
          if (prevTo?.todaySkinRiskLevel) {
            initialForm.todaySkinRiskLevel = normalizeSkinRiskLevels(prevTo.todaySkinRiskLevel)
          }
        }
        setForm(initialForm)
        if (draftVisit) {
          setDraftId(draftVisit.treatmentId)
          setVisitNumber(draftVisit.visitNumber)
        } else {
          setVisitNumber(data.visitCount + 1)
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id, policyParam, draftParam])

  const updateForm = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
  }, [])

  const buildBody = () => {
    if (!form || !customer) return null
    return {
      customerId: id,
      staffId: form.staffId || null,
      visitDate: new Date().toISOString(),
      visitType: customer.visitCount === 0 ? 'first_visit' : 'repeat_visit',
      visitPolicy: form.visitPolicy,
      changedFields: form.changedFields,
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
      originalObservationMemo: form.observationNote,
    }
  }

  const handleDraftSave = async () => {
    if (!form || !customer) return
    setDraftSaving(true)
    setError(null)
    try {
      const body = buildBody()
      if (!body) return

      if (draftId) {
        const res = await fetch(`/api/visits/${draftId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, visitPolicy: 'draft' }),
        })
        if (!res.ok) throw new Error('一時保存に失敗しました')
      } else {
        const res = await fetch('/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, visitPolicy: 'draft' }),
        })
        if (!res.ok) throw new Error('一時保存に失敗しました')
        const visit = await res.json()
        setDraftId(visit.treatmentId)
      }
      setDraftSavedAt(new Date())
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '一時保存に失敗しました')
    } finally {
      setDraftSaving(false)
    }
  }

  const handleSave = async () => {
    if (!form || !customer) return
    setSaving(true)
    setError(null)
    try {
      const body = buildBody()
      if (!body) return

      let treatmentId: string
      if (draftId) {
        const res = await fetch(`/api/visits/${draftId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('保存に失敗しました')
        treatmentId = draftId
      } else {
        const res = await fetch('/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('保存に失敗しました')
        const visit = await res.json()
        treatmentId = visit.treatmentId
      }
      setSavedTreatmentId(treatmentId!)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

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

  if (!customer || !form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border">
          <p className="text-warning">{error || '顧客が見つかりません'}</p>
          <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm">一覧に戻る</button>
        </div>
      </div>
    )
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border max-w-sm w-full">
          <div className="w-16 h-16 bg-success bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-success">✓</span>
          </div>
          <h2 className="text-xl font-bold text-success mb-2">保存完了</h2>
          <p className="text-textLight text-sm mb-6">{customer.name} 様のカルテを保存しました</p>
          <div className="flex flex-col gap-3">
            {savedTreatmentId && (
              <button
                onClick={() => router.push(`/customers/${id}/visit/${savedTreatmentId}`)}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primaryLight transition-colors shadow-sm"
              >
                カルテを確認する →
              </button>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/customers/${id}`)}
                className="flex-1 py-3 bg-cardAlt text-primary rounded-xl font-medium text-sm hover:bg-accentLight transition-colors"
              >
                顧客詳細に戻る
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 py-3 bg-cardAlt text-textLight rounded-xl font-medium text-sm hover:bg-accentLight transition-colors"
              >
                TOPに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const allVisits: VisitRecord[] = customer.visitRecords ?? []
  const prevVisit = allVisits.find((v) => v.treatmentId !== draftId)
  const eyebrowMarkTreatmentId = draftId ?? `${id}-${String(visitNumber).padStart(3, '0')}`
  const cautions = getCautionInfo(customer, prevVisit ?? null)

  const hasSkinCaution = hasAnySkinCaution(form.todaySkinRiskLevel) || form.todaySkinConditionTags.some(t => t !== '問題なし')

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* ── Header ── */}
      <header className="bg-card sticky top-0 z-10" style={{ boxShadow: '0 1px 0 #E8E0D7, 0 2px 12px rgba(90,62,43,0.05)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-textLight flex-shrink-0"
            style={{ background: '#F8F3EE' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-semibold text-primary truncate">{customer.name}</h1>
              <span className="text-sm text-muted flex-shrink-0">（{customer.visitCount + 1}回目）</span>
            </div>
            <p className="text-xs text-muted">来店記録入力</p>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-25" />
      </header>

      {/* 要注意顧客の表示 */}
      {cautions.length > 0 && (
        <div className="px-4 py-2.5" style={{ background: '#F8F3EE', borderBottom: '1px solid #E8E0D7' }}>
          <div className="max-w-3xl mx-auto">
            <CautionBadges customer={customer} latestVisit={prevVisit ?? null} />
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Today's date */}
        <div className="bg-card rounded-2xl border border-border px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-textLight flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold text-text">{getTodayLabel()}</span>
          </div>
          {(() => {
            const assignedStaffName = staffList.find((s) => s.id === form.staffId)?.name
            return assignedStaffName ? (
              <span className="text-xs font-medium px-3 py-1 rounded-full flex-shrink-0" style={{ background: 'rgba(90,62,43,0.08)', color: '#5A3E2B' }}>
                担当: {assignedStaffName}
              </span>
            ) : null
          })()}
        </div>

        {error && (
          <div className="bg-orange-50 border border-warning border-opacity-30 rounded-xl p-3 text-warning text-sm">
            {error}
          </div>
        )}

        {/* 今回の仕上がり比較 */}
        <SectionCard title="今回の仕上がり比較" collapsible defaultOpen>
          <BeforeAfterPhotos title={undefined} />
        </SectionCard>

        {/* 施術マーク記録 */}
        <EyebrowMarkAccordion
          marks={form.eyebrowTreatmentMarks}
          onChange={(marks) => updateForm('eyebrowTreatmentMarks', marks)}
          markMemo={form.eyebrowMarkMemo}
          onMarkMemoChange={(memo) => updateForm('eyebrowMarkMemo', memo)}
          customerId={id}
          treatmentId={eyebrowMarkTreatmentId}
          visitNumber={visitNumber}
        />

        {/* Section 1: デザイン調整 */}
        <SectionCard title="デザイン調整" collapsible defaultOpen>
          <div className="space-y-6">
            {/* デザイン */}
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

            {/* 太さ */}
            <div>
              <p className="text-sm font-medium text-text mb-2">太さ</p>
              <ChipSelector
                options={THICKNESS_OPTIONS}
                selected={form.thickness ? [form.thickness] : []}
                onChange={(v) => updateForm('thickness', v[0] ?? '')}
                multiSelect={false}
              />
            </div>

            {/* 濃さ */}
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
                  placeholder="例：太さは残す、眉山は強調しない、左右差を目立たせない"
                  value={form.particularNote}
                  onChange={(e) => updateForm('particularNote', e.target.value)}
                  className="w-full p-2 rounded-lg border border-rose border-opacity-30 bg-white text-sm text-text placeholder-muted focus:outline-none resize-none"
                  rows={2}
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

            {/* 施術メモ */}
            <div>
              <p className="text-sm font-medium text-text mb-2">施術メモ</p>
              <textarea
                placeholder="デザインに関するメモ（任意）"
                value={form.designMemo}
                onChange={(e) => updateForm('designMemo', e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
                rows={2}
              />
            </div>
          </div>
        </SectionCard>

        {/* Section 2: お客様状態 */}
        <SectionCard title="お客様状態" collapsible defaultOpen>
          <div className="space-y-5">
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

            {hasAnySkinCaution(form.todaySkinRiskLevel) ? (
              <div className="bg-orange-50 rounded-xl p-3 border border-warning border-opacity-30">
                <p className="text-xs text-warning font-semibold mb-2">⚠ 肌リスクに注意が必要なため対応方針を記録してください</p>
                <textarea
                  placeholder="対応方針（例：ワックスを使わずハサミとコームのみで施術）"
                  value={form.observationNote}
                  onChange={(e) => updateForm('observationNote', e.target.value)}
                  className="w-full p-2 rounded-lg border border-warning border-opacity-30 bg-white text-sm text-text placeholder-muted focus:outline-none resize-none"
                  rows={3}
                />
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-text mb-2">観察メモ</p>
                <textarea
                  placeholder="当日の観察事項（任意）"
                  value={form.observationNote}
                  onChange={(e) => updateForm('observationNote', e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
                  rows={2}
                />
              </div>
            )}
          </div>
        </SectionCard>

        {/* Conditional: Skin caution */}
        {hasSkinCaution && (
          <SectionCard title="次回スタッフへの肌注意は？" collapsible defaultOpen badge="肌状態注意" badgeColor="bg-orange-50 text-warning">
            <ChipSelector
              options={SKIN_CAUTION_TAGS}
              selected={form.skinCautionTags}
              onChange={(v) => updateForm('skinCautionTags', v)}
            />
          </SectionCard>
        )}

        {/* Section 5: 会話・次回共有メモ */}
        <SectionCard title="会話・次回共有メモ" collapsible defaultOpen>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-text mb-1">お客様との会話・次回共有メモ</p>
              <p className="text-xs text-muted mb-2">
                次回担当が接客中に見てもよい内容。会話内容、好み、次回話題、ご要望など。
              </p>
              <textarea
                placeholder="例：次回は自然め希望。旅行の話題あり。"
                value={form.handoverText}
                onChange={(e) => updateForm('handoverText', e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-card text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
                rows={4}
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
                placeholder="例：領収書発行あり。"
                value={form.staffEditNote}
                onChange={(e) => updateForm('staffEditNote', e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm text-text placeholder-muted focus:outline-none resize-none ${
                  form.staffEditNoteImportant
                    ? 'border-warning border-opacity-50 bg-orange-50'
                    : 'border-border bg-cardAlt focus:border-primary'
                }`}
                rows={2}
              />
            </div>
          </div>
        </SectionCard>
      </main>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 shadow-lg">
        <div className="max-w-3xl mx-auto space-y-2">
          {draftSavedAt && (
            <p className="text-xs text-textLight text-center">
              一時保存済み（{draftSavedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}）
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/')}
              className="flex-shrink-0 py-3 px-4 rounded-xl border-2 border-border text-textLight font-medium text-sm hover:bg-cardAlt transition-colors"
            >
              戻る
            </button>
            <button
              onClick={handleDraftSave}
              disabled={draftSaving || saving}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-primary text-primary font-medium text-sm hover:bg-accentLight transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {draftSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  一時保存
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || draftSaving}
              className="flex-1 py-3 px-4 bg-success text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <span>✓</span>
                  カルテ完成・保存
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
