import { NextResponse } from 'next/server'
import { prisma } from '@back/lib/db'
import { toDateKey } from '@/Other/lib/date'

function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const visit = await prisma.visitRecord.findUnique({
      where: { treatmentId: params.id },
      include: { staff: true },
    })

    if (!visit) {
      return NextResponse.json({ error: 'Visit record not found' }, { status: 404 })
    }

    return NextResponse.json({
      treatmentId: visit.treatmentId,
      customerId: visit.customerId,
      visitNumber: visit.visitNumber,
      visitDate: visit.visitDate.toISOString(),
      previousTreatmentId: visit.previousTreatmentId,
      visitType: visit.visitType,
      visitPolicy: visit.visitPolicy,
      changedFields: parseJsonField<string[]>(visit.changedFields, []),
      designPlan: parseJsonField(visit.designPlan, null),
      todayObservation: parseJsonField(visit.todayObservation, null),
      treatmentRecord: parseJsonField(visit.treatmentRecord, null),
      handover: parseJsonField(visit.handover, null),
      originalObservationMemo: visit.originalObservationMemo,
      aiGeneratedObservationSummary: visit.aiGeneratedObservationSummary,
      aiGeneratedHandover: visit.aiGeneratedHandover,
      staffEditedHandover: visit.staffEditedHandover,
      staffId: visit.staffId,
      staffName: visit.staff?.name ?? null,
    })
  } catch (error) {
    console.error('GET /api/visits/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      staffId,
      visitPolicy,
      changedFields,
      designPlan,
      todayObservation,
      treatmentRecord,
      handover,
      staffEditedHandover,
    } = body

    // draftから本保存に変わる場合はvisitCount/lastVisitDateを更新
    const existing = await prisma.visitRecord.findUnique({ where: { treatmentId: params.id } })
    const wasDraft = existing?.visitPolicy === 'draft'
    const isFinalized = visitPolicy !== undefined && visitPolicy !== 'draft'

    const updated = await prisma.visitRecord.update({
      where: { treatmentId: params.id },
      data: {
        ...(staffId !== undefined && { staffId }),
        ...(visitPolicy !== undefined && { visitPolicy }),
        ...(changedFields !== undefined && { changedFields: JSON.stringify(changedFields) }),
        ...(designPlan !== undefined && { designPlan: JSON.stringify(designPlan) }),
        ...(todayObservation !== undefined && { todayObservation: JSON.stringify(todayObservation) }),
        ...(treatmentRecord !== undefined && { treatmentRecord: JSON.stringify(treatmentRecord) }),
        ...(handover !== undefined && { handover: JSON.stringify(handover) }),
        ...(staffEditedHandover !== undefined && { staffEditedHandover }),
      },
      include: { staff: true },
    })

    if (wasDraft && isFinalized) {
      await prisma.customer.update({
        where: { id: updated.customerId },
        data: {
          visitCount: { increment: 1 },
          lastVisitDate: updated.visitDate,
        },
      })

      // 該当日の予約があれば完了扱いにする
      await prisma.appointment.updateMany({
        where: {
          customerId: updated.customerId,
          date: toDateKey(updated.visitDate),
          status: 'scheduled',
        },
        data: { status: 'completed', visitRecordId: updated.treatmentId },
      })
    }

    return NextResponse.json({
      treatmentId: updated.treatmentId,
      customerId: updated.customerId,
      visitNumber: updated.visitNumber,
      visitDate: updated.visitDate.toISOString(),
      previousTreatmentId: updated.previousTreatmentId,
      visitType: updated.visitType,
      visitPolicy: updated.visitPolicy,
      changedFields: parseJsonField<string[]>(updated.changedFields, []),
      designPlan: parseJsonField(updated.designPlan, null),
      todayObservation: parseJsonField(updated.todayObservation, null),
      treatmentRecord: parseJsonField(updated.treatmentRecord, null),
      handover: parseJsonField(updated.handover, null),
      originalObservationMemo: updated.originalObservationMemo,
      aiGeneratedObservationSummary: updated.aiGeneratedObservationSummary,
      aiGeneratedHandover: updated.aiGeneratedHandover,
      staffEditedHandover: updated.staffEditedHandover,
      staffId: updated.staffId,
      staffName: updated.staff?.name ?? null,
    })
  } catch (error) {
    console.error('PUT /api/visits/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
