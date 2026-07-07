import { NextRequest, NextResponse } from 'next/server'

const DEMO_USER = { id: 1, email: 'superadmin@supersoft.com', first_name: 'Super', last_name: 'Admin', role: 'superadmin', is_verified: true, phone: '+1 555 0100', avatar: null, created_at: '2024-01-01T00:00:00Z' }

export async function GET() {
  return NextResponse.json(DEMO_USER)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  return NextResponse.json({ ...DEMO_USER, ...body })
}
