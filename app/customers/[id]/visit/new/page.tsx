'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Customer, TodayObservation, VisitRecord, DesignPlan } from '@/Other/types'
import SectionCard from '@/Front/components/SectionCard'
import ChipSelector from '@/Front/components/ChipSelector'
import LevelSelector, { thicknessLabels, angleLabels, densityLabels } from '@/Front/components/LevelSelector'
import AIPlaceholder from '@/Front/components/AIPlaceholder'

const DESIGN_OPTIONS = ['平行', '平行アーチ', 'アーチ', 'ストレート', 'ナチュラル', '韓国風', 'お任せ']
const BROW_CONDITION_TAGS = ['通常', '伸びている', 'まばら', '不揃い', '左右差目立つ']
const SELF_CARE_AREA_TAGS = ['なし', 'あり', '右眉下', '左眉下', '眉頭', '眉山', '眉尻', '全体']
const SKIN_CONDITION_TAGS = ['問題なし', '赤み', '乾燥', 'ニキビ', '傷', '皮むけ', '施術注意']
const TREATMENT_TAGS = ['ワックス', '間引き', 'カット', '毛抜き', '眉山調整', '眉尻調整', 'メイク仕上げ']
const EYEBROW_DETAIL_TAGS = ['眉頭調整', '眉山調整', '眉尻調整', '眉下ライン', '眉上ライン', '長さカット']
const REACTION_TAGS = ['満足', 'とても満足', 'ナチュラル仕上げ良い', '自然な仕上がり', '韓国風が気に入っている', '初めてで満足']
const CONCERN_TAGS = ['少し薄かったかも', '右眉尻が少し薄い', '左右差が気になる', '少し太かった', '濃さが気になる']
const CHANGE_REASON_TAGS = ['顧客希望', 'スタッフ判断', '季節の変化', 'トレンド', 'ライフスタイル変化']
const MAJOR_CHANGE_REASON_TAGS = ['初回', '雰囲気を変えたい', 'デザインをリセット', '大きなイメージチェンジ']

// Conditional deep-drill options
const SKIN_CAUTION_TAGS = ['赤みが出やすい', '乾燥あり', 'ワックス範囲注意', '一部施術を避ける', '痛みを感じやすい', '施術前に肌状態を再確認']
const NEXT_IMPROVEMENT_TAGS = ['細さを調整', '太さを残す', '濃さを調整', '左右差を調整', '角度を弱める', '眉山を出しすぎない', '赤み・痛みに配慮', 'カウンセリングで再確認']
const ASYMMETRY_CAUTION_TAGS = ['右眉が高く見えやすい', '左眉が高く見えやすい', '右眉尻が薄い', '左眉尻が薄い', '眉頭の高さ注意', '眉山位置注意', 'メイク補正前提', '次回まで伸ばす']

type VisitPolicy = 'partial_change' | 'major_change'

interface FormState {
  visitPolicy: VisitPolicy
  changedFields: string[]
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

function getDefaultForm(policy: VisitPolicy, profile: Customer['profile']): FormState {
  return {
    visitPolicy: policy,
    changedFields: [],
    desiredDesign: profile?.defaultDesign ?? '',
    thicknessLevel: profile?.preferredThickness ?? 0,
    angleLevel: profile?.preferredAngle ?? 0,
    densityLevel: Math.max(-3, Math.min(3, profile?.preferredDensity ?? 0)),
    changeReason: [],
    majorChangeReason: [],
    customerRequestNote: '',
    browConditionTags: [],
    selfCareImpactExists: false,
    selfCareImpactArea: [],
    selfCareImpactLevel: 0,
    todaySkinConditionTags: [],
    todaySkinRiskLevel: 0,
    observationNote: '',
    treatmentTags: [],
    rightBrowTreatmentTags: [],
    leftBrowTreatmentTags: [],
    treatmentNote: '',
    satisfactionLevel: 5,
    reactionTags: [],
    concernTags: [],
    nextTimeCustomerRequest: '',
    handoverText: '',
    staffEditNote: '',
    skinCautionTags: [],
    nextImprovementTags: [],
    asymmetryCautionTags: [],
  }
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

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedVisitId, setSavedVisitId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [prevDesiredDesign, setPrevDesiredDesign] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/customers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('顧客データの取得に失敗しました')
        return res.json()
      })
      .then((data: Customer) => {
        setCustomer(data)
        setForm(getDefaultForm(policyParam, data.profile))
        const prevDesign = (data.visitRecords?.[0]?.designPlan as DesignPlan | null)?.desiredDesign ?? null
        setPrevDesiredDesign(prevDesign)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id, policyParam])

  const updateForm = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
  }, [])

  const handleSave = async () => {
    if (!form || !customer) return
    setSaving(true)
    try {
      const body = {
        customerId: id,
        visitDate: new Date().toISOString(),
        visitType: customer.visitCount <= 1 ? 'first_visit' : 'repeat_visit',
        visitPolicy: form.visitPolicy,
        changedFields: form.changedFields,
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

      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('保存に失敗しました')
      const visit = await res.json()
      setSavedVisitId(visit.id)
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
            {savedVisitId && (
              <button
                onClick={() => router.push(`/customers/${id}/visit/${savedVisitId}`)}
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

  // First visit data for reference in お客様眉状態
  const allVisits: VisitRecord[] = customer.visitRecords ?? []
  const firstVisit = allVisits.length > 0 ? allVisits[allVisits.length - 1] : null
  const firstObservation = firstVisit?.todayObservation as TodayObservation | null

  const thicknessDiff = Math.abs(form.thicknessLevel - (profile?.preferredThickness ?? 0))
  const angleDiff = Math.abs(form.angleLevel - (profile?.preferredAngle ?? 0))
  const densityDiff = Math.abs(form.densityLevel - Math.max(-3, Math.min(3, profile?.preferredDensity ?? 0)))

  // Conditions for conditional deep-drill sections
  const hasSkinCaution = form.todaySkinRiskLevel >= 1 || form.todaySkinConditionTags.some(t => t !== '問題なし')
  const hasLowSatisfaction = form.satisfactionLevel <= 3 || form.concernTags.length > 0
  const hasAsymmetry = form.browConditionTags.includes('左右差目立つ')

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push(`/customers/${id}`)}
            className="p-2 rounded-xl hover:bg-cardAlt transition-colors text-textLight"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-primary">{customer.name}</h1>
              <span className="text-sm text-textLight">({customer.visitCount}回目)</span>
            </div>
            <p className="text-xs text-textLight">来店記録入力</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Today's date — 2nd element */}
        <div className="bg-card rounded-2xl border border-border px-5 py-3 flex items-center gap-3">
          <svg className="w-4 h-4 text-textLight flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-semibold text-text">{getTodayLabel()}</span>
        </div>
        {error && (
          <div className="bg-orange-50 border border-warning border-opacity-30 rounded-xl p-3 text-warning text-sm">
            {error}
          </div>
        )}

        {/* Section 1: Design adjustment */}
        <SectionCard title="デザイン調整" collapsible defaultOpen>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
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
              />
            </div>

            <LevelSelector
              title="太さ"
              value={form.thicknessLevel}
              previousValue={profile?.preferredThickness}
              onChange={(v) => updateForm('thicknessLevel', v)}
              labels={thicknessLabels}
            />

            <LevelSelector
              title="角度"
              value={form.angleLevel}
              previousValue={profile?.preferredAngle}
              onChange={(v) => updateForm('angleLevel', v)}
              labels={angleLabels}
            />

            <LevelSelector
              title="濃さ"
              value={form.densityLevel}
              previousValue={Math.max(-3, Math.min(3, profile?.preferredDensity ?? 0))}
              onChange={(v) => updateForm('densityLevel', v)}
              labels={densityLabels}
              minLevel={-3}
              maxLevel={3}
            />
          </div>
        </SectionCard>

        {/* Deep-drill: major change reason */}
        {form.visitPolicy === 'major_change' && (
          <SectionCard title="変更理由" collapsible defaultOpen badge="全体変更" badgeColor="bg-roseLight text-rose">
            <ChipSelector
              options={MAJOR_CHANGE_REASON_TAGS}
              selected={form.majorChangeReason}
              onChange={(v) => updateForm('majorChangeReason', v)}
            />
          </SectionCard>
        )}

        {/* Deep-drill: thickness change (2+ levels) */}
        {thicknessDiff >= 2 && (
          <SectionCard title="太さ変更理由" collapsible defaultOpen badge={`${thicknessDiff}段階変化`} badgeColor="bg-roseLight text-rose">
            <ChipSelector
              options={CHANGE_REASON_TAGS}
              selected={form.changeReason}
              onChange={(v) => updateForm('changeReason', v)}
            />
            <textarea
              placeholder="詳細メモ（任意）"
              value={form.customerRequestNote}
              onChange={(e) => updateForm('customerRequestNote', e.target.value)}
              className="w-full mt-3 p-3 rounded-xl border border-border bg-cardAlt text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
              rows={2}
            />
          </SectionCard>
        )}

        {/* Deep-drill: angle change (2+ levels) */}
        {angleDiff >= 2 && (
          <SectionCard title="角度変更理由" collapsible defaultOpen badge={`${angleDiff}段階変化`} badgeColor="bg-roseLight text-rose">
            <ChipSelector
              options={CHANGE_REASON_TAGS}
              selected={form.changeReason}
              onChange={(v) => updateForm('changeReason', v)}
            />
          </SectionCard>
        )}

        {/* Deep-drill: density change (2+ levels) */}
        {densityDiff >= 2 && (
          <SectionCard title="濃さ変更理由" collapsible defaultOpen badge={`${densityDiff}段階変化`} badgeColor="bg-roseLight text-rose">
            <ChipSelector
              options={CHANGE_REASON_TAGS}
              selected={form.changeReason}
              onChange={(v) => updateForm('changeReason', v)}
            />
          </SectionCard>
        )}

        {/* Section 2: お客様眉状態 (formerly 当日観察) */}
        <SectionCard title="お客様眉状態" collapsible defaultOpen>
          <div className="space-y-5">
            {/* First visit reference */}
            {firstObservation && firstVisit?.id !== (customer.visitRecords?.[0]?.id) && (
              <div className="bg-prev rounded-xl p-3 border border-dashed border-prevText">
                <p className="text-xs font-medium text-prevText mb-2">初回記録（参考）</p>
                <div className="space-y-1 text-xs text-textLight">
                  {firstObservation.browConditionTags?.length > 0 && (
                    <p>眉状態: {firstObservation.browConditionTags.join('・')}</p>
                  )}
                  {firstObservation.todaySkinConditionTags?.length > 0 && (
                    <p>肌状態: {firstObservation.todaySkinConditionTags.join('・')}</p>
                  )}
                  {firstObservation.selfCareImpactArea?.filter(a => a !== 'なし').length > 0 && (
                    <p>自己処理: {firstObservation.selfCareImpactArea.filter(a => a !== 'なし').join('・')}</p>
                  )}
                </div>
              </div>
            )}

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
                onChange={(v) => updateForm('todaySkinConditionTags', v)}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-text mb-2">肌リスクレベル</p>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateForm('todaySkinRiskLevel', level)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      form.todaySkinRiskLevel === level
                        ? level >= 2 ? 'bg-warning text-white border-warning' : 'bg-primary text-white border-primary'
                        : 'bg-card text-textLight border-border hover:border-primary'
                    }`}
                  >
                    {level === 0 ? '問題なし' : level === 1 ? '低リスク' : level === 2 ? '注意' : '高リスク'}
                  </button>
                ))}
              </div>
            </div>

            {form.todaySkinRiskLevel >= 2 && (
              <div className="bg-orange-50 rounded-xl p-3 border border-warning border-opacity-30">
                <p className="text-xs text-warning font-semibold mb-2">⚠ 肌リスクが高いため対応方針を記録してください</p>
                <textarea
                  placeholder="対応方針（例：ワックスを使わずハサミとコームのみで施術）"
                  value={form.observationNote}
                  onChange={(e) => updateForm('observationNote', e.target.value)}
                  className="w-full p-2 rounded-lg border border-warning border-opacity-30 bg-white text-sm text-text placeholder-muted focus:outline-none resize-none"
                  rows={3}
                />
              </div>
            )}

            {form.todaySkinRiskLevel < 2 && (
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

        {/* Section 4: Reaction */}
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
                      className={`text-3xl transition-all duration-100 ${star <= form.satisfactionLevel ? 'text-accent scale-110' : 'text-border'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-lg font-bold text-primary">{form.satisfactionLevel}/5</span>
              </div>
            </div>

            {form.satisfactionLevel <= 2 && (
              <div className="bg-orange-50 rounded-xl p-3 border border-warning border-opacity-30">
                <p className="text-xs text-warning font-semibold mb-2">⚠ 満足度が低い場合、気にされていた点を記録してください</p>
                <ChipSelector
                  options={['仕上がりが気に入らない', '太さが違う', '角度が違う', '濃さが違う', '左右差が気になる', '痛みがあった']}
                  selected={form.concernTags}
                  onChange={(v) => updateForm('concernTags', v)}
                />
              </div>
            )}

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
                placeholder="お客様から次回について何か要望があれば記録してください"
                value={form.nextTimeCustomerRequest}
                onChange={(e) => updateForm('nextTimeCustomerRequest', e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
                rows={2}
              />
            </div>
          </div>
        </SectionCard>

        {/* Conditional: Skin caution for next staff */}
        {hasSkinCaution && (
          <SectionCard title="次回スタッフへの肌注意は？" collapsible defaultOpen badge="肌状態注意" badgeColor="bg-orange-50 text-warning">
            <ChipSelector
              options={SKIN_CAUTION_TAGS}
              selected={form.skinCautionTags}
              onChange={(v) => updateForm('skinCautionTags', v)}
            />
          </SectionCard>
        )}

        {/* Conditional: Next improvement points */}
        {hasLowSatisfaction && (
          <SectionCard title="次回改善するべき点は？" collapsible defaultOpen badge="満足度・懸念あり" badgeColor="bg-roseLight text-rose">
            <ChipSelector
              options={NEXT_IMPROVEMENT_TAGS}
              selected={form.nextImprovementTags}
              onChange={(v) => updateForm('nextImprovementTags', v)}
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

        {/* Section 5: AI Placeholder */}
        <SectionCard title="AI申し送り生成（実装予定）" collapsible defaultOpen>
          <AIPlaceholder />
        </SectionCard>

        {/* Section 6: Handover */}
        <SectionCard title="次回申し送り" collapsible defaultOpen>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-text mb-2">申し送りテキスト</p>
              <textarea
                placeholder="次のスタッフへの申し送り内容を入力してください"
                value={form.handoverText}
                onChange={(e) => updateForm('handoverText', e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-card text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
                rows={4}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-text mb-2">スタッフメモ（内部用）</p>
              <textarea
                placeholder="スタッフ内部用のメモ"
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
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={() => router.push(`/customers/${id}`)}
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
                本日のカルテ記録
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
