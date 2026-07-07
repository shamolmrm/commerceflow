import { NextRequest, NextResponse } from 'next/server'

const MOCK_ORDERS = [
  {
    id: 1001, order_number: 'ORD-20241123', status: 'delivered', payment_status: 'paid',
    payment_method: 'stripe', subtotal: 1318.99, tax_amount: 65.95, shipping_cost: 0,
    discount_amount: 0, total: 1384.94, notes: '', created_at: '2024-11-23T14:32:00Z',
    customer_name: 'Demo User',
    items: [
      { id: 1, product_name: 'iPhone 15 Pro Max', variant_info: null, quantity: 1, unit_price: 1199.00, total_price: 1199.00 },
      { id: 2, product_name: 'Logitech MX Master 3S', variant_info: null, quantity: 1, unit_price: 79.99, total_price: 79.99 },
    ],
    shipping_address: { id: 1, full_name: 'Demo User', phone: '+1 555 0100', address_line1: '123 Demo Street', city: 'New York', state: 'NY', postal_code: '10001', country: 'US', is_default: true },
    status_history: [
      { id: 1, status: 'pending', notes: 'Order placed', created_at: '2024-11-23T14:32:00Z' },
      { id: 2, status: 'processing', notes: 'Payment confirmed', created_at: '2024-11-23T15:00:00Z' },
      { id: 3, status: 'shipped', notes: 'Shipped via FedEx', created_at: '2024-11-24T09:00:00Z' },
      { id: 4, status: 'delivered', notes: 'Delivered successfully', created_at: '2024-11-26T14:00:00Z' },
    ],
  },
  {
    id: 1002, order_number: 'ORD-20241215', status: 'shipped', payment_status: 'paid',
    payment_method: 'paypal', subtotal: 649.99, tax_amount: 32.50, shipping_cost: 0,
    discount_amount: 100, total: 582.49, notes: 'Please leave at door', created_at: '2024-12-15T09:18:00Z',
    customer_name: 'Demo User',
    items: [
      { id: 3, product_name: 'Dyson V15 Detect Vacuum', variant_info: null, quantity: 1, unit_price: 649.99, total_price: 649.99 },
    ],
    shipping_address: { id: 1, full_name: 'Demo User', phone: '+1 555 0100', address_line1: '123 Demo Street', city: 'New York', state: 'NY', postal_code: '10001', country: 'US', is_default: true },
    status_history: [
      { id: 5, status: 'pending', notes: 'Order placed', created_at: '2024-12-15T09:18:00Z' },
      { id: 6, status: 'processing', notes: 'Payment via PayPal confirmed', created_at: '2024-12-15T09:30:00Z' },
      { id: 7, status: 'shipped', notes: 'Shipped via UPS — Tracking: 1Z9876543210', created_at: '2024-12-16T11:00:00Z' },
    ],
  },
  {
    id: 1003, order_number: 'ORD-20250102', status: 'processing', payment_status: 'paid',
    payment_method: 'stripe', subtotal: 319.99, tax_amount: 16.00, shipping_cost: 0,
    discount_amount: 0, total: 335.99, notes: '', created_at: '2025-01-02T16:45:00Z',
    customer_name: 'Demo User',
    items: [
      { id: 4, product_name: 'Sony WH-1000XM5', variant_info: null, quantity: 1, unit_price: 319.99, total_price: 319.99 },
    ],
    shipping_address: { id: 1, full_name: 'Demo User', phone: '+1 555 0100', address_line1: '123 Demo Street', city: 'New York', state: 'NY', postal_code: '10001', country: 'US', is_default: true },
    status_history: [
      { id: 8, status: 'pending', notes: 'Order placed', created_at: '2025-01-02T16:45:00Z' },
      { id: 9, status: 'processing', notes: 'Being prepared', created_at: '2025-01-02T17:00:00Z' },
    ],
  },
]

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const status = sp.get('status')
  let orders = [...MOCK_ORDERS]
  if (status) orders = orders.filter(o => o.status === status)
  return NextResponse.json({ count: orders.length, next: null, previous: null, results: orders })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newOrder = {
    id: 2000 + Math.floor(Math.random() * 999),
    order_number: `ORD-${Date.now().toString().slice(-8)}`,
    status: 'pending', payment_status: 'pending',
    subtotal: 0, tax_amount: 0, shipping_cost: 0, discount_amount: 0, total: 0,
    items: [], status_history: [],
    created_at: new Date().toISOString(),
    ...body,
  }
  return NextResponse.json(newOrder, { status: 201 })
}
