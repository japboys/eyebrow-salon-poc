'use client'

import React from 'react'

interface ChipSelectorProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  multiSelect?: boolean
  className?: string
  previousValues?: string[]
}

export default function ChipSelector({
  options,
  selected,
  onChange,
  multiSelect = true,
  className = '',
  previousValues,
}: ChipSelectorProps) {
  const handleClick = (option: string) => {
    if (multiSelect) {
      if (selected.includes(option)) {
        onChange(selected.filter((s) => s !== option))
      } else {
        onChange([...selected, option])
      }
    } else {
      if (selected.includes(option)) {
        onChange([])
      } else {
        onChange([option])
      }
    }
  }

  const hasPrev = previousValues && previousValues.length > 0

  const getChipStyle = (option: string): string => {
    const isSelected = selected.includes(option)
    const isPrev = hasPrev && previousValues!.includes(option)

    if (!hasPrev) {
      return isSelected
        ? 'bg-primary text-white border-primary shadow-sm'
        : 'bg-cardAlt text-muted border-border hover:bg-accentLight hover:border-accent hover:text-primary'
    }

    if (isSelected && isPrev) {
      // 今回選択 = 前回と同じ → モカブラウン
      return 'bg-primary text-white border-primary shadow-sm'
    }
    if (isSelected && !isPrev) {
      // 今回選択 ≠ 前回 → テラコッタ（変更あり）
      return 'bg-warning text-white border-warning shadow-sm'
    }
    if (!isSelected && isPrev) {
      // 前回値（未選択）→ 薄いベージュ
      return 'bg-prev text-prevText border-dashed border-prevText'
    }
    return 'bg-cardAlt text-muted border-border hover:bg-accentLight hover:border-accent hover:text-primary'
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleClick(option)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${getChipStyle(option)}`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
