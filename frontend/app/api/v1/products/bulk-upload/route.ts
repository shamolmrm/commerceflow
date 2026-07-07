import { NextResponse } from 'next/server'
export async function POST() {
  return NextResponse.json({ created: 5, updated: 2, errors: [], detail: 'Bulk upload processed successfully.' })
}
