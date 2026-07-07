import { NextResponse } from 'next/server'
import { PRODUCTS } from '../_mock/data'

export async function GET() {
  const inventory = PRODUCTS.map((p, i) => ({
    id: i + 1,
    product: { id: p.id, name: p.name, sku: p.sku },
    warehouse: { id: 1, name: 'Main Warehouse' },
    quantity: p.total_stock || 0,
    low_stock_threshold: 10,
    is_low_stock: (p.total_stock || 0) <= 10,
    is_out_of_stock: (p.total_stock || 0) === 0,
    updated_at: new Date().toISOString(),
  }))
  return NextResponse.json({ count: inventory.length, results: inventory })
}
