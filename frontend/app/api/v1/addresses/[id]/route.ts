import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  return NextResponse.json({ id: Number(id), ...body })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await params
  return NextResponse.json({ detail: 'Address deleted.' })
}
