'use client'

import React from 'react'

interface AIPlaceholderProps {
  sampleText?: string
}

const DEFAULT_SAMPLE = `前回施術から約1ヶ月経過。太さ・角度は前回同様に維持。左眉下の毛流れに注意しながら施術を行うこと。肌状態は通常範囲内だが赤みが出やすいため、ワックス後の保湿ケアを必ず実施すること。次回は眉頭の整え方についてお客様の希望を再確認すること。`

export default function AIPlaceholder({ sampleText }: AIPlaceholderProps) {
  return (
    <div className="border-2 border-dashed border-prev rounded-xl p-5 bg-cardAlt">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">✨</span>
        <div>
          <h4 className="font-semibold text-primary text-sm">AI申し送り生成機能（実装予定）</h4>
          <p className="text-xs text-textLight mt-0.5">
            来店情報を自動解析してスタッフ間の申し送り文を生成します
          </p>
        </div>
      </div>

      {/* Sample output area */}
      <div className="bg-white rounded-lg p-3 mb-3 border border-border">
        <p className="text-xs text-muted leading-relaxed" style={{ color: '#B8A99A' }}>
          {sampleText || DEFAULT_SAMPLE}
        </p>
      </div>

      {/* Feature list */}
      <div className="flex flex-wrap gap-2 mb-3">
        {['前回比較分析', 'リスク自動検出', '申し送り文生成', 'スタッフへの注意点'].map((f) => (
          <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-prev text-prevText">
            {f}
          </span>
        ))}
      </div>

      {/* Disabled button */}
      <button
        disabled
        className="w-full py-2.5 px-4 rounded-xl bg-muted bg-opacity-30 text-muted text-sm font-medium cursor-not-allowed border border-border flex items-center justify-center gap-2"
      >
        <span>✨</span>
        <span>AI申し送りを生成する（準備中）</span>
      </button>
    </div>
  )
}
