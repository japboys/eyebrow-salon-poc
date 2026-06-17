'use client'

import React from 'react'

interface DesignOptionChipsProps {
  options: string[]
  subOptionsMap: Record<string, string[]>
  selected: string[]
  subSelected: Record<string, string>
  onChange: (value: string[]) => void
  onSubChange: (subSelected: Record<string, string>) => void
}

export default function DesignOptionChips({
  options,
  subOptionsMap,
  selected,
  subSelected,
  onChange,
  onSubChange,
}: DesignOptionChipsProps) {
  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      // deselect: remove option and clear its sub-option
      onChange(selected.filter((o) => o !== option))
      const next = { ...subSelected }
      delete next[option]
      onSubChange(next)
    } else {
      onChange([...selected, option])
    }
  }

  const handleSubToggle = (option: string, sub: string) => {
    const current = subSelected[option]
    onSubChange({ ...subSelected, [option]: current === sub ? '' : sub })
  }

  return (
    <div className="flex flex-wrap items-start gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option)
        const subOptions = subOptionsMap[option]
        const currentSub = subSelected[option] ?? ''

        const selectedStyle = 'bg-primary text-white border-primary shadow-sm'
        const unselectedStyle = 'bg-cardAlt text-muted border-border hover:bg-accentLight hover:border-accent hover:text-primary'

        if (isSelected && subOptions && subOptions.length > 0) {
          // 展開状態: チップ内にサブオプションを縦並びで表示（自然な色）
          return (
            <div
              key={option}
              className="flex flex-col gap-1.5 px-3 py-2 rounded-2xl border border-border bg-cardAlt"
              style={{ minWidth: '80px' }}
            >
              <button
                type="button"
                onClick={() => handleToggle(option)}
                className="text-sm font-medium text-primary text-left flex items-center gap-1"
              >
                <span>{option}</span>
                <span className="text-[10px] text-muted">▲</span>
              </button>
              <div className="flex flex-col gap-1">
                {subOptions.map((sub) => {
                  const isSubSelected = currentSub === sub
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubToggle(option, sub)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-all duration-150 ${
                        isSubSelected
                          ? 'bg-primary text-white border-primary'
                          : 'bg-card text-textLight border-border hover:bg-accentLight hover:text-primary hover:border-accent'
                      }`}
                    >
                      {sub}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        }

        return (
          <button
            key={option}
            type="button"
            onClick={() => handleToggle(option)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${
              isSelected ? selectedStyle : unselectedStyle
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
