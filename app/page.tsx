'use client'

import React, { useEffect, useState } from 'react'
import CustomerCard from '@/Front/components/CustomerCard'
import { Customer } from '@/Other/types'

function getTodayString() {
  const now = new Date()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日（${weekdays[now.getDay()]}）`
}

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

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

  const filtered = customers.filter((c) => {
    if (!search) return true
    return (
      c.name.includes(search) ||
      (c.nameKana?.includes(search) ?? false) ||
      (c.profile?.defaultDesign?.includes(search) ?? false)
    )
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                眉
              </div>
              <h1 className="text-xl font-bold text-primary">眉毛サロン カルテシステム</h1>
            </div>
            <span className="text-sm text-textLight">{getTodayString()}</span>
          </div>
          <p className="text-textLight text-sm ml-11">本日の予約 / 顧客一覧</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="顧客名・ふりがなで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-text placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
            />
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-xs text-textLight">
              {loading ? '読み込み中...' : `${filtered.length}名`}
            </p>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-roseLight text-rose">初回</span>
              <span className="text-xs text-textLight">= 初回来店</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-textLight text-sm">読み込み中...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-orange-50 border border-warning border-opacity-30 rounded-xl p-4 text-warning text-sm">
            <strong>エラー:</strong> {error}
            <p className="mt-1 text-xs">データベースのセットアップを確認してください。</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-textLight">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-medium">顧客が見つかりません</p>
            {search && <p className="text-sm mt-1">「{search}」に一致する顧客はいません</p>}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
