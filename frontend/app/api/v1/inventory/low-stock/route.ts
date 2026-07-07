import { NextResponse } from 'next/server'
import { PRODUCTS } from '../../_mock/data'

export async function GET() {
  const lowStock = PRODUCTS
    .filter(p => (p.total_stock || 0) <= 20)
    .map((p, i) => ({
      id: i + 100,
      product: { id: p.id, name: p.name, sku: p.sku },
      warehouse: { id: 1, name: 'Main Warehouse' },
      quantity: p.total_stock || 0,
      low_stock_threshold: 20,
      is_low_stock: true,
      is_out_of_stock: (p.total_stock || 0) === 0,
      updated_at: new Date().toISOString(),
    }))
  return NextResponse.json({ count: lowStock.length, results: lowStock })
}
