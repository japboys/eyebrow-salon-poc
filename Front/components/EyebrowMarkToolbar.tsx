'use client'

import React from 'react'
import { MarkerType } from '@/Other/types/eyebrowMark'

interface EyebrowMarkToolbarProps {
  selectedType: MarkerType
  onSelectType: (type: MarkerType) => void
  onUndo: () => void
  onClearLeft: () => void
  onClearRight: () => void
  canUndo: boolean
}

export default function EyebrowMarkToolbar({
  selectedType,
  onSelectType,
  onUndo,
  onClearLeft,
  onClearRight,
  canUndo,
}: EyebrowMarkToolbarProps) {
  const btnBase = 'flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-1'
  const btnActive = 'bg-primary text-white border-primary'
  const btnInactive = 'bg-card text-textLight border-border hover:border-primary'

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSelectType('pluck')}
          className={`${btnBase} ${selectedType === 'pluck' ? btnActive : btnInactive}`}
        >
          抜き（×）
        </button>
        <button
          type="button"
          onClick={() => onSelectType('cut')}
          className={`${btnBase} ${selectedType === 'cut' ? btnActive : btnInactive}`}
        >
          <span>カット（</span>
          <svg width="28" height="18" viewBox="0 0 34 22" className="inline-block">
            <line x1="4" y1="11" x2="30" y2="11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <line x1="13" y1="5" x2="13" y2="17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <line x1="21" y1="5" x2="21" y2="17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span>）</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectType('thin_out')}
          className={`${btnBase} ${selectedType === 'thin_out' ? btnActive : btnInactive}`}
        >
          <span>間引（</span>
          <svg width="16" height="12" viewBox="0 0 18 14" className="inline-block">
            <polyline points="2,2 9,12 16,2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>）</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectType('makeup')}
          className={`${btnBase} ${selectedType === 'makeup' ? btnActive : btnInactive}`}
        >
          <span>メーク（</span>
          <svg width="14" height="14" viewBox="0 0 18 18" className="inline-block">
            <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
          </svg>
          <span>）</span>
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 border-border text-textLight hover:bg-cardAlt transition-colors disabled:opacity-40"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={onClearLeft}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 border-border text-textLight hover:bg-cardAlt transition-colors"
        >
          左眉削除
        </button>
        <button
          type="button"
          onClick={onClearRight}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 border-border text-textLight hover:bg-cardAlt transition-colors"
        >
          右眉削除
        </button>
      </div>
    </div>
  )
}
