import { NextRequest, NextResponse } from 'next/server'

const MOCK_REVIEWS = [
  { id: 1, user_name: 'Alex Johnson', rating: 5, title: 'Absolutely love it!', body: 'Best purchase I\'ve made this year. Quality is outstanding and delivery was super fast.', helpful_count: 34, is_verified_purchase: true, created_at: '2024-10-15T10:00:00Z', user_avatar: null },
  { id: 2, user_name: 'Sarah M.', rating: 4, title: 'Great product, minor issue', body: 'Really happy with the quality overall. Took off one star because the packaging was slightly damaged, but the product itself is perfect.', helpful_count: 18, is_verified_purchase: true, created_at: '2024-09-28T10:00:00Z', user_avatar: null },
  { id: 3, user_name: 'David K.', rating: 5, title: 'Exceeded my expectations', body: 'I was skeptical at first, but this product completely won me over. Highly recommend to everyone!', helpful_count: 42, is_verified_purchase: false, created_at: '2024-09-12T10:00:00Z', user_avatar: null },
  { id: 4, user_name: 'Emma R.', rating: 3, title: 'Decent but overpriced', body: 'The product is decent but I feel it\'s a bit overpriced for what you get. Maybe worth it on sale.', helpful_count: 9, is_verified_purchase: true, created_at: '2024-08-30T10:00:00Z', user_avatar: null },
  { id: 5, user_name: 'Mohammed A.', rating: 5, title: 'Perfect! 10/10', body: 'Incredible value and quality. Shipped same day and arrived in perfect condition. Already ordered another one as a gift.', helpful_count: 27, is_verified_purchase: true, created_at: '2024-08-14T10:00:00Z', user_avatar: null },
]

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return NextResponse.json({ count: MOCK_REVIEWS.length, next: null, previous: null, results: MOCK_REVIEWS })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  return NextResponse.json({ id: 99, user_name: 'You', ...body, helpful_count: 0, is_verified_purchase: true, created_at: new Date().toISOString() }, { status: 201 })
}
