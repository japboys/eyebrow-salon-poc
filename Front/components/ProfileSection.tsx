'use client'

import React from 'react'
import { CustomerProfile } from '@/Other/types'

interface ProfileSectionProps {
  profile: CustomerProfile | null
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 border-b border-border last:border-0">
      <span className="text-xs text-textLight w-24 shrink-0 font-medium pt-0.5">{label}</span>
      <span className="text-sm text-text flex-1">{value}</span>
    </div>
  )
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  if (!profile) {
    return (
      <div className="text-center py-8 text-textLight">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm font-medium">プロフィール未登録</p>
        <p className="text-xs mt-1">「お客様情報を編集」から登録できます</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <InfoRow
        label="左右差"
        value={
          profile.asymmetryType ? (
            <span>
              {profile.asymmetryType}
              {profile.asymmetryLevel > 0 && (
                <span className="ml-2 text-xs bg-roseLight text-rose px-2 py-0.5 rounded-full">
                  レベル {profile.asymmetryLevel}
                </span>
              )}
            </span>
          ) : '特になし'
        }
      />
      <InfoRow
        label="毛流れ"
        value={profile.hairFlowNotes || '特になし'}
      />
      <InfoRow
        label="薄い箇所"
        value={profile.sparseAreaNotes || '特になし'}
      />
      <InfoRow
        label="肌リスク"
        value={
          profile.skinRiskProfile ? (
            <span className="bg-orange-50 text-warning px-2 py-0.5 rounded-full text-xs font-medium border border-warning border-opacity-30">
              {profile.skinRiskProfile}
            </span>
          ) : '特になし'
        }
      />
      <InfoRow
        label="自己処理"
        value={profile.selfCareHabitNotes || '特になし'}
      />
    </div>
  )
}
