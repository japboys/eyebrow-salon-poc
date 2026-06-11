import { NextResponse } from 'next/server'
import { prisma } from '@back/lib/db'
import { toDateKey } from '@/Other/lib/date'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customerId,
      staffId,
      visitDate,
      visitType,
      visitPolicy,
      changedFields,
      designPlan,
      todayObservation,
      treatmentRecord,
      handover,
      originalObservationMemo,
    } = body

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 })
    }

    // Calculate visitNumber and treatmentId
    const latestRecord = await prisma.visitRecord.findFirst({
      where: { customerId },
      orderBy: { visitNumber: 'desc' },
    })
    const visitNumber = (latestRecord?.visitNumber ?? 0) + 1
    const previousTreatmentId = latestRecord?.treatmentId ?? null
    const treatmentId = `${customerId}-${String(visitNumber).padStart(3, '0')}`

    const visitRecord = await prisma.visitRecord.create({
      data: {
        treatmentId,
        customerId,
        visitNumber,
        previousTreatmentId,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        visitType: visitType ?? 'repeat_visit',
        visitPolicy: visitPolicy ?? 'same_as_previous',
        changedFields: changedFields ? JSON.stringify(changedFields) : null,
        designPlan: designPlan ? JSON.stringify(designPlan) : null,
        todayObservation: todayObservation ? JSON.stringify(todayObservation) : null,
        treatmentRecord: treatmentRecord ? JSON.stringify(treatmentRecord) : null,
        handover: handover ? JSON.stringify(handover) : null,
        originalObservationMemo: originalObservationMemo ?? null,
        staffId: staffId ?? null,
      },
    })

    // draft保存時はvisitCountを更新しない（確定時にPUTで更新）
    if (visitPolicy !== 'draft') {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          visitCount: { increment: 1 },
          lastVisitDate: visitDate ? new Date(visitDate) : new Date(),
        },
      })

      // 該当日の予約があれば完了扱いにする
      await prisma.appointment.updateMany({
        where: {
          customerId,
          date: toDateKey(visitRecord.visitDate),
          status: 'scheduled',
        },
        data: { status: 'completed', visitRecordId: treatmentId },
      })
    }

    return NextResponse.json({
      treatmentId: visitRecord.treatmentId,
      customerId: visitRecord.customerId,
      visitNumber: visitRecord.visitNumber,
      visitDate: visitRecord.visitDate.toISOString(),
      previousTreatmentId: visitRecord.previousTreatmentId,
      visitType: visitRecord.visitType,
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/visits error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
