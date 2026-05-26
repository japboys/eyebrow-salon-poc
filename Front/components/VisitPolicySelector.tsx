'use client'

import React from 'react'

type VisitPolicy = 'same_as_previous' | 'partial_change' | 'major_change'

interface VisitPolicySelectorProps {
  value: VisitPolicy
  onChange: (value: VisitPolicy) => void
  compact?: boolean
}

const policies = [
  {
    value: 'same_as_previous' as VisitPolicy,
    label: '前回と同じ',
    description: '前回と同じ内容で施術',
    icon: '✓',
    colorClass: 'border-primary bg-primary text-white',
    inactiveClass: 'border-border bg-card text-textLight hover:border-primary hover:bg-cardAlt',
  },
  {
    value: 'partial_change' as VisitPolicy,
    label: '一部変更',
    description: '変更する項目を選ぶ',
    icon: '±',
    colorClass: 'border-accent bg-accent text-white',
    inactiveClass: 'border-border bg-card text-textLight hover:border-accent hover:bg-cardAlt',
  },
  {
    value: 'major_change' as VisitPolicy,
    label: '大きく変更',
    description: '詳細を入力',
    icon: '✎',
    colorClass: 'border-rose bg-rose text-white',
    inactiveClass: 'border-border bg-card text-textLight hover:border-rose hover:bg-cardAlt',
  },
]

export default function VisitPolicySelector({
  value,
  onChange,
  compact = false,
}: VisitPolicySelectorProps) {
  if (compact) {
    return (
      <div className="flex gap-2">
        {policies.map((policy) => (
          <button
            key={policy.value}
            type="button"
            onClick={() => onChange(policy.value)}
            className={`
              flex-1 py-2 px-3 rounded-xl text-sm font-semibold border-2 transition-all duration-150
              ${value === policy.value ? policy.colorClass : policy.inactiveClass}
            `}
          >
            {policy.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {policies.map((policy) => (
        <button
          key={policy.value}
          type="button"
          onClick={() => onChange(policy.value)}
          className={`
            py-4 px-3 rounded-xl border-2 transition-all duration-150 text-center
            ${value === policy.value ? policy.colorClass : policy.inactiveClass}
          `}
        >
          <div className="text-2xl mb-1">{policy.icon}</div>
          <div className="font-bold text-sm">{policy.label}</div>
          <div className={`text-xs mt-0.5 ${value === policy.value ? 'opacity-80' : 'text-muted'}`}>
            {policy.description}
          </div>
        </button>
      ))}
    </div>
  )
}

export type { VisitPolicy }
