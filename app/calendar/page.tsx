'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Appointment, Customer, Staff } from '@/Other/types'
import { toDateKey } from '@/Other/lib/date'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
const DAY_START_MIN = 9 * 60 // 9:00
const DAY_END_MIN = 19 * 60 // 19:00
const SLOT_MIN = 30
const ROW_HEIGHT = 44 // px per 30min
const HEADER_HEIGHT = 40 // px

const STATUS_STYLE: Record<string, { background: string; border: string; color: string }> = {
  scheduled: { background: 'rgba(90,62,43,0.10)', border: '#D8C6B8', color: '#5A3E2B' },
  completed: { background: 'rgba(76,139,98,0.12)', border: 'rgba(76,139,98,0.35)', color: '#4C8B62' },
  cancelled: { background: '#F1ECE7', border: '#E8E0D7', color: '#A99C8E' },
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

function getMonthMatrix(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const start = new Date(year, month, 1 - startOffset)
  const days: Date[] = []
  const cursor = new Date(start)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function formatDateLabel(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${y}年${m}月${d}日（${WEEKDAYS[date.getDay()]}）`
}

export default function CalendarPage() {
  const router = useRouter()
  const todayKey = toDateKey(new Date())

  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([])
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [staffFilter, setStaffFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/staff').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([c, s]) => {
        setCustomers(c)
        setStaffList(s)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch(`/api/appointments?date=${selectedDate}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setDayAppointments)
      .catch(() => setDayAppointments([]))
  }, [selectedDate])

  useEffect(() => {
    const from = toDateKey(new Date(monthCursor.year, monthCursor.month, 1))
    const to = toDateKey(new Date(monthCursor.year, monthCursor.month + 1, 0))
    fetch(`/api/appointments?from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMonthAppointments)
      .catch(() => setMonthAppointments([]))
  }, [monthCursor])

  const customersById = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers])

  const monthDays = useMemo(() => getMonthMatrix(monthCursor.year, monthCursor.month), [monthCursor])

  const countsByDate = useMemo(() => {
    const map = new Map<string, number>()
    monthAppointments.forEach((a) => {
      map.set(a.date, (map.get(a.date) ?? 0) + 1)
    })
    return map
  }, [monthAppointments])

  const visibleStaff = staffFilter ? staffList.filter((s) => s.id === staffFilter) : staffList

  const slots: number[] = []
  for (let m = DAY_START_MIN; m < DAY_END_MIN; m += SLOT_MIN) slots.push(m)

  const unassignedAppointments = dayAppointments.filter((a) => !a.staffId)

  const goToToday = () => {
    setSelectedDate(todayKey)
    const d = new Date()
    setMonthCursor({ year: d.getFullYear(), month: d.getMonth() })
  }

  const changeMonth = (delta: number) => {
    setMonthCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const renderAppointmentBlock = (a: Appointment) => {
    const start = timeToMinutes(a.time)
    const top = ((start - DAY_START_MIN) / SLOT_MIN) * ROW_HEIGHT
    const height = Math.max((a.duration / SLOT_MIN) * ROW_HEIGHT - 2, ROW_HEIGHT - 4)
    const customer = customersById.get(a.customerId)
    const style = STATUS_STYLE[a.status] ?? STATUS_STYLE.scheduled
    return (
      <button
        key={a.id}
        onClick={() => router.push(`/customers/${a.customerId}`)}
        className="absolute left-1 right-1 rounded-lg px-2 py-1 text-left overflow-hidden transition-shadow hover:shadow-sm"
        style={{
          top,
          height,
          background: style.background,
          border: `1px solid ${style.border}`,
          color: style.color,
        }}
      >
        <p className="text-[11px] font-semibold truncate leading-tight">{customer?.name ?? a.customerId}</p>
        <p className="text-[10px] truncate leading-tight opacity-80">
          {a.time}〜 ({a.duration}分){a.status === 'completed' ? ' ・完了' : a.status === 'cancelled' ? ' ・取消' : ''}
        </p>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* ── Header ── */}
      <header className="bg-card sticky top-0 z-10" style={{ boxShadow: '0 1px 0 #E8E0D7, 0 2px 12px rgba(90,62,43,0.05)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center gap-3">
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
            <h1 className="font-serif text-lg font-semibold text-primary truncate">カレンダー</h1>
            <p className="text-xs text-muted">予約タイムテーブル・月表示</p>
          </div>
          {selectedDate !== todayKey && (
            <button
              onClick={goToToday}
              className="px-4 font-medium text-sm rounded-xl transition-colors flex-shrink-0"
              style={{ height: '40px', background: 'rgba(90,62,43,0.06)', border: '1px solid #E8E0D7', color: '#7B6A5E' }}
            >
              今日に戻る
            </button>
          )}
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-25" />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="w-9 h-9 rounded-full border-[3px] border-border animate-spin mx-auto mb-4" style={{ borderTopColor: '#5A3E2B' }} />
              <p className="text-sm text-muted">読み込み中...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
            {/* ── Month calendar ── */}
            <div className="bg-card rounded-2xl border border-border p-4 self-start" style={{ boxShadow: '0 1px 4px rgba(90,62,43,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => changeMonth(-1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-textLight"
                  style={{ background: '#F8F3EE' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <p className="font-serif text-base font-semibold text-text">
                  {monthCursor.year}年{monthCursor.month + 1}月
                </p>
                <button
                  onClick={() => changeMonth(1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-textLight"
                  style={{ background: '#F8F3EE' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted mb-1">
                {WEEKDAYS.map((w) => (
                  <div key={w}>{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((date) => {
                  const key = toDateKey(date)
                  const inMonth = date.getMonth() === monthCursor.month
                  const count = countsByDate.get(key) ?? 0
                  const isSelected = key === selectedDate
                  const isTodayDate = key === todayKey
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDate(key)}
                      className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors"
                      style={{
                        background: isSelected ? '#5A3E2B' : isTodayDate ? 'rgba(90,62,43,0.08)' : 'transparent',
                        color: isSelected ? '#fff' : !inMonth ? '#C7BBAF' : '#3D2E22',
                        fontWeight: isTodayDate || isSelected ? 600 : 400,
                      }}
                    >
                      <span>{date.getDate()}</span>
                      {count > 0 && (
                        <span className="text-[9px] leading-none mt-0.5" style={{ color: isSelected ? '#F0E6DC' : '#BE8A68' }}>
                          {count}件
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Timetable ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-semibold text-text">{formatDateLabel(selectedDate)}のタイムテーブル</p>
                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="text-text focus:outline-none transition-all"
                  style={{
                    height: '40px',
                    borderRadius: '12px',
                    border: '1.5px solid #E8E0D7',
                    fontSize: '13px',
                    padding: '0 10px',
                    background: '#fff',
                  }}
                >
                  <option value="">スタッフ: すべて</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {dayAppointments.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <p className="text-sm text-muted">この日の予約はありません</p>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border overflow-x-auto" style={{ boxShadow: '0 1px 4px rgba(90,62,43,0.06)' }}>
                  <div className="flex" style={{ minWidth: `${56 + visibleStaff.length * 140 + (unassignedAppointments.length ? 140 : 0)}px` }}>
                    {/* time column */}
                    <div className="flex-shrink-0" style={{ width: 56 }}>
                      <div style={{ height: HEADER_HEIGHT }} className="border-b border-border" />
                      {slots.map((m) => (
                        <div
                          key={m}
                          style={{ height: ROW_HEIGHT }}
                          className="text-[10px] text-muted text-right pr-1.5 pt-0.5 border-t border-border"
                        >
                          {m % 60 === 0 ? formatMinutes(m) : ''}
                        </div>
                      ))}
                    </div>

                    {/* staff columns */}
                    {visibleStaff.map((staff) => (
                      <div key={staff.id} className="flex-1 border-l border-border" style={{ minWidth: 140 }}>
                        <div
                          style={{ height: HEADER_HEIGHT }}
                          className="border-b border-border flex items-center justify-center text-sm font-semibold text-text"
                        >
                          {staff.name}
                        </div>
                        <div className="relative" style={{ height: slots.length * ROW_HEIGHT }}>
                          {slots.map((m, i) => (
                            <div key={m} className="absolute left-0 right-0 border-t border-border" style={{ top: i * ROW_HEIGHT }} />
                          ))}
                          {dayAppointments.filter((a) => a.staffId === staff.id).map(renderAppointmentBlock)}
                        </div>
                      </div>
                    ))}

                    {/* unassigned column */}
                    {unassignedAppointments.length > 0 && (
                      <div className="flex-1 border-l border-border" style={{ minWidth: 140 }}>
                        <div
                          style={{ height: HEADER_HEIGHT }}
                          className="border-b border-border flex items-center justify-center text-sm font-semibold text-muted"
                        >
                          担当未設定
                        </div>
                        <div className="relative" style={{ height: slots.length * ROW_HEIGHT }}>
                          {slots.map((m, i) => (
                            <div key={m} className="absolute left-0 right-0 border-t border-border" style={{ top: i * ROW_HEIGHT }} />
                          ))}
                          {unassignedAppointments.map(renderAppointmentBlock)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
