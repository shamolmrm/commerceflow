import { NextResponse } from 'next/server'
export async function POST() {
  return NextResponse.json({
    redirect_url: '/checkout/success?order=ORD-' + Date.now() + '&method=sslcommerz',
    session_key: 'SSL-' + Date.now(),
  })
}
