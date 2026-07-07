import { NextRequest, NextResponse } from 'next/server'
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json()
  return NextResponse.json({ id: parseInt((await params).id), ...body })
}
