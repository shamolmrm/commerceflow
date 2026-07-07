import { NextResponse } from 'next/server'
export async function POST() {
  return NextResponse.json({ access: 'demo_access_token_refreshed_' + Date.now() })
}
