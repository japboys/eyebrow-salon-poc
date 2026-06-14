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
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSelectType('pluck')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
            selectedType === 'pluck'
              ? 'bg-primary text-white border-primary'
              : 'bg-card text-textLight border-border hover:border-primary'
          }`}
        >
          抜き（×）
        </button>
        <button
          type="button"
          onClick={() => onSelectType('cut')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-1 ${
            selectedType === 'cut'
              ? 'bg-primary text-white border-primary'
              : 'bg-card text-textLight border-border hover:border-primary'
          }`}
        >
          <span>カット（</span>
          <svg width="28" height="18" viewBox="0 0 34 22" className="inline-block">
            <line x1="4" y1="11" x2="30" y2="11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <line x1="13" y1="5" x2="13" y2="17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <line x1="21" y1="5" x2="21" y2="17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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
