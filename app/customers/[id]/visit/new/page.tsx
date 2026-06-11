'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Customer, VisitRecord, DesignPlan, TodayObservation, TreatmentRecord, Handover, SkinRiskLevel, Staff } from '@/Other/types'
import SectionCard from '@/Front/components/SectionCard'
import ChipSelector from '@/Front/components/ChipSelector'
import LevelSelector, { thicknessLabels, densityLabels } from '@/Front/components/LevelSelector'
import CautionBadges, { getCautionInfo } from '@/Front/components/CautionBadges'
import BeforeAfterPhotos from '@/Front/components/BeforeAfterPhotos'
import { hasAnySkinCaution, hasSkinRisk, normalizeSkinRiskLevels, toggleSkinRiskLevel } from '@/Other/lib/skin-risk'

const DESIGN_OPTIONS = ['平行', '平行アーチ', 'アーチ', 'ストレート', 'ナチュラル', '韓国風', 'お任せ']
const BROW_CONDITION_TAGS = ['通常', '伸びている', 'まばら', '不揃い', '左右差目立つ']
const SELF_CARE_AREA_TAGS = ['なし', 'あり', '右眉下', '左眉下', '眉頭', '眉山', '眉尻', '全体']
const SKIN_CONDITION_TAGS = ['問題なし', '赤み', '乾燥', 'ニキビ', '傷', '皮むけ', '施術注意']
const TREATMENT_TAGS = ['ワックス', '間引き', 'カット', '毛抜き', '眉山調整', '眉尻調整', 'メイク仕上げ']
const EYEBROW_DETAIL_TAGS = ['眉頭調整', '眉山調整', '眉尻調整', '眉下ライン', '眉上ライン', '長さカット']
const CHANGE_REASON_TAGS = ['顧客希望', 'スタッフ判断', '似合わせ調整', 'その他']
const SKIN_CAUTION_TAGS = ['赤みが出やすい', '乾燥あり', 'ワックス範囲注意', '一部施術を避ける', '痛みを感じやすい', '施術前に肌状態を再確認']
const ASYMMETRY_CAUTION_TAGS = ['右眉が高く見えやすい', '左眉が高く見えやすい', '右眉尻が薄い', '左眉尻が薄い', '眉頭の高さ注意', '眉山位置注意', 'メイク補正前提', '次回まで伸ばす']
const SKIN_RISK_OPTIONS: { value: SkinRiskLevel; label: string }[] = [
  { value: 'ok', label: '問題なし' },
  { value: 'caution', label: '注意' },
  { value: 'medication', label: '薬服用' },
]
const MEDICATION_TAGS = ['アトピー', 'ニキビ用']
const MEDICATION_OTHER = 'その他'
const CUSTOMER_STANCE_OPTIONS = ['こだわり強い', 'お任せ', '特になし']

type VisitPolicy = 'partial_change' | 'major_change'

interface FormState {
  staffId: string
  visitPolicy: VisitPolicy
  changedFields: string[]
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
  skinCautionTags: string[]
  asymmetryCautionTags: string[]
}

function getDefaultForm(policy: VisitPolicy, profile: Customer['profile']): FormState {
  return {
    staffId: '',
    visitPolicy: policy,
    changedFields: [],
    desiredDesign: profile?.defaultDesign ?? '',
    thicknessLevel: Math.max(-3, Math.min(3, profile?.preferredThickness ?? 0)),
    densityLevel: Math.max(-3, Math.min(3, profile?.preferredDensity ?? 0)),
    changeReason: [],
    majorChangeReason: [],
    customerRequestNote: '',
    browConditionTags: [],
    selfCareImpactExists: false,
    selfCareImpactArea: [],
    selfCareImpactLevel: 0,
    todaySkinConditionTags: [],
    todaySkinRiskLevel: ['ok'],
    medicationTags: [],
    medicationOtherNote: '',
    observationNote: '',
    treatmentTags: [],
    rightBrowTreatmentTags: [],
    leftBrowTreatmentTags: [],
    customerStance: '',
    particularNote: '',
    treatmentNote: '',
    handoverText: '',
    staffEditNote: '',
    skinCautionTags: [],
    asymmetryCautionTags: [],
  }
}

function visitToNewForm(visit: VisitRecord, policy: VisitPolicy): FormState {
  const dp = visit.designPlan as DesignPlan | null
  const to = visit.todayObservation as TodayObservation | null
  const tr = visit.treatmentRecord as TreatmentRecord | null
  const h = visit.handover as Handover | null
  return {
    staffId: visit.staffId ?? '',
    visitPolicy: policy,
    changedFields: visit.changedFields ?? [],
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
    observationNote: to?.observationNote ?? '',
    treatmentTags: tr?.treatmentTags ?? [],
    rightBrowTreatmentTags: tr?.rightBrowTreatmentTags ?? [],
    leftBrowTreatmentTags: tr?.leftBrowTreatmentTags ?? [],
    customerStance: tr?.customerStance ?? '',
    particularNote: tr?.particularNote ?? '',
    treatmentNote: tr?.treatmentNote ?? '',
    handoverText: h?.handoverText ?? '',
    staffEditNote: h?.staffEditNote ?? '',
    skinCautionTags: h?.skinCautionTags ?? [],
    asymmetryCautionTags: h?.asymmetryCautionTags ?? [],
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
  const [prevDesiredDesign, setPrevDesiredDesign] = useState<string | null>(null)
  const [staffList, setStaffList] = useState<Staff[]>([])

  useEffect(() => {
    fetch('/api/staff')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Staff[]) => setStaffList(data))
      .catch(() => setStaffList([]))
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/customers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('顧客データの取得に失敗しました')
        return res.json()
      })
      .then((data: Customer) => {
        setCustomer(data)
        const draftVisit = draftParam
          ? data.visitRecords?.find((v) => v.treatmentId === draftParam) ?? null
          : null
        if (draftVisit) {
          setForm(visitToNewForm(draftVisit, policyParam))
          setDraftId(draftVisit.treatmentId)
        } else {
          setForm(getDefaultForm(policyParam, data.profile))
        }
        const prevRecord = (data.visitRecords ?? []).find((v) => v.treatmentId !== draftVisit?.treatmentId)
        const prevDesign = (prevRecord?.designPlan as DesignPlan | null)?.desiredDesign ?? null
        setPrevDesiredDesign(prevDesign)
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
        // 既存のdraftを更新
        const res = await fetch(`/api/visits/${draftId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, visitPolicy: 'draft' }),
        })
        if (!res.ok) throw new Error('一時保存に失敗しました')
      } else {
        // 新規でdraft作成
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
      // 一時保存後は顧客一覧に戻る
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
    try {
      const body = buildBody()
      if (!body) return

      // draftから本保存する場合はPUT、初回保存はPOST
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

  const profile = customer.profile
  const allVisits: VisitRecord[] = customer.visitRecords ?? []
  const prevVisit = allVisits.find((v) => v.treatmentId !== draftId)
  const prevDesignPlan = prevVisit?.designPlan as DesignPlan | null
  const cautions = getCautionInfo(customer, prevVisit ?? null)

  const previousThickness = prevDesignPlan?.thicknessLevel ?? Math.max(-3, Math.min(3, profile?.preferredThickness ?? 0))
  const previousDensity = prevDesignPlan?.densityLevel ?? Math.max(-3, Math.min(3, profile?.preferredDensity ?? 0))
  const thicknessDiff = Math.abs(form.thicknessLevel - previousThickness)
  const densityDiff = Math.abs(form.densityLevel - previousDensity)

  const hasSkinCaution = hasAnySkinCaution(form.todaySkinRiskLevel) || form.todaySkinConditionTags.some(t => t !== '問題なし')
  const hasAsymmetry = form.browConditionTags.includes('左右差目立つ')

  const designChanged = prevDesiredDesign !== null && form.desiredDesign !== '' && form.desiredDesign !== prevDesiredDesign
  const hasLargeDesignChange = designChanged || thicknessDiff >= 2 || densityDiff >= 2

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

      {/* 要注意顧客の表示（ヘッダー直下に固定表示） */}
      {cautions.length > 0 && (
        <div className="px-4 py-2.5" style={{ background: '#F8F3EE', borderBottom: '1px solid #E8E0D7' }}>
          <div className="max-w-3xl mx-auto">
            <CautionBadges customer={customer} latestVisit={prevVisit ?? null} />
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Today's date */}
        <div className="bg-card rounded-2xl border border-border px-5 py-3 flex items-center gap-3">
          <svg className="w-4 h-4 text-textLight flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-semibold text-text">{getTodayLabel()}</span>
        </div>

        {/* 担当スタッフ */}
        <SectionCard title="担当スタッフ">
          <ChipSelector
            options={staffList.map((s) => s.name)}
            selected={(() => {
              const current = staffList.find((s) => s.id === form.staffId)
              return current ? [current.name] : []
            })()}
            onChange={(v) => {
              const selectedName = v[0] ?? ''
              const matched = staffList.find((s) => s.name === selectedName)
              updateForm('staffId', matched?.id ?? '')
            }}
            multiSelect={false}
          />
        </SectionCard>

        {error && (
          <div className="bg-orange-50 border border-warning border-opacity-30 rounded-xl p-3 text-warning text-sm">
            {error}
          </div>
        )}

        {/* 前回のBefore/After比較 */}
        {prevVisit && (
          <SectionCard title="前回の仕上がり比較" collapsible defaultOpen>
            <BeforeAfterPhotos title={undefined} />
          </SectionCard>
        )}

        {/* Section 1: Design adjustment */}
        <SectionCard title="デザイン調整" collapsible defaultOpen>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <p className="text-sm font-medium text-text">希望デザイン</p>
                {prevDesiredDesign && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-prev text-prevText border border-dashed border-prevText">
                    前回: {prevDesiredDesign}
                  </span>
                )}
              </div>
              <ChipSelector
                options={DESIGN_OPTIONS}
                selected={form.desiredDesign ? [form.desiredDesign] : []}
                onChange={(v) => updateForm('desiredDesign', v[0] ?? '')}
                multiSelect={false}
                previousValues={prevDesiredDesign ? [prevDesiredDesign] : undefined}
              />
              {/* 前回/今回の差分表示 */}
              {designChanged && (
                <div className="mt-2 flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-warning bg-opacity-10 border border-warning border-opacity-30">
                  <span className="text-warning font-semibold">変更あり</span>
                  <span className="text-textLight">前回：{prevDesiredDesign} / 今回：{form.desiredDesign}</span>
                </div>
              )}
            </div>

            <LevelSelector
              title="太さ"
              value={form.thicknessLevel}
              previousValue={prevDesignPlan?.thicknessLevel ?? (profile ? Math.max(-3, Math.min(3, profile.preferredThickness)) : undefined)}
              onChange={(v) => updateForm('thicknessLevel', v)}
              labels={thicknessLabels}
              minLevel={-3}
              maxLevel={3}
            />

            <LevelSelector
              title="濃さ"
              value={form.densityLevel}
              previousValue={prevDesignPlan?.densityLevel ?? Math.max(-3, Math.min(3, profile?.preferredDensity ?? 0))}
              onChange={(v) => updateForm('densityLevel', v)}
              labels={densityLabels}
              minLevel={-3}
              maxLevel={3}
            />
          </div>
        </SectionCard>

        {/* Deep-drill: large design change */}
        {hasLargeDesignChange && (
          <SectionCard title="大きな変更理由" collapsible defaultOpen badge="前回差分あり" badgeColor="bg-roseLight text-rose">
            <ChipSelector
              options={CHANGE_REASON_TAGS}
              selected={form.changeReason}
              onChange={(v) => updateForm('changeReason', v)}
            />
            <textarea
              placeholder="理由メモ（任意）"
              value={form.customerRequestNote}
              onChange={(e) => updateForm('customerRequestNote', e.target.value)}
              className="w-full mt-3 p-3 rounded-xl border border-border bg-cardAlt text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
              rows={2}
            />
          </SectionCard>
        )}

        {/* Section 2: お客様眉状態 */}
        <SectionCard title="お客様眉状態" collapsible defaultOpen>
          <div className="space-y-5">
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

            {form.selfCareImpactExists && form.selfCareImpactArea.filter(a => a !== 'なし').length > 0 && (
              <div>
                <p className="text-sm font-medium text-text mb-2">自己処理の影響レベル</p>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateForm('selfCareImpactLevel', level)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        form.selfCareImpactLevel === level
                          ? 'bg-rose text-white border-rose'
                          : 'bg-card text-textLight border-border hover:border-rose'
                      }`}
                    >
                      {level === 0 ? '影響なし' : level === 1 ? '軽微' : level === 2 ? '中程度' : '大きい'}
                    </button>
                  ))}
                </div>
                {form.selfCareImpactLevel >= 2 && (
                  <div className="mt-3 bg-roseLight rounded-xl p-3">
                    <p className="text-xs text-rose font-medium">⚠ 仕上がりへの影響を記録してください</p>
                    <textarea
                      placeholder="自己処理による仕上がりへの影響"
                      value={form.observationNote}
                      onChange={(e) => updateForm('observationNote', e.target.value)}
                      className="w-full mt-2 p-2 rounded-lg border border-rose border-opacity-30 bg-white text-sm text-text placeholder-muted focus:outline-none resize-none"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            )}

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

            {hasAnySkinCaution(form.todaySkinRiskLevel) && (
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
            )}

            {!hasAnySkinCaution(form.todaySkinRiskLevel) && form.selfCareImpactLevel < 2 && (
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

        {/* Section 3: Treatment */}
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
                  placeholder="例：太さは残す、眉山は強調しない、左右差を目立たせない"
                  value={form.particularNote}
                  onChange={(e) => updateForm('particularNote', e.target.value)}
                  className="w-full p-2 rounded-lg border border-rose border-opacity-30 bg-white text-sm text-text placeholder-muted focus:outline-none resize-none"
                  rows={2}
                />
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-text mb-2">施術メモ</p>
              <textarea
                placeholder="施術の詳細・注意点など（任意）"
                value={form.treatmentNote}
                onChange={(e) => updateForm('treatmentNote', e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
                rows={3}
              />
            </div>
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

        {/* Conditional: Asymmetry caution */}
        {hasAsymmetry && (
          <SectionCard title="左右差について次回注意することは？" collapsible defaultOpen badge="左右差目立つ" badgeColor="bg-roseLight text-rose">
            <ChipSelector
              options={ASYMMETRY_CAUTION_TAGS}
              selected={form.asymmetryCautionTags}
              onChange={(v) => updateForm('asymmetryCautionTags', v)}
            />
          </SectionCard>
        )}

        {/* Section 5: Handover */}
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
              <p className="text-sm font-medium text-text mb-1">スタッフ内部メモ</p>
              <p className="text-xs text-muted mb-2">
                領収書など特殊対応がある時だけ。基本は空欄でOK。
              </p>
              <textarea
                placeholder="例：領収書発行あり。"
                value={form.staffEditNote}
                onChange={(e) => updateForm('staffEditNote', e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
                rows={2}
              />
            </div>
          </div>
        </SectionCard>
      </main>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 shadow-lg">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* 一時保存インジケーター */}
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
