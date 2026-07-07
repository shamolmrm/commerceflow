import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json()
  return NextResponse.json({ id: (await params).id, ...body, message: 'Inventory adjusted successfully' })
}
