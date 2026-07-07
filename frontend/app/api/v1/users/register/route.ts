import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const user = {
    id: Math.floor(Math.random() * 10000) + 100,
    email: body.email,
    first_name: body.first_name,
    last_name: body.last_name,
    role: 'customer',
    is_verified: false,
    created_at: new Date().toISOString(),
  }
  return NextResponse.json({
    user,
    access: 'demo_access_token_' + Date.now(),
    refresh: 'demo_refresh_token_' + Date.now(),
    message: 'Account created. OTP sent to your email (demo mode: any 6-digit code works).',
  }, { status: 201 })
}
