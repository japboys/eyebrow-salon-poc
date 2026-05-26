import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.visitRecord.deleteMany()
  await prisma.customerProfile.deleteMany()
  await prisma.customer.deleteMany()

  // ─────────────────────────────────────────
  // CUST001: 佐藤 美咲（3回来店）
  // ─────────────────────────────────────────
  await prisma.customer.create({
    data: {
      id: 'CUST001',
      name: '佐藤 美咲',
      nameKana: 'さとう みさき',
      visitCount: 3,
      lastVisitDate: new Date('2025-04-15'),
      notes: '左眉下を削りすぎ注意',
      profile: {
        create: {
          defaultDesign: '平行ナチュラル',
          preferredThickness: -2,
          preferredAngle: -3,
          preferredDensity: 0,
          asymmetryType: '右眉がやや高い',
          asymmetryLevel: 2,
          hairFlowNotes: '左眉尻が薄め',
          sparseAreaNotes: '左眉尻',
          skinRiskProfile: '赤みが出やすい',
          ngPoints: JSON.stringify(['細すぎ', '角度強め']),
          selfCareHabitNotes: '特になし',
          generalHandoverNotes: '左眉下を削りすぎ注意。平行寄りを維持。',
        },
      },
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST001-001',
      customerId: 'CUST001',
      visitNumber: 1,
      visitDate: new Date('2025-01-10'),
      previousTreatmentId: null,
      visitType: 'first_visit',
      visitPolicy: 'major_change',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({ desiredDesign: 'ナチュラル', thicknessLevel: -3, angleLevel: -3, densityLevel: 0, changeReason: [], majorChangeReason: ['初回'], customerRequestNote: '自然な眉にしたい' }),
      todayObservation: JSON.stringify({ browConditionTags: ['初回'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['問題なし'], todaySkinRiskLevel: 0, observationNote: '初回カウンセリング済み。右眉がやや高め。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['ワックス', 'カット'], rightBrowTreatmentTags: ['眉山調整'], leftBrowTreatmentTags: ['眉尻調整'], treatmentNote: '初回施術。形を整えた。' }),
      reaction: JSON.stringify({ satisfactionLevel: 4, reactionTags: ['初めてで満足', 'ナチュラル仕上げ良い'], concernTags: [], nextTimeCustomerRequest: '次はもう少し平行に近づけたい' }),
      handover: JSON.stringify({ handoverText: '初回。次回は平行ナチュラルを目指す。左眉下の削りすぎに注意。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '初回カウンセリング済み。右眉がやや高め。',
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST001-002',
      customerId: 'CUST001',
      visitNumber: 2,
      visitDate: new Date('2025-02-25'),
      previousTreatmentId: 'CUST001-001',
      visitType: 'repeat_visit',
      visitPolicy: 'partial_change',
      changedFields: JSON.stringify(['thicknessLevel']),
      designPlan: JSON.stringify({ desiredDesign: '平行ナチュラル', thicknessLevel: -2, angleLevel: -3, densityLevel: 0, changeReason: ['顧客希望'], majorChangeReason: [], customerRequestNote: '少し太めにしてみたい' }),
      todayObservation: JSON.stringify({ browConditionTags: ['通常', '伸びている'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['赤み'], todaySkinRiskLevel: 1, observationNote: '前回より毛量が戻っている。赤みが出やすい。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['ワックス', '間引き'], rightBrowTreatmentTags: ['眉山調整', '眉尻調整'], leftBrowTreatmentTags: ['眉尻調整', '眉下ライン'], treatmentNote: '太さを1段階太めに調整。左眉下は慎重に施術。' }),
      reaction: JSON.stringify({ satisfactionLevel: 4, reactionTags: ['ナチュラル仕上げ良い', '自然な仕上がり'], concernTags: ['少し薄かったかも'], nextTimeCustomerRequest: 'この感じを維持して' }),
      handover: JSON.stringify({ handoverText: '平行ナチュラルを継続。左眉下の削りすぎ注意。前回より太さ+1。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '前回より毛量が戻っている。赤みが出やすい。',
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST001-003',
      customerId: 'CUST001',
      visitNumber: 3,
      visitDate: new Date('2025-04-15'),
      previousTreatmentId: 'CUST001-002',
      visitType: 'repeat_visit',
      visitPolicy: 'same_as_previous',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({ desiredDesign: '平行ナチュラル', thicknessLevel: -2, angleLevel: -3, densityLevel: 0, changeReason: [], majorChangeReason: [], customerRequestNote: '前回と同じ仕上がりで' }),
      todayObservation: JSON.stringify({ browConditionTags: ['通常'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['問題なし'], todaySkinRiskLevel: 0, observationNote: '肌状態良好。前回と同様。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['ワックス', '間引き'], rightBrowTreatmentTags: ['眉尻調整'], leftBrowTreatmentTags: ['眉尻調整', '眉下ライン'], treatmentNote: '左眉下は慎重に施術' }),
      reaction: JSON.stringify({ satisfactionLevel: 5, reactionTags: ['満足', 'ナチュラル仕上げ良い'], concernTags: [], nextTimeCustomerRequest: '次も同じ感じで' }),
      handover: JSON.stringify({ handoverText: '左眉下を削りすぎ注意。平行寄りを維持。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '肌状態良好。前回と同様。',
    },
  })

  // ─────────────────────────────────────────
  // CUST002: 田中 彩花（2回来店）
  // ─────────────────────────────────────────
  await prisma.customer.create({
    data: {
      id: 'CUST002',
      name: '田中 彩花',
      nameKana: 'たなか あやか',
      visitCount: 2,
      lastVisitDate: new Date('2025-04-20'),
      notes: '濃さは自然寄り',
      profile: {
        create: {
          defaultDesign: 'アーチナチュラル',
          preferredThickness: 0,
          preferredAngle: 1,
          preferredDensity: -1,
          asymmetryType: '左眉がやや薄い',
          asymmetryLevel: 1,
          hairFlowNotes: '眉頭の毛流れ強め',
          sparseAreaNotes: '左眉全体',
          skinRiskProfile: '乾燥しやすい',
          ngPoints: JSON.stringify(['濃すぎ']),
          selfCareHabitNotes: '特になし',
          generalHandoverNotes: '濃さは自然寄り。眉頭を作り込みすぎない。',
        },
      },
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST002-001',
      customerId: 'CUST002',
      visitNumber: 1,
      visitDate: new Date('2025-02-05'),
      previousTreatmentId: null,
      visitType: 'first_visit',
      visitPolicy: 'major_change',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({ desiredDesign: 'アーチ', thicknessLevel: 0, angleLevel: 1, densityLevel: -2, changeReason: [], majorChangeReason: ['初回'], customerRequestNote: '自然なアーチ眉にしたい' }),
      todayObservation: JSON.stringify({ browConditionTags: ['初回', 'まばら'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['乾燥'], todaySkinRiskLevel: 1, observationNote: '初回。眉頭の毛流れが強い。乾燥気味。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['ワックス', 'カット', '間引き'], rightBrowTreatmentTags: ['眉頭調整', '眉山調整'], leftBrowTreatmentTags: ['眉頭調整'], treatmentNote: '眉頭の毛流れを整えた。自然なアーチに。' }),
      reaction: JSON.stringify({ satisfactionLevel: 4, reactionTags: ['自然な仕上がり', '初めてで満足'], concernTags: [], nextTimeCustomerRequest: '少しナチュラルよりにしてもいいかも' }),
      handover: JSON.stringify({ handoverText: '眉頭を作り込みすぎない。アーチは控えめに。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '初回。眉頭の毛流れが強い。乾燥気味。',
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST002-002',
      customerId: 'CUST002',
      visitNumber: 2,
      visitDate: new Date('2025-04-20'),
      previousTreatmentId: 'CUST002-001',
      visitType: 'repeat_visit',
      visitPolicy: 'partial_change',
      changedFields: JSON.stringify(['desiredDesign', 'thicknessLevel', 'densityLevel']),
      designPlan: JSON.stringify({ desiredDesign: 'アーチナチュラル', thicknessLevel: 1, angleLevel: 1, densityLevel: -1, changeReason: ['顧客希望'], majorChangeReason: [], customerRequestNote: '少し太めに。自然な感じで' }),
      todayObservation: JSON.stringify({ browConditionTags: ['通常'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['乾燥'], todaySkinRiskLevel: 1, observationNote: '前回より乾燥あり。保湿注意。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['ワックス', '間引き'], rightBrowTreatmentTags: ['眉頭調整', '眉山調整'], leftBrowTreatmentTags: ['眉頭調整'], treatmentNote: '眉頭を作り込みすぎないよう注意。少し太めに調整。' }),
      reaction: JSON.stringify({ satisfactionLevel: 4, reactionTags: ['自然な仕上がり良い'], concernTags: ['少し薄かったかも'], nextTimeCustomerRequest: '次回も同じくらいで' }),
      handover: JSON.stringify({ handoverText: '濃さは自然寄り。眉頭を作り込みすぎない。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '前回より乾燥あり。保湿注意。',
    },
  })

  // ─────────────────────────────────────────
  // CUST003: 鈴木 里奈（初回客）
  // ─────────────────────────────────────────
  await prisma.customer.create({
    data: {
      id: 'CUST003',
      name: '鈴木 里奈',
      nameKana: 'すずき りな',
      visitCount: 1,
      lastVisitDate: new Date('2025-05-01'),
      notes: '初回のため好みを確認',
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST003-001',
      customerId: 'CUST003',
      visitNumber: 1,
      visitDate: new Date('2025-05-01'),
      previousTreatmentId: null,
      visitType: 'first_visit',
      visitPolicy: 'major_change',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({ desiredDesign: 'ナチュラル', thicknessLevel: 0, angleLevel: 0, densityLevel: 0, changeReason: [], majorChangeReason: ['初回'], customerRequestNote: '自然な形にしたい' }),
      todayObservation: JSON.stringify({ browConditionTags: ['初回'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['問題なし'], todaySkinRiskLevel: 0, observationNote: '初回カウンセリング済み' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['ワックス', 'カット'], rightBrowTreatmentTags: [], leftBrowTreatmentTags: [], treatmentNote: '初回施術、形づくり' }),
      reaction: JSON.stringify({ satisfactionLevel: 4, reactionTags: ['初めてで満足'], concernTags: [], nextTimeCustomerRequest: '次回も同じくらいの仕上がりで' }),
      handover: JSON.stringify({ handoverText: '初回のため好みを確認しながら施術。次回は少し好みを聞く。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '初回カウンセリング済み',
    },
  })

  // ─────────────────────────────────────────
  // CUST004: 高橋 由衣（5回来店）
  // ─────────────────────────────────────────
  await prisma.customer.create({
    data: {
      id: 'CUST004',
      name: '高橋 由衣',
      nameKana: 'たかはし ゆい',
      visitCount: 5,
      lastVisitDate: new Date('2025-03-25'),
      notes: '太さを残す。濃さは少し間引きで調整。',
      profile: {
        create: {
          defaultDesign: '韓国風平行',
          preferredThickness: 1,
          preferredAngle: -4,
          preferredDensity: 1,
          asymmetryType: 'ほぼなし',
          asymmetryLevel: 0,
          hairFlowNotes: '全体的に整いやすい',
          sparseAreaNotes: '特になし',
          skinRiskProfile: '特になし',
          ngPoints: JSON.stringify(['細めNG']),
          selfCareHabitNotes: '特になし',
          generalHandoverNotes: '太さを残す。濃さは少し間引きで調整。',
        },
      },
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST004-001',
      customerId: 'CUST004',
      visitNumber: 1,
      visitDate: new Date('2024-10-15'),
      previousTreatmentId: null,
      visitType: 'first_visit',
      visitPolicy: 'major_change',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({ desiredDesign: '平行', thicknessLevel: 2, angleLevel: -4, densityLevel: 2, changeReason: [], majorChangeReason: ['初回'], customerRequestNote: '韓国っぽい太め平行眉にしたい' }),
      todayObservation: JSON.stringify({ browConditionTags: ['初回'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['問題なし'], todaySkinRiskLevel: 0, observationNote: '初回。もともと眉が整いやすい。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['ワックス', 'カット', '間引き'], rightBrowTreatmentTags: ['眉山調整', '眉尻調整'], leftBrowTreatmentTags: ['眉山調整', '眉尻調整'], treatmentNote: '太め平行を意識して形成。' }),
      reaction: JSON.stringify({ satisfactionLevel: 4, reactionTags: ['満足', '韓国風が気に入っている'], concernTags: [], nextTimeCustomerRequest: 'もっと太めにしてもいいかも' }),
      handover: JSON.stringify({ handoverText: '太め平行。細めはNG。次回は韓国風平行をさらに強調。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '初回。もともと眉が整いやすい。',
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST004-002',
      customerId: 'CUST004',
      visitNumber: 2,
      visitDate: new Date('2024-12-01'),
      previousTreatmentId: 'CUST004-001',
      visitType: 'repeat_visit',
      visitPolicy: 'partial_change',
      changedFields: JSON.stringify(['desiredDesign', 'angleLevel', 'densityLevel']),
      designPlan: JSON.stringify({ desiredDesign: '韓国風平行', thicknessLevel: 2, angleLevel: -5, densityLevel: 2, changeReason: ['顧客希望'], majorChangeReason: [], customerRequestNote: 'より韓国風に。角度をもっと水平に' }),
      todayObservation: JSON.stringify({ browConditionTags: ['通常'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['問題なし'], todaySkinRiskLevel: 0, observationNote: '状態良好。前回よりさらに太め希望。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['間引き', 'カット'], rightBrowTreatmentTags: ['眉山調整', '眉尻調整'], leftBrowTreatmentTags: ['眉山調整', '眉尻調整'], treatmentNote: '角度を水平に近づけた。' }),
      reaction: JSON.stringify({ satisfactionLevel: 5, reactionTags: ['とても満足', '韓国風が気に入っている'], concernTags: [], nextTimeCustomerRequest: 'この感じをキープ' }),
      handover: JSON.stringify({ handoverText: '韓国風平行をキープ。太さ残す。細めNG。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '状態良好。前回よりさらに太め希望。',
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST004-003',
      customerId: 'CUST004',
      visitNumber: 3,
      visitDate: new Date('2025-01-20'),
      previousTreatmentId: 'CUST004-002',
      visitType: 'repeat_visit',
      visitPolicy: 'partial_change',
      changedFields: JSON.stringify(['thicknessLevel']),
      designPlan: JSON.stringify({ desiredDesign: '韓国風平行', thicknessLevel: 1, angleLevel: -5, densityLevel: 2, changeReason: ['スタッフ判断'], majorChangeReason: [], customerRequestNote: 'スタッフにお任せ' }),
      todayObservation: JSON.stringify({ browConditionTags: ['通常', '不揃い'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['問題なし'], todaySkinRiskLevel: 0, observationNote: '毛が伸びて不揃い。整えた。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['間引き', 'カット'], rightBrowTreatmentTags: ['眉山調整'], leftBrowTreatmentTags: ['眉山調整'], treatmentNote: '太さを少し整えた。' }),
      reaction: JSON.stringify({ satisfactionLevel: 5, reactionTags: ['とても満足'], concernTags: [], nextTimeCustomerRequest: '次もこの感じで' }),
      handover: JSON.stringify({ handoverText: '太さを残す。濃さは少し間引きで調整。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '毛が伸びて不揃い。整えた。',
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST004-004',
      customerId: 'CUST004',
      visitNumber: 4,
      visitDate: new Date('2025-02-25'),
      previousTreatmentId: 'CUST004-003',
      visitType: 'repeat_visit',
      visitPolicy: 'same_as_previous',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({ desiredDesign: '韓国風平行', thicknessLevel: 1, angleLevel: -4, densityLevel: 1, changeReason: [], majorChangeReason: [], customerRequestNote: '前回と同じ感じで' }),
      todayObservation: JSON.stringify({ browConditionTags: ['通常'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['問題なし'], todaySkinRiskLevel: 0, observationNote: '状態良好。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['間引き', 'カット'], rightBrowTreatmentTags: [], leftBrowTreatmentTags: [], treatmentNote: '太さ残しつつ濃さを整える' }),
      reaction: JSON.stringify({ satisfactionLevel: 4, reactionTags: ['韓国風が気に入っている'], concernTags: [], nextTimeCustomerRequest: '次もこの感じで' }),
      handover: JSON.stringify({ handoverText: '太さを残す。濃さは少し間引きで調整。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '状態良好。',
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST004-005',
      customerId: 'CUST004',
      visitNumber: 5,
      visitDate: new Date('2025-03-25'),
      previousTreatmentId: 'CUST004-004',
      visitType: 'repeat_visit',
      visitPolicy: 'same_as_previous',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({ desiredDesign: '韓国風平行', thicknessLevel: 1, angleLevel: -4, densityLevel: 1, changeReason: [], majorChangeReason: [], customerRequestNote: '太めの韓国風をキープ' }),
      todayObservation: JSON.stringify({ browConditionTags: ['通常'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['問題なし'], todaySkinRiskLevel: 0, observationNote: '状態良好' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['間引き', 'カット'], rightBrowTreatmentTags: [], leftBrowTreatmentTags: [], treatmentNote: '太さ残しつつ濃さを整える' }),
      reaction: JSON.stringify({ satisfactionLevel: 5, reactionTags: ['とても満足', '韓国風が気に入っている'], concernTags: [], nextTimeCustomerRequest: '次もこの感じで' }),
      handover: JSON.stringify({ handoverText: '太さを残す。濃さは少し間引きで調整。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '状態良好',
    },
  })

  // ─────────────────────────────────────────
  // CUST005: 中村 花（4回来店）
  // ─────────────────────────────────────────
  await prisma.customer.create({
    data: {
      id: 'CUST005',
      name: '中村 花',
      nameKana: 'なかむら はな',
      visitCount: 4,
      lastVisitDate: new Date('2025-04-05'),
      notes: '右眉尻はメイク補正前提。角度をつけすぎない。',
      profile: {
        create: {
          defaultDesign: 'ストレートナチュラル',
          preferredThickness: 0,
          preferredAngle: 0,
          preferredDensity: -2,
          asymmetryType: '右眉尻が薄い',
          asymmetryLevel: 2,
          hairFlowNotes: '右眉尻が薄い',
          sparseAreaNotes: '右眉尻',
          skinRiskProfile: 'ワックス後に赤みが出やすい',
          ngPoints: JSON.stringify(['眉山を強く出すこと']),
          selfCareHabitNotes: '特になし',
          generalHandoverNotes: '右眉尻はメイク補正前提。角度をつけすぎない。',
        },
      },
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST005-001',
      customerId: 'CUST005',
      visitNumber: 1,
      visitDate: new Date('2024-12-10'),
      previousTreatmentId: null,
      visitType: 'first_visit',
      visitPolicy: 'major_change',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({ desiredDesign: 'ストレート', thicknessLevel: -1, angleLevel: 0, densityLevel: -2, changeReason: [], majorChangeReason: ['初回'], customerRequestNote: 'すっきりしたストレート眉にしたい' }),
      todayObservation: JSON.stringify({ browConditionTags: ['初回', 'まばら'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['赤み注意'], todaySkinRiskLevel: 2, observationNote: '初回。右眉尻が薄い。ワックス後に赤みが出た。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['ワックス', '間引き'], rightBrowTreatmentTags: ['眉尻調整', '眉山調整'], leftBrowTreatmentTags: ['眉山調整'], treatmentNote: 'ワックス後の赤みケアあり。右眉尻はメイク補正前提。' }),
      reaction: JSON.stringify({ satisfactionLevel: 3, reactionTags: ['自然な仕上がり'], concernTags: ['右眉尻が少し薄い'], nextTimeCustomerRequest: '右眉尻もう少し何とかなる？' }),
      handover: JSON.stringify({ handoverText: '右眉尻はメイク補正前提。ワックス後赤みが出やすい。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '初回。右眉尻が薄い。ワックス後に赤みが出た。',
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST005-002',
      customerId: 'CUST005',
      visitNumber: 2,
      visitDate: new Date('2025-01-25'),
      previousTreatmentId: 'CUST005-001',
      visitType: 'repeat_visit',
      visitPolicy: 'partial_change',
      changedFields: JSON.stringify(['desiredDesign']),
      designPlan: JSON.stringify({ desiredDesign: 'ストレートナチュラル', thicknessLevel: -1, angleLevel: 0, densityLevel: -2, changeReason: ['顧客希望'], majorChangeReason: [], customerRequestNote: 'もう少し自然な感じに' }),
      todayObservation: JSON.stringify({ browConditionTags: ['通常'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['赤み注意'], todaySkinRiskLevel: 2, observationNote: 'ワックス後赤みが出やすい。前回同様の注意が必要。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['ワックス', '間引き'], rightBrowTreatmentTags: ['眉尻調整'], leftBrowTreatmentTags: [], treatmentNote: 'ワックス後の赤みケアあり' }),
      reaction: JSON.stringify({ satisfactionLevel: 4, reactionTags: ['自然な仕上がり'], concernTags: ['右眉尻が少し薄い'], nextTimeCustomerRequest: '右眉尻もう少し何とかなる？' }),
      handover: JSON.stringify({ handoverText: '右眉尻はメイク補正前提。角度をつけすぎない。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: 'ワックス後赤みが出やすい。前回同様の注意が必要。',
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST005-003',
      customerId: 'CUST005',
      visitNumber: 3,
      visitDate: new Date('2025-03-01'),
      previousTreatmentId: 'CUST005-002',
      visitType: 'repeat_visit',
      visitPolicy: 'partial_change',
      changedFields: JSON.stringify(['thicknessLevel']),
      designPlan: JSON.stringify({ desiredDesign: 'ストレートナチュラル', thicknessLevel: 0, angleLevel: 0, densityLevel: -2, changeReason: ['顧客希望'], majorChangeReason: [], customerRequestNote: '少し太めにしてみたい' }),
      todayObservation: JSON.stringify({ browConditionTags: ['通常'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['問題なし'], todaySkinRiskLevel: 1, observationNote: '前回より赤みが改善。状態は良好。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['ワックス', '間引き'], rightBrowTreatmentTags: ['眉尻調整', '眉山調整'], leftBrowTreatmentTags: ['眉山調整'], treatmentNote: '太さを1段階太めに。赤みケアあり。' }),
      reaction: JSON.stringify({ satisfactionLevel: 5, reactionTags: ['自然な仕上がり', '満足'], concernTags: [], nextTimeCustomerRequest: 'この感じを維持して' }),
      handover: JSON.stringify({ handoverText: '右眉尻はメイク補正前提。角度をつけすぎない。赤みに注意。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: '前回より赤みが改善。状態は良好。',
    },
  })

  await prisma.visitRecord.create({
    data: {
      treatmentId: 'CUST005-004',
      customerId: 'CUST005',
      visitNumber: 4,
      visitDate: new Date('2025-04-05'),
      previousTreatmentId: 'CUST005-003',
      visitType: 'repeat_visit',
      visitPolicy: 'same_as_previous',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({ desiredDesign: 'ストレートナチュラル', thicknessLevel: 0, angleLevel: 0, densityLevel: -2, changeReason: [], majorChangeReason: [], customerRequestNote: '自然な感じで右眉尻を整えて' }),
      todayObservation: JSON.stringify({ browConditionTags: ['通常'], selfCareImpactExists: false, selfCareImpactArea: [], selfCareImpactLevel: 0, todaySkinConditionTags: ['赤み注意'], todaySkinRiskLevel: 2, observationNote: 'ワックス後赤みが出やすいため注意。右眉尻の薄さは変わらず。' }),
      treatmentRecord: JSON.stringify({ treatmentTags: ['ワックス', '間引き'], rightBrowTreatmentTags: ['眉尻調整'], leftBrowTreatmentTags: [], treatmentNote: 'ワックス後の赤みケアあり' }),
      reaction: JSON.stringify({ satisfactionLevel: 4, reactionTags: ['自然な仕上がり'], concernTags: ['右眉尻が少し薄い'], nextTimeCustomerRequest: '右眉尻もう少し何とかなる？' }),
      handover: JSON.stringify({ handoverText: '右眉尻はメイク補正前提。角度をつけすぎない。', staffEditNote: '', aiGeneratedPlaceholderText: '（AI生成予定）' }),
      originalObservationMemo: 'ワックス後赤みが出やすいため注意。右眉尻の薄さは変わらず。',
    },
  })

  console.log('Seed data created successfully!')
  console.log('CUST001: 佐藤 美咲（3件）')
  console.log('CUST002: 田中 彩花（2件）')
  console.log('CUST003: 鈴木 里奈（初回 1件）')
  console.log('CUST004: 高橋 由衣（5件）')
  console.log('CUST005: 中村 花（4件）')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
