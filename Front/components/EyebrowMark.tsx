'use client'

import React from 'react'
import { EyebrowTreatmentMark } from '@/Other/types/eyebrowMark'

interface EyebrowMarkProps {
  mark: EyebrowTreatmentMark
}

export default function EyebrowMark({ mark }: EyebrowMarkProps) {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${mark.normalizedX * 100}%`,
    top: `${mark.normalizedY * 100}%`,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }

  if (mark.markerType === 'pluck') {
    return (
      <div style={wrapperStyle}>
        <svg width="16" height="16" viewBox="0 0 16 16">
          <line x1="2" y1="2" x2="14" y2="14" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="14" y1="2" x2="2" y2="14" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  // cut: 横棒一本（長め） + 中央に縦線2本（カット範囲を示すマーク）
  return (
    <div style={wrapperStyle}>
      <svg width="34" height="22" viewBox="0 0 34 22">
        <line x1="4" y1="11" x2="30" y2="11" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        <line x1="13" y1="5" x2="13" y2="17" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        <line x1="21" y1="5" x2="21" y2="17" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}
