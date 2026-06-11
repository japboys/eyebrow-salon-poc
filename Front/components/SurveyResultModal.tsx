'use client'

import React from 'react'
import SurveyContent, { DUMMY_SURVEY } from './SurveyContent'

interface SurveyResultModalProps {
  customerName: string
  onClose: () => void
}

export default function SurveyResultModal({ customerName, onClose }: SurveyResultModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(42,26,14,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: '#FEFCFA',
          boxShadow: '0 -4px 32px rgba(90,62,43,0.18), 0 0 0 1px #E8E0D7',
          maxHeight: '90dvh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: '#F8F3EE', borderBottom: '1px solid #E8E0D7' }}
        >
          <div>
            <h2 className="font-serif font-semibold text-primary text-[16px]">事前アンケート結果</h2>
            <p className="text-[11px] text-muted mt-0.5">{customerName}　／　回答日: {DUMMY_SURVEY.submittedAt}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-textLight"
            style={{ background: 'rgba(90,62,43,0.07)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Notice */}
        <div
          className="mx-5 mt-4 mb-0 px-3.5 py-2.5 rounded-xl text-[12px] text-textLight flex items-center gap-2 flex-shrink-0"
          style={{ background: 'rgba(203,111,81,0.08)', border: '1px solid rgba(203,111,81,0.20)' }}
        >
          <svg className="w-4 h-4 text-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          現在はサンプルデータを表示しています。データ連携は今後実装予定です。
        </div>

        {/* Scroll body */}
        <div className="overflow-y-auto flex-1 px-5">
          <SurveyContent />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #E8E0D7' }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #5A3E2B 0%, #7A5540 100%)', boxShadow: '0 2px 8px rgba(90,62,43,0.22)' }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
