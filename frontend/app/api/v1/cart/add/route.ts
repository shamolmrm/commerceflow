import { NextRequest, NextResponse } from 'next/server'
import { PRODUCTS } from '../../_mock/data'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const product = PRODUCTS.find(p => p.id === body.product_id) || PRODUCTS[0]
  const qty = body.quantity || 1
  const item = {
    id: Math.floor(Math.random() * 1000),
    product,
    quantity: qty,
    unit_price: product.effective_price,
    line_total: product.effective_price * qty,
    variant_info: null,
    added_at: new Date().toISOString(),
  }
  return NextResponse.json({
    id: 1,
    items: [item],
    total: item.line_total,
    item_count: qty,
    discount: 0,
    coupon_code: null,
  })
}
