'use client'

import React from 'react'

interface DesignOptionChipsProps {
  options: string[]
  subOptionsMap: Record<string, string[]>
  selected: string
  subSelected: string
  onChange: (value: string) => void
  onSubChange: (value: string) => void
  previousValue?: string
}

export default function DesignOptionChips({
  options,
  subOptionsMap,
  selected,
  subSelected,
  onChange,
  onSubChange,
  previousValue,
}: DesignOptionChipsProps) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      {options.map((option) => {
        const isSelected = selected === option
        const isPrev = previousValue === option
        const subOptions = subOptionsMap[option]

        let style: string
        if (isSelected && isPrev) {
          style = 'bg-primary text-white border-primary shadow-sm'
        } else if (isSelected && !isPrev) {
          style = previousValue
            ? 'bg-warning text-white border-warning shadow-sm'
            : 'bg-primary text-white border-primary shadow-sm'
        } else if (!isSelected && isPrev) {
          style = 'bg-prev text-prevText border-dashed border-prevText'
        } else {
          style = 'bg-cardAlt text-muted border-border hover:bg-accentLight hover:border-accent hover:text-primary'
        }

        const handleClick = () => {
          if (isSelected) {
            onChange('')
            onSubChange('')
          } else {
            onChange(option)
            onSubChange('')
          }
        }

        if (isSelected && subOptions) {
          return (
            <div key={option} className={`flex flex-col gap-2 px-3 py-2 rounded-2xl border ${style}`}>
              <button type="button" onClick={handleClick} className="text-sm font-medium text-left">
                {option}
              </button>
              <div className="flex flex-col gap-1.5">
                {subOptions.map((sub) => {
                  const isSubSelected = subSelected === sub
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => onSubChange(isSubSelected ? '' : sub)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium border text-left transition-all duration-150 ${
                        isSubSelected
                          ? 'bg-white text-text border-white'
                          : 'bg-white bg-opacity-15 text-white border-white border-opacity-40 hover:bg-opacity-25'
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
            onClick={handleClick}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${style}`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
