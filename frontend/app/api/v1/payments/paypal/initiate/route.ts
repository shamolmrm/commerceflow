import { NextResponse } from 'next/server'
export async function POST() {
  return NextResponse.json({
    approval_url: '/checkout/success?order=ORD-' + Date.now() + '&method=paypal',
    order_id: 'PAYPAL-' + Date.now(),
  })
}
