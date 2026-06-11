'use client'

import React from 'react'

export const DUMMY_SURVEY = {
  q1_browCare: ['毛抜き', 'カット'],
  q2_skinType: '敏感',
  q3_skinCare: ['洗顔料', '化粧水'],
  q3_allergy: 'ニッケルアレルギーあり',
  q4_pastTreatment: ['WAX脱毛', 'まつ毛パーマ'],
  q5_pastReaction: ['赤身', 'かゆみ'],
  q6_recentHistory: ['日焼け'],
  q7_browConcern: ['左右差', '毛流れ'],
  q8_interest: ['眉毛パーマ', '店販、セルフケア商品'],
  snsConsent: true,
  submittedAt: '2025-03-10',
}

export function SurveyTag({ label, variant = 'default' }: { label: string; variant?: 'default' | 'highlight' | 'warning' }) {
  const styles: Record<string, React.CSSProperties> = {
    default:   { background: '#F8F3EE', color: '#7B6A5E', border: '1px solid #E8E0D7' },
    highlight: { background: 'rgba(90,62,43,0.09)', color: '#5A3E2B', border: '1px solid rgba(90,62,43,0.20)' },
    warning:   { background: 'rgba(203,111,81,0.10)', color: '#CB6F51', border: '1px solid rgba(203,111,81,0.25)' },
  }
  return (
    <span className="inline-block text-[13px] px-3 py-1 rounded-full font-medium" style={styles[variant]}>
      {label}
    </span>
  )
}

export function QRow({
  num,
  question,
  last = false,
  children,
}: {
  num: number | string
  question: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="py-3.5" style={last ? {} : { borderBottom: '1px solid #F0EAE4' }}>
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5"
          style={{ background: '#EDD9C8', color: '#5A3E2B' }}
        >
          {num}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-textLight mb-2 leading-snug">{question}</p>
          <div className="flex flex-wrap gap-1.5">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default function SurveyContent() {
  const s = DUMMY_SURVEY
  return (
    <div>
      <QRow num={1} question="普段どのような眉毛処理をしていますか">
        {s.q1_browCare.map(v => <SurveyTag key={v} label={v} variant="highlight" />)}
      </QRow>

      <QRow num={2} question="あなたのお肌タイプ">
        <SurveyTag label={s.q2_skinType} variant="highlight" />
      </QRow>

      <QRow num={3} question="スキンケアをしていますか？">
        {s.q3_skinCare.map(v => <SurveyTag key={v} label={v} variant="highlight" />)}
        {s.q3_allergy && (
          <div className="w-full mt-2">
            <p className="text-[11px] text-muted mb-1">アレルギー（自由記述）</p>
            <p className="text-[13px] text-text px-3 py-2 rounded-lg" style={{ background: '#F8F3EE', border: '1px solid #E8E0D7' }}>
              {s.q3_allergy}
            </p>
          </div>
        )}
      </QRow>

      <QRow num={4} question="過去の施術に関して">
        {s.q4_pastTreatment.map(v => <SurveyTag key={v} label={v} variant="highlight" />)}
      </QRow>

      {s.q5_pastReaction.length > 0 && (
        <QRow num={5} question="過去の施術でトラブルがありましたか">
          {s.q5_pastReaction.map(v => <SurveyTag key={v} label={v} variant="warning" />)}
        </QRow>
      )}

      <QRow num={6} question="直近で以下のいずれかに該当しますか？">
        {s.q6_recentHistory.length > 0
          ? s.q6_recentHistory.map(v => <SurveyTag key={v} label={v} variant="highlight" />)
          : <SurveyTag label="なし" />}
      </QRow>

      <QRow num={7} question="眉毛で気になることはございますか">
        {s.q7_browConcern.map(v => <SurveyTag key={v} label={v} variant="highlight" />)}
      </QRow>

      <QRow num={8} question="下記から気になるもの">
        {s.q8_interest.map(v => <SurveyTag key={v} label={v} variant="highlight" />)}
      </QRow>

      <div className="py-3.5">
        <div className="flex items-center gap-3">
          <span
            className="flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center"
            style={{ background: '#EDD9C8', color: '#5A3E2B' }}
          >
            同
          </span>
          <div className="flex-1 flex items-center justify-between flex-wrap gap-2">
            <p className="text-[12px] text-textLight">SNS等への掲載同意</p>
            <span
              className="text-[12px] font-semibold px-3 py-1 rounded-full"
              style={
                s.snsConsent
                  ? { background: 'rgba(76,139,98,0.10)', color: '#4C8B62' }
                  : { background: '#F8F3EE', color: '#AA9B93' }
              }
            >
              {s.snsConsent ? '同意あり' : '同意なし'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
