'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Customer, CustomerProfile } from '@/Other/types'
import SectionCard from '@/Front/components/SectionCard'
import ChipSelector from '@/Front/components/ChipSelector'
import LevelSelector, { thicknessLabels, densityLabels } from '@/Front/components/LevelSelector'

const DESIGN_OPTIONS = ['平行', '平行アーチ', 'アーチ', 'ストレート', 'ナチュラル', '韓国風', 'お任せ']
const ASYMMETRY_OPTIONS = ['ほぼなし', '右眉がやや高い', '左眉がやや高い', '右眉が長い', '左眉が長い', '右眉が太い', '左眉が太い', '右眉尻が薄い', '左眉尻が薄い']
const HAIR_FLOW_OPTIONS = ['左眉尻薄め', '右眉尻薄め', '眉頭毛流れ強め', '眉下薄め', '中央欠け', '変化なし']
const SKIN_RISK_OPTIONS = ['特になし', '赤みが出やすい', '乾燥しやすい', 'ワックス後赤み', 'ニキビができやすい', '敏感肌', '皮むけしやすい']
const NG_POINTS_OPTIONS = ['細すぎNG', '太すぎNG', '濃すぎNG', '眉山強調NG', '左右差を強調しない', '細めNG']

interface ProfileFormState {
  defaultDesign: string
  preferredThickness: number
  preferredDensity: number
  asymmetryType: string
  asymmetryLevel: number
  hairFlowNotes: string
  sparseAreaNotes: string
  skinRiskProfile: string
  ngPoints: string[]
  selfCareHabitNotes: string
  generalHandoverNotes: string
}

function profileToForm(profile: CustomerProfile | null): ProfileFormState {
  if (!profile) {
    return {
      defaultDesign: '',
      preferredThickness: 0,
      preferredDensity: 0,
      asymmetryType: '',
      asymmetryLevel: 0,
      hairFlowNotes: '',
      sparseAreaNotes: '',
      skinRiskProfile: '',
      ngPoints: [],
      selfCareHabitNotes: '',
      generalHandoverNotes: '',
    }
  }

  let ngPoints: string[] = []
  try {
    ngPoints = profile.ngPoints ? JSON.parse(profile.ngPoints as unknown as string) : []
  } catch { ngPoints = [] }

  return {
    defaultDesign: profile.defaultDesign ?? '',
    preferredThickness: Math.max(-3, Math.min(3, profile.preferredThickness)),
    preferredDensity: profile.preferredDensity,
    asymmetryType: profile.asymmetryType ?? '',
    asymmetryLevel: profile.asymmetryLevel,
    hairFlowNotes: profile.hairFlowNotes ?? '',
    sparseAreaNotes: profile.sparseAreaNotes ?? '',
    skinRiskProfile: profile.skinRiskProfile ?? '',
    ngPoints,
    selfCareHabitNotes: profile.selfCareHabitNotes ?? '',
    generalHandoverNotes: profile.generalHandoverNotes ?? '',
  }
}

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ProfileFormState | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/customers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('データの取得に失敗しました')
        return res.json()
      })
      .then((data: Customer) => {
        setCustomer(data)
        setForm(profileToForm(data.profile))
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  const updateForm = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    setError(null)
    try {
      const body = {
        profile: {
          defaultDesign: form.defaultDesign || null,
          preferredThickness: form.preferredThickness,
          preferredDensity: form.preferredDensity,
          asymmetryType: form.asymmetryType || null,
          asymmetryLevel: form.asymmetryLevel,
          hairFlowNotes: form.hairFlowNotes || null,
          sparseAreaNotes: form.sparseAreaNotes || null,
          skinRiskProfile: form.skinRiskProfile || null,
          ngPoints: form.ngPoints,
          selfCareHabitNotes: form.selfCareHabitNotes || null,
          generalHandoverNotes: form.generalHandoverNotes || null,
        },
      }

      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('保存に失敗しました')
      setSaved(true)
      setTimeout(() => router.push(`/customers/${id}`), 1500)
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
            <h1 className="text-lg font-bold text-primary">{customer.name}</h1>
            <p className="text-xs text-textLight">お客様情報編集</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="bg-orange-50 border border-warning border-opacity-30 rounded-xl p-3 text-warning text-sm">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-success bg-opacity-10 border border-success border-opacity-30 rounded-xl p-3 text-success text-sm flex items-center gap-2">
            <span>✓</span>
            保存しました。顧客詳細に戻ります...
          </div>
        )}

        {/* Basic design */}
        <SectionCard title="基本デザインの好み" defaultOpen>
          <ChipSelector
            options={DESIGN_OPTIONS}
            selected={form.defaultDesign ? [form.defaultDesign] : []}
            onChange={(v) => updateForm('defaultDesign', v[0] ?? '')}
            multiSelect={false}
          />
        </SectionCard>

        {/* Level selectors */}
        <SectionCard title="太さ・濃さ（基本値）" defaultOpen>
          <div className="space-y-6">
            <LevelSelector
              title="太さの基本好み"
              value={form.preferredThickness}
              onChange={(v) => updateForm('preferredThickness', v)}
              labels={thicknessLabels}
              showDiff={false}
              minLevel={-3}
              maxLevel={3}
            />
            <div className="border-t border-border" />
            <LevelSelector
              title="濃さの基本好み"
              value={Math.max(-3, Math.min(3, form.preferredDensity))}
              onChange={(v) => updateForm('preferredDensity', v)}
              labels={densityLabels}
              showDiff={false}
              minLevel={-3}
              maxLevel={3}
            />
          </div>
        </SectionCard>

        {/* Asymmetry */}
        <SectionCard title="基本左右差" defaultOpen>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-text mb-2">左右差タイプ</p>
              <ChipSelector
                options={ASYMMETRY_OPTIONS}
                selected={form.asymmetryType ? [form.asymmetryType] : []}
                onChange={(v) => updateForm('asymmetryType', v[0] ?? '')}
                multiSelect={false}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-text mb-2">
                左右差レベル: <span className="text-primary font-bold">{form.asymmetryLevel}</span>
              </p>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateForm('asymmetryLevel', level)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      form.asymmetryLevel === level
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-textLight border-border hover:border-primary'
                    }`}
                  >
                    {level === 0 ? 'なし' : level === 1 ? '軽微' : level === 2 ? '中程度' : '顕著'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Hair flow */}
        <SectionCard title="毛流れ" defaultOpen>
          <div className="space-y-3">
            <ChipSelector
              options={HAIR_FLOW_OPTIONS}
              selected={form.hairFlowNotes ? [form.hairFlowNotes] : []}
              onChange={(v) => updateForm('hairFlowNotes', v[0] ?? '')}
              multiSelect={false}
            />
            <input
              type="text"
              placeholder="その他の毛流れメモ（任意）"
              value={form.hairFlowNotes && !HAIR_FLOW_OPTIONS.includes(form.hairFlowNotes) ? form.hairFlowNotes : ''}
              onChange={(e) => updateForm('hairFlowNotes', e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text placeholder-muted focus:outline-none focus:border-primary"
            />
          </div>
        </SectionCard>

        {/* Sparse area */}
        <SectionCard title="薄い箇所" defaultOpen>
          <textarea
            placeholder="薄い箇所の詳細（例：右眉尻、左眉中央など）"
            value={form.sparseAreaNotes}
            onChange={(e) => updateForm('sparseAreaNotes', e.target.value)}
            className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
            rows={2}
          />
        </SectionCard>

        {/* Skin risk */}
        <SectionCard title="肌リスクプロフィール" defaultOpen>
          <div className="space-y-3">
            <ChipSelector
              options={SKIN_RISK_OPTIONS}
              selected={form.skinRiskProfile ? [form.skinRiskProfile] : []}
              onChange={(v) => updateForm('skinRiskProfile', v[0] ?? '')}
              multiSelect={false}
            />
            <input
              type="text"
              placeholder="その他の肌リスクメモ（任意）"
              value={form.skinRiskProfile && !SKIN_RISK_OPTIONS.includes(form.skinRiskProfile) ? form.skinRiskProfile : ''}
              onChange={(e) => updateForm('skinRiskProfile', e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text placeholder-muted focus:outline-none focus:border-primary"
            />
          </div>
        </SectionCard>

        {/* NG points */}
        <SectionCard title="NG事項" defaultOpen>
          <ChipSelector
            options={NG_POINTS_OPTIONS}
            selected={form.ngPoints}
            onChange={(v) => updateForm('ngPoints', v)}
          />
        </SectionCard>

        {/* Self care habits */}
        <SectionCard title="自己処理の癖・傾向" defaultOpen>
          <textarea
            placeholder="自己処理の傾向やクセ（例：眉下を抜く癖がある、眉頭を触りがちなど）"
            value={form.selfCareHabitNotes}
            onChange={(e) => updateForm('selfCareHabitNotes', e.target.value)}
            className="w-full p-3 rounded-xl border border-border bg-cardAlt text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
            rows={3}
          />
        </SectionCard>

        {/* Long-term handover */}
        <SectionCard title="長期的な申し送り" defaultOpen>
          <textarea
            placeholder="施術担当者が毎回確認すべき長期的な申し送り内容（例：左眉下は削りすぎ注意。平行寄りを維持。）"
            value={form.generalHandoverNotes}
            onChange={(e) => updateForm('generalHandoverNotes', e.target.value)}
            className="w-full p-3 rounded-xl border border-primary border-opacity-30 bg-primary bg-opacity-5 text-sm text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
            rows={4}
          />
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
            disabled={saving || saved}
            className="flex-1 py-3 px-6 bg-primary text-white rounded-xl font-bold text-base hover:bg-primaryLight transition-colors disabled:opacity-60 shadow-sm flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                保存中...
              </>
            ) : saved ? (
              <>
                <span>✓</span>
                保存しました
              </>
            ) : (
              '保存する'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
