import { NextResponse } from 'next/server'
import { prisma } from '@back/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 })
    }

    const appointments = await prisma.appointment.findMany({
      where: { date },
      orderBy: { time: 'asc' },
    })

    return NextResponse.json(
      appointments.map((a) => ({
        id: a.id,
        customerId: a.customerId,
        date: a.date,
        time: a.time,
        status: a.status,
        visitRecordId: a.visitRecordId,
      }))
    )
  } catch (error) {
    console.error('GET /api/appointments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
