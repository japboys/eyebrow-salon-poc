'use client'

import React from 'react'

interface LevelSelectorProps {
  value: number
  previousValue?: number
  onChange: (value: number) => void
  labels: Record<number, string>
  title: string
  showDiff?: boolean
  minLevel?: number
  maxLevel?: number
}

export default function LevelSelector({
  value,
  previousValue,
  onChange,
  labels,
  title,
  showDiff = true,
  minLevel = -5,
  maxLevel = 5,
}: LevelSelectorProps) {
  const levels = Array.from({ length: maxLevel - minLevel + 1 }, (_, i) => minLevel + i)
  const diff = previousValue !== undefined ? value - previousValue : null

  const getDiffText = () => {
    if (diff === null || previousValue === undefined) return null
    if (diff === 0) return '前回と同じ'
    const absText = title.includes('太') ? (diff > 0 ? '太く' : '細く') :
                    title.includes('角') ? (diff > 0 ? 'つり眉に' : 'たれ眉に') :
                    title.includes('濃') ? (diff > 0 ? '濃く' : '薄く') : ''
    return `前回より${Math.abs(diff)}段階${absText}`
  }

  const diffText = getDiffText()

  return (
    <div className="space-y-2">
      {/* Title with current value badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text">{title}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            value === 0
              ? 'bg-cardAlt text-textLight border-border'
              : 'bg-primary bg-opacity-10 text-primary border-primary border-opacity-30'
          }`}>
            {labels[value] ?? String(value)}
          </span>
        </div>
        {showDiff && diffText && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            diff === 0 ? 'bg-cardAlt text-textLight' : 'bg-roseLight text-rose'
          }`}>
            {diffText}
          </span>
        )}
      </div>

      {/* Level chips — anchors (min, 0, max) show label below number */}
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {levels.map((level) => {
          const isPrevious = previousValue === level
          const isCurrent = value === level
          const shortLabel = level === 0 ? '0' : level > 0 ? `+${level}` : String(level)
          const isAnchor = level === minLevel || level === 0 || level === maxLevel

          return (
            <button
              key={level}
              onClick={() => onChange(level)}
              title={labels[level] ?? String(level)}
              className={`
                relative flex-shrink-0 flex flex-col items-center justify-center gap-0.5
                min-w-[2.75rem] h-11 px-1 rounded-lg text-xs font-medium
                transition-all duration-150 border
                ${isCurrent
                  ? 'bg-primary text-white border-primary shadow-sm scale-105'
                  : isPrevious
                  ? 'bg-prev text-prevText border-dashed border-prevText'
                  : 'bg-cardAlt text-muted border-border hover:bg-accentLight hover:border-accent'
                }
              `}
            >
              <span>{shortLabel}</span>
              <span className={`text-[9px] leading-none ${
                !isAnchor ? 'invisible' :
                isCurrent ? 'opacity-80' : 'opacity-60'
              }`}>
                {labels[level] ?? ''}
              </span>
              {isPrevious && !isCurrent && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-prevText rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2 flex-wrap">
        {previousValue !== undefined && (
          <button
            onClick={() => onChange(previousValue)}
            className="text-xs px-3 py-1.5 rounded-lg bg-prev text-prevText border border-dashed border-prevText hover:bg-accentLight transition-colors"
          >
            前回と同じ ({labels[previousValue]})
          </button>
        )}
        <button
          onClick={() => onChange(Math.max(minLevel, value - 1))}
          disabled={value <= minLevel}
          className="text-xs px-3 py-1.5 rounded-lg bg-cardAlt text-textLight border border-border hover:bg-accentLight disabled:opacity-40 transition-colors"
        >
          {title.includes('太') ? '1段階細く' : title.includes('角') ? '1段階たれ眉に' : '1段階薄く'}
        </button>
        <button
          onClick={() => onChange(Math.min(maxLevel, value + 1))}
          disabled={value >= maxLevel}
          className="text-xs px-3 py-1.5 rounded-lg bg-cardAlt text-textLight border border-border hover:bg-accentLight disabled:opacity-40 transition-colors"
        >
          {title.includes('太') ? '1段階太く' : title.includes('角') ? '1段階つり眉に' : '1段階濃く'}
        </button>
      </div>
    </div>
  )
}

export const thicknessLabels: Record<number, string> = {
  [-5]: '激細',
  [-4]: 'かなり細め',
  [-3]: '細め',
  [-2]: 'やや細め',
  [-1]: '少し細め',
  0: '標準',
  1: '少し太め',
  2: 'やや太め',
  3: '太め',
  4: 'かなり太め',
  5: '激太',
}

export const angleLabels: Record<number, string> = {
  [-5]: 'たれ眉',
  [-4]: 'たれ眉やや',
  [-3]: 'たれ眉自然',
  [-2]: 'やや平行寄り',
  [-1]: '少し平行',
  0: '平行',
  1: '少し角度',
  2: 'やや角度',
  3: 'つり眉自然',
  4: 'つり眉やや',
  5: 'つり眉',
}

export const densityLabels: Record<number, string> = {
  [-3]: 'かなり薄め',
  [-2]: 'やや薄め',
  [-1]: '少し薄め',
  0: '標準',
  1: '少し濃め',
  2: 'やや濃め',
  3: 'かなり濃い',
}
