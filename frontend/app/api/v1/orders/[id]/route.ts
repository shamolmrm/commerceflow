import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Return a single order stub — in real usage the list route's data would be shared
  return NextResponse.json({
    id: parseInt(id), order_number: `ORD-${id}`, status: 'delivered', payment_status: 'paid',
    payment_method: 'stripe', subtotal: 1199.00, tax_amount: 59.95, shipping_cost: 0,
    discount_amount: 0, total: 1258.95, notes: '',
    created_at: new Date().toISOString(),
    items: [{ id: 1, product_name: 'iPhone 15 Pro Max', quantity: 1, unit_price: 1199.00, total_price: 1199.00 }],
    shipping_address: { full_name: 'Demo User', phone: '+1 555 0100', address_line1: '123 Demo St', city: 'New York', state: 'NY', postal_code: '10001', country: 'US', is_default: true },
    status_history: [
      { id: 1, status: 'pending', notes: 'Order placed', created_at: new Date().toISOString() },
      { id: 2, status: 'delivered', notes: 'Delivered', created_at: new Date().toISOString() },
    ],
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json()
  return NextResponse.json({ id: parseInt((await params).id), ...body })
}
