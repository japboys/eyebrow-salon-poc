import { NextResponse } from 'next/server'
import { prisma } from '@back/lib/db'
import { pickStaffByRotation } from '@/Other/lib/staff-rotation'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!date && !(from && to)) {
      return NextResponse.json({ error: 'date, or from/to, is required' }, { status: 400 })
    }

    const appointments = await prisma.appointment.findMany({
      where: date ? { date } : { date: { gte: from!, lte: to! } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      include: { staff: true },
    })

    return NextResponse.json(
      appointments.map((a) => ({
        id: a.id,
        customerId: a.customerId,
        date: a.date,
        time: a.time,
        duration: a.duration,
        status: a.status,
        staffId: a.staffId,
        staffName: a.staff?.name ?? null,
        visitRecordId: a.visitRecordId,
      }))
    )
  } catch (error) {
    console.error('GET /api/appointments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 新規予約の登録。staffId未指定（LPからの新規/指名なし予約）の場合はローテーションで自動割当する。
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerId, date, time, duration, staffId } = body as {
      customerId?: string
      date?: string
      time?: string
      duration?: number
      staffId?: string | null
    }

    if (!customerId || !date || !time) {
      return NextResponse.json({ error: 'customerId, date, time は必須です' }, { status: 400 })
    }

    const finalDuration = duration ?? 40
    let assignedStaffId: string | null = staffId ?? null

    if (!assignedStaffId) {
      const monthPrefix = date.slice(0, 7) // "YYYY-MM"
      const [staffList, sameDayAppointments, monthlyAppointments] = await Promise.all([
        prisma.staff.findMany({ orderBy: { id: 'asc' } }),
        prisma.appointment.findMany({
          where: { date, status: { not: 'cancelled' } },
          select: { staffId: true, date: true, time: true, duration: true },
        }),
        prisma.appointment.findMany({
          where: { date: { startsWith: monthPrefix }, status: { not: 'cancelled' } },
          include: { customer: { select: { visitCount: true } } },
        }),
      ])

      // 今月の「新規/指名なし」対応件数（新規customer.visitCount<=1を簡易的な指標として使用）
      const monthlyCounts = new Map<string, number>()
      monthlyAppointments.forEach((a) => {
        if (a.staffId && a.customer.visitCount <= 1) {
          monthlyCounts.set(a.staffId, (monthlyCounts.get(a.staffId) ?? 0) + 1)
        }
      })

      const result = pickStaffByRotation(
        staffList.map((s) => ({ id: s.id, skipPriority: s.skipPriority })),
        monthlyCounts,
        sameDayAppointments.map((a) => ({ staffId: a.staffId, date: a.date, time: a.time, duration: a.duration })),
        date,
        time,
        finalDuration
      )

      if (result) {
        assignedStaffId = result.assignedStaffId
        await Promise.all([
          prisma.staff.update({ where: { id: result.assignedStaffId }, data: { skipPriority: false } }),
          ...result.skippedStaffIds.map((id) => prisma.staff.update({ where: { id }, data: { skipPriority: true } })),
        ])
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        date,
        time,
        duration: finalDuration,
        staffId: assignedStaffId,
      },
      include: { staff: true },
    })

    return NextResponse.json(
      {
        id: appointment.id,
        customerId: appointment.customerId,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        status: appointment.status,
        staffId: appointment.staffId,
        staffName: appointment.staff?.name ?? null,
        visitRecordId: appointment.visitRecordId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/appointments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
