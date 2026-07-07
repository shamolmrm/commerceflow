import { NextRequest, NextResponse } from 'next/server'

const VALID_COUPONS: Record<string, { type: string; value: number }> = {
  'WELCOME10': { type: 'percentage', value: 10 },
  'SAVE20': { type: 'percentage', value: 20 },
  'FLAT50': { type: 'fixed', value: 50 },
  'FREESHIP': { type: 'fixed', value: 0 },
}

export async function POST(req: NextRequest) {
  const { coupon_code } = await req.json()
  const coupon = VALID_COUPONS[coupon_code?.toUpperCase()]
  if (!coupon) return NextResponse.json({ detail: 'Invalid or expired coupon code.' }, { status: 400 })
  return NextResponse.json({ message: 'Coupon applied successfully!', coupon_code, ...coupon })
}
