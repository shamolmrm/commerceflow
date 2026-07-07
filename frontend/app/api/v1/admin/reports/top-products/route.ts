import { NextResponse } from 'next/server'
import { PRODUCTS } from '../../../_mock/data'

export async function GET() {
  const top = PRODUCTS.map(p => ({
    id: p.id, name: p.name, sku: p.sku,
    total_sold: Math.floor(50 + Math.random() * 500),
    revenue: parseFloat((p.effective_price * Math.floor(50 + Math.random() * 500)).toFixed(2)),
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  return NextResponse.json(top)
}
