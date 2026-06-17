'use client'

import React, { useState } from 'react'
import { Customer } from '@/Other/types'

interface CustomerInfoModalProps {
  customer: Customer
  onClose: () => void
  onSaved: (updated: Customer) => void
}

interface FormState {
  name: string
  nameKana: string
  bookingName: string
  age: string
  phone: string
  email: string
}

function customerToForm(customer: Customer): FormState {
  return {
    name: customer.name,
    nameKana: customer.nameKana ?? '',
    bookingName: customer.bookingName ?? '',
    age: customer.age != null ? String(customer.age) : '',
    phone: customer.phone ?? '',
    email: customer.email ?? '',
  }
}

function FieldRow({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  suffix,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  suffix?: React.ReactNode
}) {
  return (
    <div className="py-2.5" style={{ borderBottom: '1px solid #F0EAE4' }}>
      <label className="block text-[11px] text-muted mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-[14px] text-text bg-transparent focus:outline-none"
        />
        {suffix}
      </div>
    </div>
  )
}

export default function CustomerInfoModal({ customer, onClose, onSaved }: CustomerInfoModalProps) {
  const [form, setForm] = useState<FormState>(() => customerToForm(customer))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const swapNames = () => {
    setForm(prev => ({
      ...prev,
      name: prev.bookingName || prev.name,
      bookingName: prev.name,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          nameKana: form.nameKana || null,
          bookingName: form.bookingName || null,
          age: form.age ? Number(form.age) : null,
          phone: form.phone || null,
          email: form.email || null,
        }),
      })
      if (!res.ok) throw new Error('保存に失敗しました')
      const updated = await res.json()
      onSaved(updated)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(42,26,14,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: '#FEFCFA',
          boxShadow: '0 -4px 32px rgba(90,62,43,0.18), 0 0 0 1px #E8E0D7',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: '#F8F3EE', borderBottom: '1px solid #E8E0D7' }}
        >
          <div>
            <h2 className="font-serif font-semibold text-primary text-[16px]">お客様情報</h2>
            <p className="text-[11px] text-muted mt-0.5">{customer.name}</p>
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

        {/* Content */}
        <div className="px-5 py-2">
          <FieldRow label="お名前（カルテ表示名）" value={form.name} onChange={v => update('name', v)} />
          <FieldRow
            label="予約者名（予約サイト等での登録名）"
            value={form.bookingName}
            onChange={v => update('bookingName', v)}
            placeholder="未登録"
            suffix={
              <button
                type="button"
                onClick={swapNames}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(90,62,43,0.07)', color: '#7B6A5E' }}
                title="お名前と予約者名を入れ替え"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            }
          />
          <FieldRow label="フリガナ" value={form.nameKana} onChange={v => update('nameKana', v)} />
          <FieldRow label="年齢" value={form.age} onChange={v => update('age', v.replace(/[^0-9]/g, ''))} type="number" placeholder="未登録" />
          <FieldRow label="電話番号" value={form.phone} onChange={v => update('phone', v)} type="tel" placeholder="未登録" />
          <FieldRow label="メールアドレス" value={form.email} onChange={v => update('email', v)} type="email" placeholder="未登録" />
        </div>

        {error && (
          <p className="px-5 pt-2 text-[12px] text-warning">{error}</p>
        )}

        {/* Footer */}
        <div className="px-5 py-4 flex gap-2.5" style={{ borderTop: '1px solid #E8E0D7' }}>
          <button
            onClick={onClose}
            className="flex-shrink-0 py-3 px-5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'rgba(90,62,43,0.06)', border: '1px solid #E8E0D7', color: '#7B6A5E' }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #5A3E2B 0%, #7A5540 100%)', boxShadow: '0 2px 8px rgba(90,62,43,0.22)' }}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                保存中...
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
