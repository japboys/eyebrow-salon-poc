// 質問セット v1.0 — Step3 現場ヒアリング確定内容を反映（2026-05-26）

export type QuestionInputType =
  | 'choice'
  | 'multi-choice'
  | 'level-selector'
  | 'star-rating'
  | 'free-text'

export type QuestionOption = {
  value: string
  label: string
}

export type LevelConfig = {
  min: number
  max: number
  anchorMin: string
  anchorMid: string
  anchorMax: string
}

export type ConditionalTrigger = {
  questionId: string
  type: 'not-value' | 'value' | 'change-gte' | 'lte'
  value?: string
  threshold?: number
}

export type Question = {
  id: string
  prompt: string
  inputType: QuestionInputType
  options?: QuestionOption[]
  levelConfig?: LevelConfig
  allowFreeText?: boolean
  freeTextPlaceholder?: string
  fieldPath: string
  required: boolean
  condition?: ConditionalTrigger
}

export type QuestionSection = {
  id: string
  label: string
  required: boolean
  questions: Question[]
}

// ─── A. デザイン調整（必須） ─────────────────────────────────────────────────

const SECTION_A: QuestionSection = {
  id: 'A',
  label: 'デザイン調整',
  required: true,
  questions: [
    {
      id: 'A-1',
      prompt: '希望デザイン',
      inputType: 'choice',
      options: [
        { value: 'parallel', label: '平行' },
        { value: 'parallel_arch', label: '平行アーチ' },
        { value: 'arch', label: 'アーチ' },
        { value: 'straight', label: 'ストレート' },
        { value: 'natural', label: 'ナチュラル' },
        { value: 'korean', label: '韓国風' },
        { value: 'staff_choice', label: 'お任せ' },
      ],
      fieldPath: 'designPlan.desiredDesign',
      required: true,
    },
    {
      id: 'A-2',
      prompt: '太さ',
      inputType: 'level-selector',
      levelConfig: { min: -5, max: 5, anchorMin: '激細', anchorMid: '標準', anchorMax: '激太' },
      fieldPath: 'designPlan.thicknessLevel',
      required: true,
    },
    {
      id: 'A-2a',
      prompt: '太さ変更の理由',
      inputType: 'multi-choice',
      options: [
        { value: 'customer_request', label: '顧客希望' },
        { value: 'staff_decision', label: 'スタッフ判断' },
        { value: 'seasonal', label: '季節の変化' },
        { value: 'trend', label: 'トレンド' },
        { value: 'lifestyle', label: 'ライフスタイル変化' },
      ],
      allowFreeText: true,
      freeTextPlaceholder: '詳細メモ（任意）',
      fieldPath: 'designPlan.changeReason',
      required: false,
      condition: { questionId: 'A-2', type: 'change-gte', threshold: 2 },
    },
    {
      id: 'A-3',
      prompt: '角度',
      inputType: 'level-selector',
      levelConfig: { min: -5, max: 5, anchorMin: 'たれ眉', anchorMid: '平行', anchorMax: 'つり眉' },
      fieldPath: 'designPlan.angleLevel',
      required: true,
    },
    {
      id: 'A-3a',
      prompt: '角度変更の理由',
      inputType: 'multi-choice',
      options: [
        { value: 'customer_request', label: '顧客希望' },
        { value: 'staff_decision', label: 'スタッフ判断' },
        { value: 'seasonal', label: '季節の変化' },
        { value: 'trend', label: 'トレンド' },
        { value: 'lifestyle', label: 'ライフスタイル変化' },
      ],
      fieldPath: 'designPlan.changeReason',
      required: false,
      condition: { questionId: 'A-3', type: 'change-gte', threshold: 2 },
    },
    {
      id: 'A-4',
      prompt: '濃さ',
      inputType: 'level-selector',
      levelConfig: { min: -3, max: 3, anchorMin: 'かなり薄め', anchorMid: '標準', anchorMax: 'かなり濃い' },
      fieldPath: 'designPlan.densityLevel',
      required: true,
    },
    {
      id: 'A-4a',
      prompt: '濃さ変更の理由',
      inputType: 'multi-choice',
      options: [
        { value: 'customer_request', label: '顧客希望' },
        { value: 'staff_decision', label: 'スタッフ判断' },
        { value: 'seasonal', label: '季節の変化' },
        { value: 'trend', label: 'トレンド' },
        { value: 'lifestyle', label: 'ライフスタイル変化' },
      ],
      fieldPath: 'designPlan.changeReason',
      required: false,
      condition: { questionId: 'A-4', type: 'change-gte', threshold: 2 },
    },
    {
      id: 'A-0a',
      prompt: '全体変更の理由',
      inputType: 'multi-choice',
      options: [
        { value: 'first_visit', label: '初回' },
        { value: 'change_mood', label: '雰囲気を変えたい' },
        { value: 'reset', label: 'デザインをリセット' },
        { value: 'major_change', label: '大きなイメージチェンジ' },
      ],
      fieldPath: 'designPlan.majorChangeReason',
      required: false,
      condition: { questionId: 'visitPolicy', type: 'value', value: 'major_change' },
    },
  ],
}

// ─── B. お客様眉状態（必須） ─────────────────────────────────────────────────

const SECTION_B: QuestionSection = {
  id: 'B',
  label: 'お客様眉状態',
  required: true,
  questions: [
    {
      id: 'B-1',
      prompt: '当日の眉状態',
      inputType: 'multi-choice',
      options: [
        { value: 'normal', label: '通常' },
        { value: 'grown', label: '伸びている' },
        { value: 'sparse', label: 'まばら' },
        { value: 'uneven', label: '不揃い' },
        { value: 'asymmetry_visible', label: '左右差目立つ' },
      ],
      fieldPath: 'todayObservation.browConditionTags',
      required: true,
    },
    {
      id: 'B-2',
      prompt: '自己処理の跡',
      inputType: 'multi-choice',
      options: [
        { value: 'none', label: 'なし' },
        { value: 'unknown_area', label: 'あり（場所不明）' },
        { value: 'right_below', label: '右眉下' },
        { value: 'left_below', label: '左眉下' },
        { value: 'brow_head', label: '眉頭' },
        { value: 'brow_peak', label: '眉山' },
        { value: 'brow_tail', label: '眉尻' },
        { value: 'all', label: '全体' },
      ],
      fieldPath: 'todayObservation.selfCareImpactArea',
      required: true,
    },
    {
      id: 'B-2a',
      prompt: '自己処理の影響レベル',
      inputType: 'choice',
      options: [
        { value: 'none', label: '影響なし' },
        { value: 'minor', label: '軽微' },
        { value: 'moderate', label: '中程度' },
        { value: 'major', label: '大きい' },
      ],
      fieldPath: 'todayObservation.selfCareImpactLevel',
      required: true,
      condition: { questionId: 'B-2', type: 'not-value', value: 'none' },
    },
    {
      id: 'B-2b',
      prompt: '仕上がりへの影響メモ',
      inputType: 'free-text',
      freeTextPlaceholder: '例：左眉下が薄く自然な仕上がりが難しかった',
      fieldPath: 'todayObservation.observationNote',
      required: false,
      condition: { questionId: 'B-2a', type: 'not-value', value: 'none' },
    },
    {
      id: 'B-3',
      prompt: '当日の肌状態',
      inputType: 'multi-choice',
      options: [
        { value: 'ok', label: '問題なし' },
        { value: 'redness', label: '赤み' },
        { value: 'dry', label: '乾燥' },
        { value: 'acne', label: 'ニキビ' },
        { value: 'wound', label: '傷' },
        { value: 'peeling', label: '皮むけ' },
        { value: 'caution', label: '施術注意' },
      ],
      fieldPath: 'todayObservation.todaySkinConditionTags',
      required: true,
    },
    {
      id: 'B-4',
      prompt: '肌リスクレベル',
      inputType: 'multi-choice',
      options: [
        { value: 'ok', label: '問題なし' },
        { value: 'low', label: '低リスク' },
        { value: 'caution', label: '注意' },
        { value: 'high', label: '高リスク' },
      ],
      fieldPath: 'todayObservation.todaySkinRiskLevel',
      required: true,
    },
    {
      id: 'B-4a',
      prompt: '対応方針',
      inputType: 'free-text',
      freeTextPlaceholder: '例：ワックスを使わずハサミとコームのみで施術',
      fieldPath: 'todayObservation.observationNote',
      required: true,
      condition: { questionId: 'B-4', type: 'not-value', value: 'ok' },
    },
  ],
}

// ─── C. 実施施術内容（必須） ─────────────────────────────────────────────────

const SECTION_C: QuestionSection = {
  id: 'C',
  label: '実施施術内容',
  required: true,
  questions: [
    {
      id: 'C-1',
      prompt: '施術内容',
      inputType: 'multi-choice',
      options: [
        { value: 'wax', label: 'ワックス' },
        { value: 'thinning', label: '間引き' },
        { value: 'cut', label: 'カット' },
        { value: 'tweeze', label: '毛抜き' },
        { value: 'peak_adjust', label: '眉山調整' },
        { value: 'tail_adjust', label: '眉尻調整' },
        { value: 'makeup_finish', label: 'メイク仕上げ' },
      ],
      fieldPath: 'treatmentRecord.treatmentTags',
      required: true,
    },
    {
      id: 'C-2',
      prompt: '右眉 細部施術',
      inputType: 'multi-choice',
      options: [
        { value: 'head', label: '眉頭調整' },
        { value: 'peak', label: '眉山調整' },
        { value: 'tail', label: '眉尻調整' },
        { value: 'lower_line', label: '眉下ライン' },
        { value: 'upper_line', label: '眉上ライン' },
        { value: 'length_cut', label: '長さカット' },
      ],
      fieldPath: 'treatmentRecord.rightBrowDetails',
      required: false,
    },
    {
      id: 'C-3',
      prompt: '左眉 細部施術',
      inputType: 'multi-choice',
      options: [
        { value: 'head', label: '眉頭調整' },
        { value: 'peak', label: '眉山調整' },
        { value: 'tail', label: '眉尻調整' },
        { value: 'lower_line', label: '眉下ライン' },
        { value: 'upper_line', label: '眉上ライン' },
        { value: 'length_cut', label: '長さカット' },
      ],
      fieldPath: 'treatmentRecord.leftBrowDetails',
      required: false,
    },
    {
      id: 'C-4',
      prompt: '施術メモ',
      inputType: 'free-text',
      freeTextPlaceholder: '例：右眉山を少し外に出した。左眉尻は控えめに',
      fieldPath: 'treatmentRecord.treatmentNote',
      required: false,
    },
  ],
}

// ─── D. 仕上がり反応（必須） ─────────────────────────────────────────────────

const SECTION_D: QuestionSection = {
  id: 'D',
  label: '仕上がり反応',
  required: true,
  questions: [
    {
      id: 'D-1',
      prompt: '満足度',
      inputType: 'star-rating',
      fieldPath: 'reaction.satisfactionLevel',
      required: true,
    },
    {
      id: 'D-1a',
      prompt: '不満点の記録',
      inputType: 'multi-choice',
      options: [
        { value: 'dislike_result', label: '仕上がりが気に入らない' },
        { value: 'wrong_thickness', label: '太さが違う' },
        { value: 'wrong_angle', label: '角度が違う' },
        { value: 'wrong_density', label: '濃さが違う' },
        { value: 'asymmetry', label: '左右差が気になる' },
        { value: 'pain', label: '痛みがあった' },
      ],
      fieldPath: 'reaction.dissatisfactionTags',
      required: false,
      condition: { questionId: 'D-1', type: 'lte', threshold: 2 },
    },
    {
      id: 'D-2',
      prompt: '反応タグ',
      inputType: 'multi-choice',
      options: [
        { value: 'satisfied', label: '満足' },
        { value: 'very_satisfied', label: 'とても満足' },
        { value: 'natural_good', label: 'ナチュラル仕上げ良い' },
        { value: 'natural_result', label: '自然な仕上がり' },
        { value: 'korean_good', label: '韓国風が気に入っている' },
        { value: 'first_satisfied', label: '初めてで満足' },
      ],
      fieldPath: 'reaction.reactionTags',
      required: false,
    },
    {
      id: 'D-3',
      prompt: '懸念タグ',
      inputType: 'multi-choice',
      options: [
        { value: 'slightly_thin', label: '少し薄かったかも' },
        { value: 'right_tail_thin', label: '右眉尻が少し薄い' },
        { value: 'asymmetry_concern', label: '左右差が気になる' },
        { value: 'slightly_thick', label: '少し太かった' },
        { value: 'density_concern', label: '濃さが気になる' },
      ],
      fieldPath: 'reaction.concernTags',
      required: false,
    },
    {
      id: 'D-4',
      prompt: '次回へのご要望',
      inputType: 'free-text',
      freeTextPlaceholder: '例：次回はもう少し細めに。左眉は今日より太めで',
      fieldPath: 'reaction.nextTimeCustomerRequest',
      required: false,
    },
  ],
}

// ─── E. 申し送り（推奨） ─────────────────────────────────────────────────────

const SECTION_E: QuestionSection = {
  id: 'E',
  label: '申し送り',
  required: false,
  questions: [
    {
      id: 'E-1',
      prompt: 'お客様との会話・次回共有メモ',
      inputType: 'free-text',
      freeTextPlaceholder: '例：次回は自然め希望。旅行の話題あり。',
      fieldPath: 'handover.handoverText',
      required: false,
    },
    {
      id: 'E-2',
      prompt: 'スタッフ内部メモ（顧客非公開）',
      inputType: 'free-text',
      freeTextPlaceholder: '例：領収書発行あり。',
      fieldPath: 'handover.staffEditNote',
      required: false,
    },
  ],
}

// ─── エクスポート ─────────────────────────────────────────────────────────────

export const QUESTION_SECTIONS: QuestionSection[] = [
  SECTION_A,
  SECTION_B,
  SECTION_C,
  SECTION_D,
  SECTION_E,
]

export const ALL_QUESTIONS: Question[] = QUESTION_SECTIONS.flatMap(s => s.questions)
