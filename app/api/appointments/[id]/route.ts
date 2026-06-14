import { NextResponse } from 'next/server'
import { prisma } from '@back/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { staffId, duration } = body

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...(staffId !== undefined && { staffId }),
        ...(duration !== undefined && { duration }),
      },
      include: { staff: true },
    })

    return NextResponse.json({
      id: updated.id,
      customerId: updated.customerId,
      date: updated.date,
      time: updated.time,
      duration: updated.duration,
      status: updated.status,
      staffId: updated.staffId,
      staffName: updated.staff?.name ?? null,
      visitRecordId: updated.visitRecordId,
    })
  } catch (error) {
    console.error('PATCH /api/appointments/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
