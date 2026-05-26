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
  id: string
  customerId: string
  visitDate: Date
  visitType: string
  previousRecordId: string | null
  visitPolicy: string
  changedFields: string | null
  designPlan: string | null
  todayObservation: string | null
  treatmentRecord: string | null
  reaction: string | null
  handover: string | null
}) {
  return {
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
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        visitRecords: {
          orderBy: { visitDate: 'desc' },
          take: 20,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      visitCount: customer.visitCount,
      lastVisitDate: customer.lastVisitDate?.toISOString() ?? null,
      notes: customer.notes,
      profile: customer.profile
        ? {
            ...customer.profile,
            ngPoints: parseJsonField(customer.profile.ngPoints, null),
          }
        : null,
      visitRecords: customer.visitRecords.map(formatVisitRecord),
    })
  } catch (error) {
    console.error('GET /api/customers/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, notes, profile } = body

    if (name !== undefined || notes !== undefined) {
      await prisma.customer.update({
        where: { id: params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(notes !== undefined && { notes }),
        },
      })
    }

    if (profile !== undefined) {
      const profileData = {
        defaultDesign: profile.defaultDesign ?? null,
        preferredThickness: profile.preferredThickness ?? 0,
        preferredAngle: profile.preferredAngle ?? 0,
        preferredDensity: profile.preferredDensity ?? 0,
        asymmetryType: profile.asymmetryType ?? null,
        asymmetryLevel: profile.asymmetryLevel ?? 0,
        hairFlowNotes: profile.hairFlowNotes ?? null,
        sparseAreaNotes: profile.sparseAreaNotes ?? null,
        skinRiskProfile: profile.skinRiskProfile ?? null,
        ngPoints: profile.ngPoints != null ? JSON.stringify(profile.ngPoints) : null,
        selfCareHabitNotes: profile.selfCareHabitNotes ?? null,
        generalHandoverNotes: profile.generalHandoverNotes ?? null,
      }
      await prisma.customerProfile.upsert({
        where: { customerId: params.id },
        update: profileData,
        create: { customerId: params.id, ...profileData },
      })
    }

    const updated = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        visitRecords: { orderBy: { visitDate: 'desc' }, take: 20 },
      },
    })

    if (!updated) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      visitCount: updated.visitCount,
      lastVisitDate: updated.lastVisitDate?.toISOString() ?? null,
      notes: updated.notes,
      profile: updated.profile
        ? {
            ...updated.profile,
            ngPoints: parseJsonField(updated.profile.ngPoints, null),
          }
        : null,
      visitRecords: updated.visitRecords.map(formatVisitRecord),
    })
  } catch (error) {
    console.error('PUT /api/customers/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
