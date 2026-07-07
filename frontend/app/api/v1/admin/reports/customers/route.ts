import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ total_customers: 1543, new_customers: 87, returning_customers: 412, avg_order_value: 245.60 })
}
