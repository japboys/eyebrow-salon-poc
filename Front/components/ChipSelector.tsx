'use client'

import React from 'react'

interface ChipSelectorProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  multiSelect?: boolean
  className?: string
}

export default function ChipSelector({
  options,
  selected,
  onChange,
  multiSelect = true,
  className = '',
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

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const isSelected = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => handleClick(option)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border
              ${isSelected
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-cardAlt text-muted border-border hover:bg-accentLight hover:border-accent hover:text-primary'
              }
            `}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
