'use client'

import React from 'react'
import { Customer, VisitRecord } from '@/Other/types'
import { BriefingSection, createStructuredBriefingCard } from '@/Other/lib/briefing/structured-briefing'

interface StructuredBriefingPanelProps {
  customer: Customer
  visit: VisitRecord | null | undefined
}

function getSectionStyle(level: BriefingSection['level']) {
  if (level === 'danger') {
    return {
      wrapper: 'bg-orange-50 border-warning border-opacity-30',
      title: 'text-warning',
      dot: 'bg-warning',
    }
  }
  if (level === 'caution') {
    return {
      wrapper: 'bg-roseLight border-rose border-opacity-20',
      title: 'text-rose',
      dot: 'bg-rose',
    }
  }
  return {
    wrapper: 'bg-cardAlt border-border',
    title: 'text-primary',
    dot: 'bg-primary',
  }
}

function EmptyLine({ sectionId }: { sectionId: BriefingSection['id'] }) {
  const text = sectionId === 'critical' ? '重要注意なし' : '記録なし'
  return <p className="text-xs text-muted">{text}</p>
}

export default function StructuredBriefingPanel({ customer, visit }: StructuredBriefingPanelProps) {
  if (!visit) return null

  const card = createStructuredBriefingCard(customer, visit)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary">構造化ブリーフィング</p>
          <p className="text-xs text-muted">AIを使わず、保存済みカルテ項目から生成</p>
        </div>
        {card.visitNumber && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-prev text-prevText font-medium">
            第{card.visitNumber}回
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {card.sections.map((section) => {
          const style = getSectionStyle(section.level)
          return (
            <section
              key={section.id}
              className={`rounded-xl border px-3 py-3 ${style.wrapper}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <h4 className={`text-xs font-bold ${style.title}`}>{section.title}</h4>
              </div>
              {section.items.length > 0 ? (
                <ul className="space-y-1.5">
                  {section.items.map((item) => (
                    <li key={item} className="text-sm text-text leading-relaxed flex gap-2">
                      <span className="text-muted flex-shrink-0">・</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyLine sectionId={section.id} />
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
