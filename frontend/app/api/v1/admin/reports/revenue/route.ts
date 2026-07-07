import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    daily: Array.from({ length: 30 }, (_, i) => ({
      date: `${i + 1}`,
      revenue: parseFloat((1200 + Math.random() * 4500).toFixed(2)),
      orders: Math.floor(10 + Math.random() * 30),
    })),
    by_category: [
      { name: 'Electronics', revenue: 98450 },
      { name: 'Footwear', revenue: 54320 },
      { name: 'Clothing', revenue: 43210 },
      { name: 'Home & Kitchen', revenue: 32100 },
      { name: 'Gaming', revenue: 28900 },
      { name: 'Sports', revenue: 18750 },
    ],
  })
}
