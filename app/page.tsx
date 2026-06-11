'use client'

import React, { useEffect, useState } from 'react'
import CustomerCard from '@/Front/components/CustomerCard'
import { Appointment, Customer } from '@/Other/types'
import { toDateKey } from '@/Other/lib/date'

function getTodayString() {
  const now = new Date()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日（${weekdays[now.getDay()]}）`
}

function formatDateLabel(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${y}年${m}月${d}日（${weekdays[date.getDay()]}）`
}

type Tab = 'reserved' | 'completed'

export default function HomePage() {
  const todayKey = toDateKey(new Date())

  const [customers, setCustomers] = useState<Customer[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [tab, setTab] = useState<Tab>('reserved')

  const isToday = selectedDate === todayKey

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => {
        if (!res.ok) throw new Error('データの取得に失敗しました')
        return res.json()
      })
      .then((data) => {
        setCustomers(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetch(`/api/appointments?date=${selectedDate}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAppointments(data))
      .catch(() => setAppointments([]))
  }, [selectedDate])

  const customersById = new Map(customers.map((c) => [c.id, c]))

  let entries: { customer: Customer; appointmentTime?: string }[]

  if (isToday) {
    const wantedStatus = tab === 'reserved' ? 'scheduled' : 'completed'
    entries = appointments
      .filter((a) => a.status === wantedStatus)
      .slice()
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((a) => ({ customer: customersById.get(a.customerId), appointmentTime: a.time }))
      .filter((e): e is { customer: Customer; appointmentTime: string } => !!e.customer)
  } else {
    const appointmentByCustomer = new Map(appointments.map((a) => [a.customerId, a]))
    entries = customers
      .map((c) => ({ customer: c, appointmentTime: appointmentByCustomer.get(c.id)?.time }))
      .sort((a, b) => {
        if (a.appointmentTime && b.appointmentTime) return a.appointmentTime.localeCompare(b.appointmentTime)
        if (a.appointmentTime) return -1
        if (b.appointmentTime) return 1
        return (a.customer.nameKana ?? a.customer.name).localeCompare(b.customer.nameKana ?? b.customer.name, 'ja')
      })
  }

  const filtered = entries.filter(({ customer }) => {
    if (!search) return true
    return (
      customer.name.includes(search) ||
      (customer.nameKana?.includes(search) ?? false) ||
      (customer.profile?.defaultDesign?.includes(search) ?? false)
    )
  })

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="bg-card sticky top-0 z-10" style={{ boxShadow: '0 1px 0 #E8E0D7, 0 2px 12px rgba(90,62,43,0.05)' }}>
        <div className="max-w-4xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo mark */}
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 1px 6px rgba(90,62,43,0.25)' }}>
                <span className="font-serif text-white text-sm font-semibold tracking-wider">眉</span>
              </div>
              <div>
                <h1 className="font-serif text-lg font-semibold text-primary leading-tight tracking-wide">
                  眉毛サロン カルテシステム
                </h1>
                <p className="text-xs text-muted leading-none mt-0.5">本日の予約 / 顧客一覧</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-text">{getTodayString()}</p>
            </div>
          </div>
        </div>
        {/* Thin accent rule */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-30" />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* ── Date picker + tabs ── */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value || todayKey)}
              className="bg-card text-text focus:outline-none transition-all"
              style={{
                height: '48px',
                borderRadius: '14px',
                border: '1.5px solid #E8E0D7',
                fontSize: '15px',
                padding: '0 14px',
                boxShadow: '0 1px 4px rgba(90,62,43,0.05)',
              }}
            />
          </div>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayKey)}
              className="px-4 font-medium text-sm rounded-xl transition-colors"
              style={{ height: '48px', background: 'rgba(90,62,43,0.06)', border: '1px solid #E8E0D7', color: '#7B6A5E' }}
            >
              今日に戻る
            </button>
          )}

          {isToday ? (
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => setTab('reserved')}
                className="px-4 font-semibold text-sm rounded-xl transition-colors"
                style={
                  tab === 'reserved'
                    ? { height: '48px', background: '#5A3E2B', color: '#fff' }
                    : { height: '48px', background: 'rgba(90,62,43,0.06)', border: '1px solid #E8E0D7', color: '#7B6A5E' }
                }
              >
                予約
              </button>
              <button
                onClick={() => setTab('completed')}
                className="px-4 font-semibold text-sm rounded-xl transition-colors"
                style={
                  tab === 'completed'
                    ? { height: '48px', background: '#5A3E2B', color: '#fff' }
                    : { height: '48px', background: 'rgba(90,62,43,0.06)', border: '1px solid #E8E0D7', color: '#7B6A5E' }
                }
              >
                完了
              </button>
            </div>
          ) : (
            <p className="ml-auto text-sm font-medium text-textLight">{formatDateLabel(selectedDate)}の全顧客</p>
          )}
        </div>

        {/* ── Search ── */}
        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none"
              style={{ width: '18px', height: '18px' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="顧客名・ふりがなで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 bg-card text-text placeholder-muted focus:outline-none transition-all"
              style={{
                height: '52px',
                borderRadius: '14px',
                border: '1.5px solid #E8E0D7',
                fontSize: '15px',
                boxShadow: '0 1px 4px rgba(90,62,43,0.05)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#5A3E2B'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(90,62,43,0.10)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#E8E0D7'
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(90,62,43,0.05)'
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2.5 px-1">
            <p className="text-xs text-muted">
              {loading ? '読み込み中...' : `${filtered.length}名`}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-roseLight text-rose font-medium">初回</span>
              <span className="text-[11px] text-muted">= 初回来店</span>
            </div>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div
                className="w-9 h-9 rounded-full border-[3px] border-border animate-spin mx-auto mb-4"
                style={{ borderTopColor: '#5A3E2B' }}
              />
              <p className="text-sm text-muted">読み込み中...</p>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="rounded-2xl border border-warning border-opacity-30 p-4 text-sm"
            style={{ background: 'rgba(203,111,81,0.05)' }}>
            <strong className="text-warning">エラー:</strong>
            <span className="text-textLight ml-1">{error}</span>
            <p className="mt-1 text-xs text-muted">データベースのセットアップを確認してください。</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-textLight">
            <div className="w-16 h-16 rounded-2xl bg-cardAlt flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            {search ? (
              <>
                <p className="font-medium text-text">顧客が見つかりません</p>
                <p className="text-sm mt-1 text-muted">「{search}」に一致する顧客はいません</p>
              </>
            ) : isToday && tab === 'reserved' ? (
              <p className="font-medium text-text">本日の予約はありません</p>
            ) : isToday && tab === 'completed' ? (
              <p className="font-medium text-text">本日完了したカルテはまだありません</p>
            ) : (
              <p className="font-medium text-text">顧客が見つかりません</p>
            )}
          </div>
        )}

        {/* ── Customer grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(({ customer, appointmentTime }) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                appointmentTime={appointmentTime}
                onCustomerUpdate={(updated) => {
                  setCustomers((prev) =>
                    prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
                  )
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
