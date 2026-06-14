'use client'

import React, { useEffect, useRef, useState } from 'react'
import SectionCard from './SectionCard'
import EyebrowMarkCanvas, { EyebrowMarkClickInfo } from './EyebrowMarkCanvas'
import EyebrowMarkToolbar from './EyebrowMarkToolbar'
import { EyebrowTreatmentMark, EyebrowSide, MarkerType } from '@/Other/types/eyebrowMark'

interface EyebrowMarkAccordionProps {
  marks: EyebrowTreatmentMark[]
  onChange: (marks: EyebrowTreatmentMark[]) => void
  customerId: string
  treatmentId: string
  visitNumber: number
  readOnly?: boolean
  defaultOpen?: boolean
}

function getDraftKey(customerId: string, treatmentId: string, visitNumber: number) {
  return `eyebrow-mark-draft:${customerId}:${treatmentId || 'new'}:${visitNumber}`
}

export default function EyebrowMarkAccordion({
  marks,
  onChange,
  customerId,
  treatmentId,
  visitNumber,
  readOnly = false,
  defaultOpen = false,
}: EyebrowMarkAccordionProps) {
  const [selectedType, setSelectedType] = useState<MarkerType>('pluck')
  const draftKey = getDraftKey(customerId, treatmentId, visitNumber)
  const restoredRef = useRef(false)

  // 初回マウント時、DB側のマークが空でローカルに一時保存があれば復元する
  useEffect(() => {
    if (readOnly || restoredRef.current) return
    restoredRef.current = true
    if (marks.length > 0) return
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return
      const restored = JSON.parse(raw) as EyebrowTreatmentMark[]
      if (Array.isArray(restored) && restored.length > 0) {
        onChange(restored)
      }
    } catch {
      // ignore broken localStorage data
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey])

  // 編集内容を一時保存（reload/close後の復元用）
  useEffect(() => {
    if (readOnly) return
    try {
      localStorage.setItem(draftKey, JSON.stringify(marks))
    } catch {
      // ignore storage quota errors
    }
  }, [draftKey, marks, readOnly])

  const handleAddMark = (info: EyebrowMarkClickInfo) => {
    const now = new Date().toISOString()
    const newMark: EyebrowTreatmentMark = {
      id: `mark-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      customerId,
      treatmentId,
      visitNumber,
      eyebrowSide: info.eyebrowSide,
      markerType: selectedType,
      x: info.x,
      y: info.y,
      normalizedX: info.normalizedX,
      normalizedY: info.normalizedY,
      imageWidth: info.imageWidth,
      imageHeight: info.imageHeight,
      orderIndex: marks.length,
      createdAt: now,
      updatedAt: now,
    }
    onChange([...marks, newMark])
  }

  const handleUndo = () => {
    if (marks.length === 0) return
    onChange(marks.slice(0, -1))
  }

  const handleClearSide = (side: EyebrowSide) => {
    onChange(marks.filter((m) => m.eyebrowSide !== side))
  }

  return (
    <SectionCard
      title="施術マーク記録"
      collapsible
      defaultOpen={defaultOpen}
    >
      <div className="space-y-4">
        <p className="text-xs text-textLight">
          {readOnly
            ? 'このカルテで記録された施術マークです。'
            : '施術タイプを選択し、眉のテンプレート画像をタップするとマークが追加されます。'}
        </p>
        {!readOnly && (
          <EyebrowMarkToolbar
            selectedType={selectedType}
            onSelectType={setSelectedType}
            onUndo={handleUndo}
            onClearLeft={() => handleClearSide('left')}
            onClearRight={() => handleClearSide('right')}
            canUndo={marks.length > 0}
          />
        )}
        <EyebrowMarkCanvas marks={marks} onAddMark={handleAddMark} readOnly={readOnly} />
      </div>
    </SectionCard>
  )
}
