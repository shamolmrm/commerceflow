import { NextResponse } from 'next/server'

const EMPTY_CART = { id: 1, items: [], total: 0, item_count: 0, discount: 0, coupon_code: null }

export async function PATCH() {
  return NextResponse.json(EMPTY_CART)
}

export async function DELETE() {
  return NextResponse.json(EMPTY_CART)
}
