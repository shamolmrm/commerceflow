import { NextRequest, NextResponse } from 'next/server'
import { PRODUCTS, paginate } from '../_mock/data'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = parseInt(sp.get('page') || '1')
  const pageSize = parseInt(sp.get('page_size') || '20')
  const search = sp.get('search')?.toLowerCase()
  const category = sp.get('category')?.toLowerCase()
  const brand = sp.get('brand')?.toLowerCase()
  const minPrice = sp.get('min_price') ? parseFloat(sp.get('min_price')!) : null
  const maxPrice = sp.get('max_price') ? parseFloat(sp.get('max_price')!) : null
  const minRating = sp.get('min_rating') ? parseFloat(sp.get('min_rating')!) : null
  const inStock = sp.get('in_stock')
  const isOnSale = sp.get('is_on_sale')
  const isFeatured = sp.get('is_featured')
  const ordering = sp.get('ordering') || '-created_at'

  let products = [...PRODUCTS]

  if (search) products = products.filter(p => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search))
  if (category) products = products.filter(p => p.category?.slug === category || p.category?.name.toLowerCase() === category)
  if (brand) products = products.filter(p => p.brand?.slug === brand || p.brand?.name.toLowerCase() === brand)
  if (minPrice !== null) products = products.filter(p => p.effective_price >= minPrice)
  if (maxPrice !== null) products = products.filter(p => p.effective_price <= maxPrice)
  if (minRating !== null) products = products.filter(p => p.rating >= minRating)
  if (inStock === 'true') products = products.filter(p => p.in_stock)
  if (isOnSale === 'true') products = products.filter(p => p.sale_price !== null)
  if (isFeatured === 'true') products = products.filter(p => p.is_featured)

  // Sorting
  if (ordering === 'price') products.sort((a, b) => a.effective_price - b.effective_price)
  else if (ordering === '-price') products.sort((a, b) => b.effective_price - a.effective_price)
  else if (ordering === '-rating') products.sort((a, b) => b.rating - a.rating)
  else if (ordering === '-review_count') products.sort((a, b) => b.review_count - a.review_count)
  else if (ordering === 'name') products.sort((a, b) => a.name.localeCompare(b.name))
  else products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json(paginate(products, page, pageSize))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newProduct = { id: PRODUCTS.length + 1, ...body, created_at: new Date().toISOString() }
  return NextResponse.json(newProduct, { status: 201 })
}
