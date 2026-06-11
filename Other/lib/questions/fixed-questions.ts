// 質問セット v1.0 — Step3 現場ヒアリング確定内容を反映（2026-05-26）

// ─── 入力方式 ────────────────────────────────────────────────────────────────

export type QuestionInputType =
  | "choice"         // 単一選択ボタン
  | "multi-choice"   // 複数選択ボタン
  | "level-selector" // 数値レベル選択チップ（-5〜+5 等）
  | "star-rating"    // 星評価（1〜5）
  | "free-text";     // 自由入力テキスト

// ─── 型定義 ──────────────────────────────────────────────────────────────────

export type QuestionOption = {
  value: string;
  label: string;
};

export type LevelConfig = {
  min: number;
  max: number;
  anchorMin: string; // 最小値のラベル（例：「激細」）
  anchorMid: string; // 中央値のラベル（例：「標準」）
  anchorMax: string; // 最大値のラベル（例：「激太」）
};

export type ConditionalTrigger = {
  questionId: string;
  // "not-value"    : 指定 value 以外が選択されたとき
  // "value"        : 指定 value が選択されたとき
  // "change-gte"   : 前回値からの変化量が threshold 以上のとき
  // "lte"          : 回答値が threshold 以下のとき
  type: "not-value" | "value" | "change-gte" | "lte";
  value?: string;
  threshold?: number;
};

export type Question = {
  id: string;
  prompt: string;
  inputType: QuestionInputType;
  options?: QuestionOption[];
  levelConfig?: LevelConfig;
  allowFreeText?: boolean;
  freeTextPlaceholder?: string;
  fieldPath: string;
  required: boolean;
  condition?: ConditionalTrigger;
};

export type QuestionSection = {
  id: string;
  label: string;
  required: boolean;
  questions: Question[];
};

// ─── A. デザイン調整（必須） ─────────────────────────────────────────────────

const SECTION_A: QuestionSection = {
  id: "A",
  label: "デザイン調整",
  required: true,
  questions: [
    {
      id: "A-1",
      prompt: "希望デザイン",
      inputType: "choice",
      options: [
        { value: "parallel",      label: "平行" },
        { value: "parallel_arch", label: "平行アーチ" },
        { value: "arch",          label: "アーチ" },
        { value: "straight",      label: "ストレート" },
        { value: "natural",       label: "ナチュラル" },
        { value: "korean",        label: "韓国風" },
        { value: "staff_choice",  label: "お任せ" },
      ],
      fieldPath: "designPlan.desiredDesign",
      required: true,
    },
    {
      id: "A-2",
      prompt: "太さ",
      inputType: "level-selector",
      levelConfig: { min: -3, max: 3, anchorMin: "かなり細め", anchorMid: "標準", anchorMax: "かなり太め" },
      fieldPath: "designPlan.thicknessLevel",
      required: true,
    },
    {
      id: "A-4",
      prompt: "濃さ",
      inputType: "level-selector",
      levelConfig: { min: -3, max: 3, anchorMin: "かなり薄め", anchorMid: "標準", anchorMax: "かなり濃い" },
      fieldPath: "designPlan.densityLevel",
      required: true,
    },
    {
      id: "A-X",
      prompt: "大きな変更理由",
      inputType: "multi-choice",
      options: [
        { value: "customer_request", label: "顧客希望" },
        { value: "staff_decision",   label: "スタッフ判断" },
        { value: "fit_adjustment",   label: "似合わせ調整" },
        { value: "other",            label: "その他" },
      ],
      allowFreeText: true,
      freeTextPlaceholder: "理由メモ（任意）",
      fieldPath: "designPlan.changeReason",
      required: false,
      condition: { questionId: "designLargeChange", type: "value", value: "true" },
    },
  ],
};

// ─── B. お客様眉状態（必須） ─────────────────────────────────────────────────

const SECTION_B: QuestionSection = {
  id: "B",
  label: "お客様眉状態",
  required: true,
  questions: [
    {
      id: "B-1",
      prompt: "当日の眉状態",
      inputType: "multi-choice",
      options: [
        { value: "normal",              label: "通常" },
        { value: "grown",               label: "伸びている" },
        { value: "sparse",              label: "まばら" },
        { value: "uneven",              label: "不揃い" },
        { value: "asymmetry_visible",   label: "左右差目立つ" },
      ],
      fieldPath: "todayObservation.browConditionTags",
      required: true,
    },
    {
      id: "B-2",
      prompt: "自己処理の跡",
      inputType: "multi-choice",
      options: [
        { value: "none",          label: "なし" },
        { value: "unknown_area",  label: "あり（場所不明）" },
        { value: "right_below",   label: "右眉下" },
        { value: "left_below",    label: "左眉下" },
        { value: "brow_head",     label: "眉頭" },
        { value: "brow_peak",     label: "眉山" },
        { value: "brow_tail",     label: "眉尻" },
        { value: "all",           label: "全体" },
      ],
      fieldPath: "todayObservation.selfCareImpactArea",
      required: true,
    },
    {
      id: "B-2a",
      prompt: "自己処理の影響レベル",
      inputType: "choice",
      options: [
        { value: "none",     label: "影響なし" },
        { value: "minor",    label: "軽微" },
        { value: "moderate", label: "中程度" },
        { value: "major",    label: "大きい" },
      ],
      fieldPath: "todayObservation.selfCareImpactLevel",
      required: true,
      condition: { questionId: "B-2", type: "not-value", value: "none" },
    },
    {
      id: "B-2b",
      prompt: "仕上がりへの影響メモ",
      inputType: "free-text",
      freeTextPlaceholder: "例：左眉下が薄く自然な仕上がりが難しかった",
      fieldPath: "todayObservation.observationNote",
      required: false,
      condition: { questionId: "B-2a", type: "not-value", value: "none" },
    },
    {
      id: "B-3",
      prompt: "当日の肌状態",
      inputType: "multi-choice",
      options: [
        { value: "ok",      label: "問題なし" },
        { value: "redness", label: "赤み" },
        { value: "dry",     label: "乾燥" },
        { value: "acne",    label: "ニキビ" },
        { value: "wound",   label: "傷" },
        { value: "peeling", label: "皮むけ" },
        { value: "caution", label: "施術注意" },
      ],
      fieldPath: "todayObservation.todaySkinConditionTags",
      required: true,
    },
    {
      id: "B-4",
      prompt: "肌リスクレベル",
      inputType: "multi-choice",
      options: [
        { value: "ok",         label: "問題なし" },
        { value: "caution",    label: "注意" },
        { value: "medication", label: "薬服用" },
      ],
      fieldPath: "todayObservation.todaySkinRiskLevel",
      required: true,
    },
    {
      id: "B-4m",
      prompt: "薬の用途",
      inputType: "multi-choice",
      options: [
        { value: "atopy", label: "アトピー" },
        { value: "acne",  label: "ニキビ用" },
        { value: "other", label: "その他" },
      ],
      allowFreeText: true,
      freeTextPlaceholder: "その他の用途を入力",
      fieldPath: "todayObservation.medicationTags",
      required: true,
      condition: { questionId: "B-4", type: "value", value: "medication" },
    },
    {
      id: "B-4a",
      prompt: "対応方針",
      inputType: "free-text",
      freeTextPlaceholder: "例：ワックスを使わずハサミとコームのみで施術",
      fieldPath: "todayObservation.observationNote",
      required: true,
      condition: { questionId: "B-4", type: "not-value", value: "ok" },
    },
  ],
};

// ─── C. 実施施術内容（必須） ─────────────────────────────────────────────────

const SECTION_C: QuestionSection = {
  id: "C",
  label: "実施施術内容",
  required: true,
  questions: [
    {
      id: "C-0",
      prompt: "お客様の施術方針・こだわり",
      inputType: "choice",
      options: [
        { value: "particular",   label: "こだわり強い" },
        { value: "leave_to_staff", label: "お任せ" },
        { value: "none",         label: "特になし" },
      ],
      fieldPath: "treatmentRecord.customerStance",
      required: false,
    },
    {
      id: "C-1",
      prompt: "施術内容",
      inputType: "multi-choice",
      options: [
        { value: "wax",          label: "ワックス" },
        { value: "thinning",     label: "間引き" },
        { value: "cut",          label: "カット" },
        { value: "tweeze",       label: "毛抜き" },
        { value: "peak_adjust",  label: "眉山調整" },
        { value: "tail_adjust",  label: "眉尻調整" },
        { value: "makeup_finish",label: "メイク仕上げ" },
      ],
      fieldPath: "treatmentRecord.treatmentTags",
      required: true,
    },
    {
      id: "C-2",
      prompt: "右眉 細部施術",
      inputType: "multi-choice",
      options: [
        { value: "head",        label: "眉頭調整" },
        { value: "peak",        label: "眉山調整" },
        { value: "tail",        label: "眉尻調整" },
        { value: "lower_line",  label: "眉下ライン" },
        { value: "upper_line",  label: "眉上ライン" },
        { value: "length_cut",  label: "長さカット" },
      ],
      fieldPath: "treatmentRecord.rightBrowDetails",
      required: false,
    },
    {
      id: "C-3",
      prompt: "左眉 細部施術",
      inputType: "multi-choice",
      options: [
        { value: "head",        label: "眉頭調整" },
        { value: "peak",        label: "眉山調整" },
        { value: "tail",        label: "眉尻調整" },
        { value: "lower_line",  label: "眉下ライン" },
        { value: "upper_line",  label: "眉上ライン" },
        { value: "length_cut",  label: "長さカット" },
      ],
      fieldPath: "treatmentRecord.leftBrowDetails",
      required: false,
    },
    {
      id: "C-4",
      prompt: "施術メモ",
      inputType: "free-text",
      freeTextPlaceholder: "例：右眉山を少し外に出した。左眉尻は控えめに",
      fieldPath: "treatmentRecord.treatmentNote",
      required: false,
    },
    {
      id: "C-0a",
      prompt: "今回とくに確認したこだわり",
      inputType: "free-text",
      freeTextPlaceholder: "例：太さは残す、眉山は強調しない、左右差を目立たせない",
      fieldPath: "treatmentRecord.particularNote",
      required: false,
      condition: { questionId: "C-0", type: "value", value: "particular" },
    },
  ],
};

// ─── E. 申し送り（推奨） ─────────────────────────────────────────────────────

const SECTION_E: QuestionSection = {
  id: "E",
  label: "会話・次回共有",
  required: false,
  questions: [
    {
      id: "E-1",
      prompt: "お客様との会話・次回共有メモ",
      inputType: "free-text",
      freeTextPlaceholder: "例：次回は自然め希望。旅行の話題あり。",
      fieldPath: "handover.handoverText",
      required: false,
    },
    {
      id: "E-2",
      prompt: "スタッフ内部メモ（顧客非公開）",
      inputType: "free-text",
      freeTextPlaceholder: "例：領収書発行あり。",
      fieldPath: "handover.staffEditNote",
      required: false,
    },
  ],
};

// ─── F. お客様情報枠（初回・更新時） ────────────────────────────────────────

export const PROFILE_QUESTIONS: Question[] = [
  {
    id: "F-1",
    prompt: "基本デザインの好み",
    inputType: "choice",
    options: [
      { value: "parallel",      label: "平行" },
      { value: "parallel_arch", label: "平行アーチ" },
      { value: "arch",          label: "アーチ" },
      { value: "straight",      label: "ストレート" },
      { value: "natural",       label: "ナチュラル" },
      { value: "korean",        label: "韓国風" },
      { value: "staff_choice",  label: "お任せ" },
    ],
    fieldPath: "profile.defaultDesign",
    required: false,
  },
  {
    id: "F-2",
    prompt: "太さの基本好み",
    inputType: "level-selector",
      levelConfig: { min: -3, max: 3, anchorMin: "かなり細め", anchorMid: "標準", anchorMax: "かなり太め" },
    fieldPath: "profile.preferredThickness",
    required: false,
  },
  {
    id: "F-4",
    prompt: "濃さの基本好み",
    inputType: "level-selector",
    levelConfig: { min: -3, max: 3, anchorMin: "かなり薄め", anchorMid: "標準", anchorMax: "かなり濃い" },
    fieldPath: "profile.preferredDensity",
    required: false,
  },
  {
    id: "F-5-type",
    prompt: "左右差タイプ",
    inputType: "choice",
    options: [
      { value: "none",           label: "ほぼなし" },
      { value: "right_high",     label: "右眉がやや高い" },
      { value: "left_high",      label: "左眉がやや高い" },
      { value: "right_long",     label: "右眉が長い" },
      { value: "left_long",      label: "左眉が長い" },
      { value: "right_thick",    label: "右眉が太い" },
      { value: "left_thick",     label: "左眉が太い" },
      { value: "right_tail_thin",label: "右眉尻が薄い" },
      { value: "left_tail_thin", label: "左眉尻が薄い" },
    ],
    fieldPath: "profile.asymmetryType",
    required: false,
  },
  {
    id: "F-5-level",
    prompt: "左右差レベル",
    inputType: "choice",
    options: [
      { value: "none",      label: "なし" },
      { value: "minor",     label: "軽微" },
      { value: "moderate",  label: "中程度" },
      { value: "prominent", label: "顕著" },
    ],
    fieldPath: "profile.asymmetryLevel",
    required: false,
  },
  {
    id: "F-6",
    prompt: "毛流れ",
    inputType: "choice",
    options: [
      { value: "left_tail_thin",  label: "左眉尻薄め" },
      { value: "right_tail_thin", label: "右眉尻薄め" },
      { value: "head_strong",     label: "眉頭毛流れ強め" },
      { value: "below_thin",      label: "眉下薄め" },
      { value: "center_gap",      label: "中央欠け" },
      { value: "no_change",       label: "変化なし" },
    ],
    allowFreeText: true,
    fieldPath: "profile.hairFlowNotes",
    required: false,
  },
  {
    id: "F-7",
    prompt: "薄い箇所",
    inputType: "free-text",
    freeTextPlaceholder: "例：右眉尻、左眉中央",
    fieldPath: "profile.sparseAreaNotes",
    required: false,
  },
  {
    id: "F-8",
    prompt: "肌リスクプロフィール",
    inputType: "choice",
    options: [
      { value: "none",          label: "特になし" },
      { value: "redness_prone", label: "赤みが出やすい" },
      { value: "dry_prone",     label: "乾燥しやすい" },
      { value: "wax_redness",   label: "ワックス後赤み" },
      { value: "acne_prone",    label: "ニキビができやすい" },
      { value: "sensitive",     label: "敏感肌" },
      { value: "peeling_prone", label: "皮むけしやすい" },
    ],
    allowFreeText: true,
    fieldPath: "profile.skinRiskProfile",
    required: false,
  },
  {
    id: "F-9",
    prompt: "NG事項",
    inputType: "multi-choice",
    options: [
      { value: "too_thin_ng",            label: "細すぎNG" },
      { value: "too_thick_ng",           label: "太すぎNG" },
      { value: "too_dark_ng",            label: "濃すぎNG" },
      { value: "peak_emphasis_ng",       label: "眉山強調NG" },
      { value: "no_asymmetry_emphasis",  label: "左右差を強調しない" },
      { value: "thin_ng",                label: "細めNG" },
    ],
    fieldPath: "profile.ngPoints",
    required: false,
  },
  {
    id: "F-10",
    prompt: "自己処理の癖・傾向",
    inputType: "free-text",
    freeTextPlaceholder: "例：眉下を自分で抜く癖がある。眉頭を触りがち",
    fieldPath: "profile.selfCareHabitNotes",
    required: false,
  },
];

// ─── エクスポート ─────────────────────────────────────────────────────────────

export const QUESTION_SECTIONS: QuestionSection[] = [
  SECTION_A,
  SECTION_B,
  SECTION_C,
  SECTION_E,
];

export const ALL_QUESTIONS: Question[] = QUESTION_SECTIONS.flatMap((s) => s.questions);
