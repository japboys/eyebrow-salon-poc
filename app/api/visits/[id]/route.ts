import { NextResponse } from 'next/server'
import { prisma } from '@back/lib/db'

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
      where: { id: params.id },
    })

    if (!visit) {
      return NextResponse.json({ error: 'Visit record not found' }, { status: 404 })
    }

    const formatted = {
      id: visit.id,
      customerId: visit.customerId,
      visitDate: visit.visitDate.toISOString(),
      visitType: visit.visitType,
      previousRecordId: visit.previousRecordId,
      visitPolicy: visit.visitPolicy,
      changedFields: parseJsonField<string[]>(visit.changedFields, []),
      designPlan: parseJsonField(visit.designPlan, null),
      todayObservation: parseJsonField(visit.todayObservation, null),
      treatmentRecord: parseJsonField(visit.treatmentRecord, null),
      reaction: parseJsonField(visit.reaction, null),
      handover: parseJsonField(visit.handover, null),
    }

    return NextResponse.json(formatted)
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
      visitPolicy,
      changedFields,
      designPlan,
      todayObservation,
      treatmentRecord,
      reaction,
      handover,
    } = body

    const updated = await prisma.visitRecord.update({
      where: { id: params.id },
      data: {
        ...(visitPolicy !== undefined && { visitPolicy }),
        ...(changedFields !== undefined && { changedFields: JSON.stringify(changedFields) }),
        ...(designPlan !== undefined && { designPlan: JSON.stringify(designPlan) }),
        ...(todayObservation !== undefined && { todayObservation: JSON.stringify(todayObservation) }),
        ...(treatmentRecord !== undefined && { treatmentRecord: JSON.stringify(treatmentRecord) }),
        ...(reaction !== undefined && { reaction: JSON.stringify(reaction) }),
        ...(handover !== undefined && { handover: JSON.stringify(handover) }),
      },
    })

    return NextResponse.json({
      id: updated.id,
      customerId: updated.customerId,
      visitDate: updated.visitDate.toISOString(),
      visitType: updated.visitType,
      previousRecordId: updated.previousRecordId,
      visitPolicy: updated.visitPolicy,
      changedFields: parseJsonField<string[]>(updated.changedFields, []),
      designPlan: parseJsonField(updated.designPlan, null),
      todayObservation: parseJsonField(updated.todayObservation, null),
      treatmentRecord: parseJsonField(updated.treatmentRecord, null),
      reaction: parseJsonField(updated.reaction, null),
      handover: parseJsonField(updated.handover, null),
    })
  } catch (error) {
    console.error('PUT /api/visits/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
