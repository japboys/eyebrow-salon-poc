'use client'

import React, { useState } from 'react'

interface SectionCardProps {
  title: string
  collapsible?: boolean
  defaultOpen?: boolean
  badge?: string
  badgeColor?: string
  children: React.ReactNode
  className?: string
  titleRight?: React.ReactNode
}

export default function SectionCard({
  title,
  collapsible = false,
  defaultOpen = true,
  badge,
  badgeColor = 'bg-accentLight text-primary',
  children,
  className = '',
  titleRight,
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`bg-card rounded-2xl shadow-sm border border-border overflow-hidden ${className}`}>
      <div
        className={`flex items-center justify-between px-5 py-4 bg-cardAlt ${
          collapsible ? 'cursor-pointer select-none' : ''
        }`}
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-primary text-base">{title}</h3>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {titleRight}
          {collapsible && (
            <svg
              className={`w-5 h-5 text-primary transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
      {(!collapsible || isOpen) && (
        <div className="p-5 bg-card">
          {children}
        </div>
      )}
    </div>
  )
}
