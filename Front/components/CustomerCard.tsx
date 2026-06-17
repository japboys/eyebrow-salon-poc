'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Customer, VisitRecord, DesignPlan, TreatmentRecord, Appointment, Staff } from '@/Other/types'
import SurveyResultModal from '@/Front/components/SurveyResultModal'
import CustomerInfoModal from '@/Front/components/CustomerInfoModal'

const DURATION_OPTIONS = [20, 30, 40, 50, 60, 75, 90, 120]

interface CustomerCardProps {
  customer: Customer
  appointment?: Appointment
  staffList?: Staff[]
  onAppointmentUpdate?: (updated: Appointment) => void
  onCustomerUpdate?: (updated: Customer) => void
}

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

export default function CustomerCard({ customer, appointment, staffList, onAppointmentUpdate, onCustomerUpdate }: CustomerCardProps) {
  const router = useRouter()
  const [showSurvey, setShowSurvey] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showEditAppt, setShowEditAppt] = useState(false)
  const [editStaffId, setEditStaffId] = useState('')
  const [editDuration, setEditDuration] = useState(40)
  const [apptSaving, setApptSaving] = useState(false)

  const handleOpenEditAppt = () => {
    setEditStaffId(appointment?.staffId ?? '')
    setEditDuration(appointment?.duration ?? 40)
    setShowEditAppt(true)
  }

  const handleSaveEditAppt = async () => {
    if (!appointment) return
    setApptSaving(true)
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: editStaffId || null, duration: editDuration }),
      })
      if (!res.ok) return
      const updated = await res.json()
      onAppointmentUpdate?.(updated)
      setShowEditAppt(false)
    } catch {
      // 通信エラー時は表示状態を維持
    } finally {
      setApptSaving(false)
    }
  }

  const isNewCustomer = customer.visitCount <= 1
  const allVisits: VisitRecord[] = customer.visitRecords ?? []
  const latestVisit = allVisits[0]
  const hasTodayDraft = isToday(latestVisit?.visitDate) && latestVisit?.visitPolicy === 'draft'
  const hasTodayKarte = isToday(latestVisit?.visitDate) && latestVisit?.visitPolicy !== 'draft'
  const summaryVisit = !isNewCustomer && (hasTodayKarte
    ? allVisits.find(v => v.visitPolicy !== 'draft' && !isToday(v.visitDate)) ?? null
    : (hasTodayDraft ? allVisits.find(v => v.visitPolicy !== 'draft') ?? null : latestVisit ?? null))

  const assignedStaffName = appointment?.staffId
    ? staffList?.find(s => s.id === appointment.staffId)?.name ?? '未設定'
    : '未設定'

  return (
    <>
      <div
        className="bg-card rounded-2xl overflow-hidden transition-shadow duration-200"
        style={{ boxShadow: '0 1px 4px rgba(90,62,43,0.06), 0 4px 16px rgba(90,62,43,0.06)', border: '1px solid #E8E0D7' }}
      >
        {/* ── Card body ── */}
        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h3 className="font-serif text-[17px] font-semibold text-text leading-tight">{customer.name}</h3>
                {appointment && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(90,62,43,0.08)', color: '#5A3E2B' }}>
                    {appointment.time}〜
                  </span>
                )}
                {isNewCustomer && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-roseLight text-rose font-medium">初回</span>
                )}
                {hasTodayKarte && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(76,139,98,0.12)', color: '#4C8B62' }}>
                    本日完了
                  </span>
                )}
                {hasTodayDraft && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(203,111,81,0.12)', color: '#CB6F51' }}>
                    入力中
                  </span>
                )}
              </div>
              {customer.nameKana && <p className="text-xs text-muted">{customer.nameKana}</p>}
            </div>
            {/* Visit count badge */}
            <div className="flex-shrink-0 ml-2">
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={
                  isNewCustomer
                    ? { background: '#F4E4E8', color: '#B87484' }
                    : customer.visitCount <= 3
                    ? { background: '#EDD9C8', color: '#BE8A68' }
                    : { background: '#F8F3EE', color: '#5A3E2B' }
                }
              >
                {customer.visitCount === 0 ? '初回' : `${customer.visitCount}回目`}
              </span>
            </div>
          </div>

          {/* 予約情報: テキスト表示 + 予約編集ボタン */}
          {appointment && (
            <div className="flex items-center justify-between gap-2 mb-3 py-2 px-3 rounded-xl" style={{ background: 'rgba(90,62,43,0.04)', border: '1px solid #EDE5DD' }}>
              <p className="text-[12px] text-text leading-relaxed">
                <span className="text-muted">担当：</span>
                <span className="font-semibold text-primary">{assignedStaffName}</span>
                <span className="text-muted mx-2">　</span>
                <span className="text-muted">施術時間：</span>
                <span className="font-semibold text-primary">{appointment.duration}分</span>
              </p>
              <button
                onClick={handleOpenEditAppt}
                className="text-[11px] px-2.5 py-1 rounded-lg font-medium flex-shrink-0 transition-colors"
                style={{ background: 'rgba(90,62,43,0.08)', border: '1px solid #DDD0C4', color: '#5A3E2B' }}
              >
                予約編集
              </button>
            </div>
          )}

          {/* 前回サマリーを見る */}
          {summaryVisit && (
            <button
              onClick={() => router.push(`/customers/${customer.id}`)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl mb-3 transition-colors"
              style={{ background: '#F8F3EE', border: '1px solid #E5D8CD', color: '#7D6554' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#EDD9C8')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F8F3EE')}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6m-3-3v6" />
              </svg>
              前回サマリーを見る
              <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* 事前アンケート + お客様情報 ボタン */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowSurvey(true)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl transition-colors"
              style={{ background: 'rgba(190,138,104,0.08)', border: '1px solid rgba(190,138,104,0.28)', color: '#876552' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              事前アンケート
            </button>
            <button
              onClick={() => setShowInfo(true)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl transition-colors"
              style={{ background: 'rgba(90,62,43,0.06)', border: '1px solid #E8E0D7', color: '#7B6A5E' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              お客様情報
            </button>
          </div>
        </div>

        {/* ── CTA button area ── */}
        <div className="px-5 pb-5">
          {hasTodayDraft ? (
            <button
              onClick={() => router.push(`/customers/${customer.id}/visit/new?draft=${latestVisit!.treatmentId}`)}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold text-sm rounded-xl"
              style={{ height: '52px', background: 'linear-gradient(135deg, #CB6F51 0%, #D4836B 100%)', boxShadow: '0 2px 8px rgba(203,111,81,0.30)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              続きから始める
            </button>
          ) : isNewCustomer ? (
            <button
              onClick={() => router.push(`/customers/${customer.id}/visit/new`)}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold text-sm rounded-xl"
              style={{ height: '52px', background: 'linear-gradient(135deg, #B87484 0%, #C48A96 100%)', boxShadow: '0 2px 8px rgba(184,116,132,0.28)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規カルテ作成
            </button>
          ) : hasTodayKarte ? (
            <button
              onClick={() => router.push(`/customers/${customer.id}/visit/${latestVisit!.treatmentId}`)}
              className="w-full flex items-center justify-center gap-2 font-semibold text-sm rounded-xl transition-colors"
              style={{ height: '52px', background: 'rgba(76,139,98,0.08)', border: '1.5px solid rgba(76,139,98,0.25)', color: '#4C8B62' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              本日カルテを確認
            </button>
          ) : (
            <button
              onClick={() => router.push(`/customers/${customer.id}/visit/new`)}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold text-sm rounded-xl"
              style={{ height: '52px', background: 'linear-gradient(135deg, #5A3E2B 0%, #7A5540 100%)', boxShadow: '0 2px 8px rgba(90,62,43,0.22)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              本日のカルテを作成する
            </button>
          )}
        </div>
      </div>

      {/* 予約編集モーダル */}
      {showEditAppt && appointment && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(42,26,14,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowEditAppt(false) }}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden"
            style={{ background: '#FEFCFA', boxShadow: '0 -4px 32px rgba(90,62,43,0.18), 0 0 0 1px #E8E0D7' }}
          >
            <div className="flex items-center justify-between px-5 py-4"
              style={{ background: '#F8F3EE', borderBottom: '1px solid #E8E0D7' }}>
              <div>
                <h2 className="font-serif font-semibold text-primary text-[16px]">予約編集</h2>
                <p className="text-[11px] text-muted mt-0.5">{customer.name} — {appointment.time}〜</p>
              </div>
              <button onClick={() => setShowEditAppt(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-textLight"
                style={{ background: 'rgba(90,62,43,0.07)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-[11px] text-muted mb-2">担当スタッフ</label>
                <select
                  value={editStaffId}
                  onChange={e => setEditStaffId(e.target.value)}
                  className="w-full text-[14px] text-text bg-cardAlt focus:outline-none rounded-xl px-3"
                  style={{ height: '48px', border: '1.5px solid #E8E0D7' }}
                >
                  <option value="">未設定</option>
                  {staffList?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-muted mb-2">施術時間</label>
                <select
                  value={editDuration}
                  onChange={e => setEditDuration(Number(e.target.value))}
                  className="w-full text-[14px] text-text bg-cardAlt focus:outline-none rounded-xl px-3"
                  style={{ height: '48px', border: '1.5px solid #E8E0D7' }}
                >
                  {DURATION_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}分</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-5 py-4 flex gap-2.5" style={{ borderTop: '1px solid #E8E0D7' }}>
              <button onClick={() => setShowEditAppt(false)}
                className="flex-shrink-0 py-3 px-5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(90,62,43,0.06)', border: '1px solid #E8E0D7', color: '#7B6A5E' }}>
                キャンセル
              </button>
              <button onClick={handleSaveEditAppt} disabled={apptSaving}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #5A3E2B 0%, #7A5540 100%)', boxShadow: '0 2px 8px rgba(90,62,43,0.22)' }}>
                {apptSaving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />保存中...</>
                ) : '保存する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSurvey && (
        <SurveyResultModal customerName={customer.name} onClose={() => setShowSurvey(false)} />
      )}
      {showInfo && (
        <CustomerInfoModal
          customer={customer}
          onClose={() => setShowInfo(false)}
          onSaved={(updated) => onCustomerUpdate?.(updated)}
        />
      )}
    </>
  )
}
