import { NextResponse } from 'next/server'
import { prisma } from '@back/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customerId,
      visitDate,
      visitType,
      previousRecordId,
      visitPolicy,
      changedFields,
      designPlan,
      todayObservation,
      treatmentRecord,
      reaction,
      handover,
    } = body

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 })
    }

    const visitRecord = await prisma.visitRecord.create({
      data: {
        customerId,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        visitType: visitType ?? 'repeat_visit',
        previousRecordId: previousRecordId ?? null,
        visitPolicy: visitPolicy ?? 'same_as_previous',
        changedFields: changedFields ? JSON.stringify(changedFields) : null,
        designPlan: designPlan ? JSON.stringify(designPlan) : null,
        todayObservation: todayObservation ? JSON.stringify(todayObservation) : null,
        treatmentRecord: treatmentRecord ? JSON.stringify(treatmentRecord) : null,
        reaction: reaction ? JSON.stringify(reaction) : null,
        handover: handover ? JSON.stringify(handover) : null,
      },
    })

    // Update customer visitCount and lastVisitDate
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        visitCount: { increment: 1 },
        lastVisitDate: visitDate ? new Date(visitDate) : new Date(),
      },
    })

    return NextResponse.json(visitRecord, { status: 201 })
  } catch (error) {
    console.error('POST /api/visits error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
