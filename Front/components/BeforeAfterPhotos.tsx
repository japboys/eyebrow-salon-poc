'use client'

import React from 'react'

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5">
      <div className="w-full aspect-square rounded-xl bg-cardAlt border border-dashed border-border flex items-center justify-center">
        <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span className="text-xs font-medium text-textLight">{label}</span>
    </div>
  )
}

interface BeforeAfterPhotosProps {
  title?: string
  note?: string
}

export default function BeforeAfterPhotos({ title = '前回のBefore/After', note }: BeforeAfterPhotosProps) {
  return (
    <div className="space-y-2">
      {title && <p className="text-xs text-textLight font-medium">{title}</p>}
      <div className="flex gap-3">
        <PhotoPlaceholder label="Before" />
        <PhotoPlaceholder label="After" />
      </div>
      <p className="text-[11px] text-muted">
        {note ?? '※ 現在はサンプル画像を表示しています。今後スタッフが撮影した写真を表示できるようになります。'}
      </p>
    </div>
  )
}
