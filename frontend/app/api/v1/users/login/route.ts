import { NextRequest, NextResponse } from 'next/server'

const DEMO_USERS: Record<string, { password: string; user: any }> = {
  'superadmin@supersoft.com': {
    password: 'Admin@1234',
    user: { id: 1, email: 'superadmin@supersoft.com', first_name: 'Super', last_name: 'Admin', role: 'superadmin', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
  },
  'manager@supersoft.com': {
    password: 'Admin@1234',
    user: { id: 2, email: 'manager@supersoft.com', first_name: 'Store', last_name: 'Manager', role: 'manager', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
  },
  'customer@example.com': {
    password: 'Admin@1234',
    user: { id: 3, email: 'customer@example.com', first_name: 'Demo', last_name: 'Customer', role: 'customer', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
  },
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const record = DEMO_USERS[email?.toLowerCase()]
  if (!record || record.password !== password) {
    return NextResponse.json({ detail: 'Invalid credentials. Try: superadmin@supersoft.com / Admin@1234' }, { status: 401 })
  }
  return NextResponse.json({
    user: record.user,
    access: 'demo_access_token_' + Date.now(),
    refresh: 'demo_refresh_token_' + Date.now(),
  })
}
