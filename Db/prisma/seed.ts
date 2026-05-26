import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.visitRecord.deleteMany()
  await prisma.customerProfile.deleteMany()
  await prisma.customer.deleteMany()

  // 1. 佐藤 美咲（3回目）
  const sato = await prisma.customer.create({
    data: {
      name: '佐藤 美咲',
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
      customerId: sato.id,
      visitDate: new Date('2025-04-15'),
      visitType: 'repeat_visit',
      visitPolicy: 'same_as_previous',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({
        desiredDesign: '平行ナチュラル',
        thicknessLevel: -2,
        angleLevel: -3,
        densityLevel: 0,
        changeReason: [],
        majorChangeReason: [],
        customerRequestNote: '前回と同じ仕上がりで',
      }),
      todayObservation: JSON.stringify({
        browConditionTags: ['通常'],
        selfCareImpactExists: false,
        selfCareImpactArea: [],
        selfCareImpactLevel: 0,
        todaySkinConditionTags: ['問題なし'],
        todaySkinRiskLevel: 1,
        observationNote: '肌状態良好',
      }),
      treatmentRecord: JSON.stringify({
        treatmentTags: ['ワックス', '間引き'],
        rightBrowTreatmentTags: ['眉尻調整'],
        leftBrowTreatmentTags: ['眉尻調整', '眉下注意'],
        treatmentNote: '左眉下は慎重に施術',
      }),
      reaction: JSON.stringify({
        satisfactionLevel: 5,
        reactionTags: ['満足', 'ナチュラル仕上げ良い'],
        concernTags: [],
        nextTimeCustomerRequest: '次も同じ感じで',
      }),
      handover: JSON.stringify({
        handoverText: '左眉下を削りすぎ注意。平行寄りを維持。',
        staffEditNote: '',
        aiGeneratedPlaceholderText: '（AI生成予定）',
      }),
    },
  })

  // 2. 田中 彩花（2回目）
  const tanaka = await prisma.customer.create({
    data: {
      name: '田中 彩花',
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
      customerId: tanaka.id,
      visitDate: new Date('2025-04-20'),
      visitType: 'repeat_visit',
      visitPolicy: 'same_as_previous',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({
        desiredDesign: 'アーチナチュラル',
        thicknessLevel: 0,
        angleLevel: 1,
        densityLevel: -1,
        changeReason: [],
        majorChangeReason: [],
        customerRequestNote: '自然な感じで',
      }),
      todayObservation: JSON.stringify({
        browConditionTags: ['通常'],
        selfCareImpactExists: false,
        selfCareImpactArea: [],
        selfCareImpactLevel: 0,
        todaySkinConditionTags: ['乾燥'],
        todaySkinRiskLevel: 1,
        observationNote: '乾燥気味のため保湿注意',
      }),
      treatmentRecord: JSON.stringify({
        treatmentTags: ['ワックス', '間引き'],
        rightBrowTreatmentTags: ['眉頭調整'],
        leftBrowTreatmentTags: ['眉頭調整'],
        treatmentNote: '眉頭を作り込みすぎないよう注意',
      }),
      reaction: JSON.stringify({
        satisfactionLevel: 4,
        reactionTags: ['自然な仕上がり良い'],
        concernTags: ['少し薄かったかも'],
        nextTimeCustomerRequest: '少し太めにしてもいいかも',
      }),
      handover: JSON.stringify({
        handoverText: '濃さは自然寄り。眉頭を作り込みすぎない。',
        staffEditNote: '',
        aiGeneratedPlaceholderText: '（AI生成予定）',
      }),
    },
  })

  // 3. 鈴木 里奈（初回）
  const suzuki = await prisma.customer.create({
    data: {
      name: '鈴木 里奈',
      visitCount: 1,
      lastVisitDate: new Date('2025-05-01'),
      notes: '初回のため好みを確認',
    },
  })

  await prisma.visitRecord.create({
    data: {
      customerId: suzuki.id,
      visitDate: new Date('2025-05-01'),
      visitType: 'first_visit',
      visitPolicy: 'major_change',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({
        desiredDesign: 'ナチュラル',
        thicknessLevel: 0,
        angleLevel: 0,
        densityLevel: 0,
        changeReason: [],
        majorChangeReason: ['初回'],
        customerRequestNote: '自然な形にしたい',
      }),
      todayObservation: JSON.stringify({
        browConditionTags: ['初回'],
        selfCareImpactExists: false,
        selfCareImpactArea: [],
        selfCareImpactLevel: 0,
        todaySkinConditionTags: ['問題なし'],
        todaySkinRiskLevel: 0,
        observationNote: '初回カウンセリング済み',
      }),
      treatmentRecord: JSON.stringify({
        treatmentTags: ['ワックス', 'カット'],
        rightBrowTreatmentTags: [],
        leftBrowTreatmentTags: [],
        treatmentNote: '初回施術、形づくり',
      }),
      reaction: JSON.stringify({
        satisfactionLevel: 4,
        reactionTags: ['初めてで満足'],
        concernTags: [],
        nextTimeCustomerRequest: '次回も同じくらいの仕上がりで',
      }),
      handover: JSON.stringify({
        handoverText: '初回のため好みを確認しながら施術。次回は少し好みを聞く。',
        staffEditNote: '',
        aiGeneratedPlaceholderText: '（AI生成予定）',
      }),
    },
  })

  // 4. 高橋 由衣（5回目）
  const takahashi = await prisma.customer.create({
    data: {
      name: '高橋 由衣',
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
      customerId: takahashi.id,
      visitDate: new Date('2025-03-25'),
      visitType: 'repeat_visit',
      visitPolicy: 'same_as_previous',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({
        desiredDesign: '韓国風平行',
        thicknessLevel: 1,
        angleLevel: -4,
        densityLevel: 1,
        changeReason: [],
        majorChangeReason: [],
        customerRequestNote: '太めの韓国風をキープ',
      }),
      todayObservation: JSON.stringify({
        browConditionTags: ['通常'],
        selfCareImpactExists: false,
        selfCareImpactArea: [],
        selfCareImpactLevel: 0,
        todaySkinConditionTags: ['問題なし'],
        todaySkinRiskLevel: 0,
        observationNote: '状態良好',
      }),
      treatmentRecord: JSON.stringify({
        treatmentTags: ['間引き', 'カット'],
        rightBrowTreatmentTags: [],
        leftBrowTreatmentTags: [],
        treatmentNote: '太さ残しつつ濃さを整える',
      }),
      reaction: JSON.stringify({
        satisfactionLevel: 5,
        reactionTags: ['とても満足', '韓国風が気に入っている'],
        concernTags: [],
        nextTimeCustomerRequest: '次もこの感じで',
      }),
      handover: JSON.stringify({
        handoverText: '太さを残す。濃さは少し間引きで調整。',
        staffEditNote: '',
        aiGeneratedPlaceholderText: '（AI生成予定）',
      }),
    },
  })

  // 5. 中村 花（4回目）
  const nakamura = await prisma.customer.create({
    data: {
      name: '中村 花',
      visitCount: 4,
      lastVisitDate: new Date('2025-04-05'),
      notes: '右眉尻はメイク補正前提。角度をつけすぎない。',
      profile: {
        create: {
          defaultDesign: 'ストレートナチュラル',
          preferredThickness: -1,
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
      customerId: nakamura.id,
      visitDate: new Date('2025-04-05'),
      visitType: 'repeat_visit',
      visitPolicy: 'same_as_previous',
      changedFields: JSON.stringify([]),
      designPlan: JSON.stringify({
        desiredDesign: 'ストレートナチュラル',
        thicknessLevel: -1,
        angleLevel: 0,
        densityLevel: -2,
        changeReason: [],
        majorChangeReason: [],
        customerRequestNote: '自然な感じで右眉尻を整えて',
      }),
      todayObservation: JSON.stringify({
        browConditionTags: ['通常'],
        selfCareImpactExists: false,
        selfCareImpactArea: [],
        selfCareImpactLevel: 0,
        todaySkinConditionTags: ['赤み注意'],
        todaySkinRiskLevel: 2,
        observationNote: 'ワックス後赤みが出やすいため注意',
      }),
      treatmentRecord: JSON.stringify({
        treatmentTags: ['ワックス', '間引き'],
        rightBrowTreatmentTags: ['眉尻調整'],
        leftBrowTreatmentTags: [],
        treatmentNote: 'ワックス後の赤みケアあり',
      }),
      reaction: JSON.stringify({
        satisfactionLevel: 4,
        reactionTags: ['自然な仕上がり'],
        concernTags: ['右眉尻が少し薄い'],
        nextTimeCustomerRequest: '右眉尻もう少し何とかなる？',
      }),
      handover: JSON.stringify({
        handoverText: '右眉尻はメイク補正前提。角度をつけすぎない。',
        staffEditNote: '',
        aiGeneratedPlaceholderText: '（AI生成予定）',
      }),
    },
  })

  console.log('Seed data created successfully!')
  console.log(`Created customers: ${sato.name}, ${tanaka.name}, ${suzuki.name}, ${takahashi.name}, ${nakamura.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
