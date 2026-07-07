import { NextResponse } from 'next/server'

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await params
  return NextResponse.json({ detail: 'Notification marked as read.' })
}
