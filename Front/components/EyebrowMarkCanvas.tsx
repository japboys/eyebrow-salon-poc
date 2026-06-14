'use client'

import React, { useRef } from 'react'
import { EyebrowTreatmentMark, EyebrowSide } from '@/Other/types/eyebrowMark'
import EyebrowMark from './EyebrowMark'

export interface EyebrowMarkClickInfo {
  x: number
  y: number
  normalizedX: number
  normalizedY: number
  imageWidth: number
  imageHeight: number
  eyebrowSide: EyebrowSide
}

interface EyebrowMarkCanvasProps {
  marks: EyebrowTreatmentMark[]
  onAddMark?: (info: EyebrowMarkClickInfo) => void
  readOnly?: boolean
}

export default function EyebrowMarkCanvas({ marks, onAddMark, readOnly = false }: EyebrowMarkCanvasProps) {
  const imageRef = useRef<HTMLImageElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (readOnly || !onAddMark) return
    const imageElement = imageRef.current
    if (!imageElement) return

    const rect = imageElement.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const normalizedX = x / rect.width
    const normalizedY = y / rect.height
    const eyebrowSide: EyebrowSide = normalizedX < 0.5 ? 'left' : 'right'

    onAddMark({
      x,
      y,
      normalizedX,
      normalizedY,
      imageWidth: rect.width,
      imageHeight: rect.height,
      eyebrowSide,
    })
  }

  return (
    <div className="relative w-full">
      <img
        ref={imageRef}
        src="/images/eyebrow-template.svg"
        alt="眉毛テンプレート"
        draggable={false}
        onClick={handleClick}
        className={`w-full select-none rounded-xl border border-border ${readOnly ? '' : 'cursor-crosshair'}`}
      />
      {marks.map((mark) => (
        <EyebrowMark key={mark.id} mark={mark} />
      ))}
    </div>
  )
}
