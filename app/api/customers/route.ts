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

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        profile: true,
        visitRecords: {
          orderBy: { visitDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    })

    const formatted = customers.map((c) => ({
      id: c.id,
      name: c.name,
      visitCount: c.visitCount,
      lastVisitDate: c.lastVisitDate?.toISOString() ?? null,
      notes: c.notes,
      profile: c.profile
        ? {
            ...c.profile,
            ngPoints: parseJsonField(c.profile.ngPoints, null),
          }
        : null,
      visitRecords: c.visitRecords.map((v) => ({
        id: v.id,
        customerId: v.customerId,
        visitDate: v.visitDate.toISOString(),
        visitType: v.visitType,
        previousRecordId: v.previousRecordId,
        visitPolicy: v.visitPolicy,
        changedFields: parseJsonField<string[]>(v.changedFields, []),
        designPlan: parseJsonField(v.designPlan, null),
        todayObservation: parseJsonField(v.todayObservation, null),
        treatmentRecord: parseJsonField(v.treatmentRecord, null),
        reaction: parseJsonField(v.reaction, null),
        handover: parseJsonField(v.handover, null),
      })),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('GET /api/customers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, notes } = body

    const customer = await prisma.customer.create({
      data: {
        name,
        notes,
        visitCount: 0,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('POST /api/customers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
