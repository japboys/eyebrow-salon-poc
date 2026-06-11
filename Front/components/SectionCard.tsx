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
    <div
      className={`bg-card rounded-2xl overflow-hidden ${className}`}
      style={{ border: '1px solid #E8E0D7', boxShadow: '0 1px 4px rgba(90,62,43,0.05), 0 2px 10px rgba(90,62,43,0.04)' }}
    >
      {/* Section header */}
      <div
        className={`flex items-center justify-between px-5 py-3.5 ${collapsible ? 'cursor-pointer select-none' : ''}`}
        style={{ background: '#F8F3EE', borderBottom: isOpen || !collapsible ? '1px solid #E8E0D7' : 'none' }}
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
      >
        <div className="flex items-center gap-2.5">
          <h3 className="font-serif font-semibold text-primary text-[15px] tracking-wide">{title}</h3>
          {badge && (
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {titleRight}
          {collapsible && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200"
              style={{
                background: 'rgba(90,62,43,0.07)',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Section body */}
      {(!collapsible || isOpen) && (
        <div className="p-5 bg-card">
          {children}
        </div>
      )}
    </div>
  )
}
