import { NextRequest, NextResponse } from 'next/server'
import { PRODUCTS } from '../../_mock/data'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = PRODUCTS.find(p => p.slug === slug) || PRODUCTS.find(p => String(p.id) === slug)
  if (!product) return NextResponse.json({ detail: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...product, is_wishlisted: false })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const body = await req.json()
  const product = PRODUCTS.find(p => p.slug === slug || String(p.id) === slug)
  if (!product) return NextResponse.json({ detail: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...product, ...body })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return NextResponse.json({}, { status: 204 })
}
