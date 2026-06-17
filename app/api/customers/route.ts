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

function formatVisitRecord(v: {
  treatmentId: string
  customerId: string
  visitNumber: number
  visitDate: Date
  previousTreatmentId: string | null
  visitType: string
  visitPolicy: string
  changedFields: string | null
  designPlan: string | null
  todayObservation: string | null
  treatmentRecord: string | null
  handover: string | null
  originalObservationMemo: string | null
  aiGeneratedObservationSummary: string | null
  aiGeneratedHandover: string | null
  staffEditedHandover: string | null
  staffId: string | null
  staff: { name: string } | null
}) {
  return {
    treatmentId: v.treatmentId,
    customerId: v.customerId,
    visitNumber: v.visitNumber,
    visitDate: v.visitDate.toISOString(),
    previousTreatmentId: v.previousTreatmentId,
    visitType: v.visitType,
    visitPolicy: v.visitPolicy,
    changedFields: parseJsonField<string[]>(v.changedFields, []),
    designPlan: parseJsonField(v.designPlan, null),
    todayObservation: parseJsonField(v.todayObservation, null),
    treatmentRecord: parseJsonField(v.treatmentRecord, null),
    handover: parseJsonField(v.handover, null),
    originalObservationMemo: v.originalObservationMemo,
    aiGeneratedObservationSummary: v.aiGeneratedObservationSummary,
    aiGeneratedHandover: v.aiGeneratedHandover,
    staffEditedHandover: v.staffEditedHandover,
    staffId: v.staffId,
    staffName: v.staff?.name ?? null,
  }
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        profile: true,
        visitRecords: {
          orderBy: { visitNumber: 'desc' },
          take: 2,
          include: { staff: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    const formatted = customers.map((c) => ({
      id: c.id,
      name: c.name,
      nameKana: c.nameKana,
      bookingName: c.bookingName,
      age: c.age,
      phone: c.phone,
      email: c.email,
      visitCount: c.visitCount,
      lastVisitDate: c.lastVisitDate?.toISOString() ?? null,
      notes: c.notes,
      profile: c.profile
        ? {
            ...c.profile,
            ngPoints: parseJsonField(c.profile.ngPoints, null),
          }
        : null,
      visitRecords: c.visitRecords.map(formatVisitRecord),
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
    const { name, nameKana, notes } = body

    const count = await prisma.customer.count()
    const newId = `CUST${String(count + 1).padStart(3, '0')}`

    const customer = await prisma.customer.create({
      data: {
        id: newId,
        name,
        nameKana: nameKana ?? null,
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
