import { NextResponse } from 'next/server'
import { prisma } from '@back/lib/db'

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({ orderBy: { id: 'asc' } })
    return NextResponse.json(staff.map((s) => ({ id: s.id, name: s.name })))
  } catch (error) {
    console.error('GET /api/staff error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
