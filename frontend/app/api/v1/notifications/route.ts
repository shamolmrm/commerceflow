import { NextResponse } from 'next/server'

const mockNotifications = [
  {
    id: 1,
    title: 'Order Shipped',
    message: 'Your order #ORD-001 has been shipped and is on its way.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: 'order',
  },
  {
    id: 2,
    title: 'Payment Confirmed',
    message: 'Payment of $1,299.99 for order #ORD-002 has been confirmed.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: 'payment',
  },
  {
    id: 3,
    title: 'Welcome to CommerceFlow!',
    message: 'Thanks for joining. Explore our latest deals and collections.',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    type: 'system',
  },
  {
    id: 4,
    title: 'Flash Sale — 20% Off Electronics',
    message: 'Hurry! Our 24-hour flash sale on electronics ends soon.',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    type: 'promo',
  },
]

export async function GET() {
  return NextResponse.json(mockNotifications)
}
