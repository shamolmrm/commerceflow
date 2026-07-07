import { NextResponse } from 'next/server'
import { PRODUCTS } from '../_mock/data'

const DEMO_WISHLIST = [
  { id: 1, product: { ...PRODUCTS[0], is_wishlisted: true }, added_at: '2024-11-01T10:00:00Z' },
  { id: 2, product: { ...PRODUCTS[5], is_wishlisted: true }, added_at: '2024-11-10T12:00:00Z' },
  { id: 3, product: { ...PRODUCTS[8], is_wishlisted: true }, added_at: '2024-12-01T09:00:00Z' },
]

export async function GET() {
  return NextResponse.json({ count: DEMO_WISHLIST.length, results: DEMO_WISHLIST })
}

export async function POST() {
  return NextResponse.json({}, { status: 201 })
}
