import { NextResponse } from 'next/server'
import { BRANDS } from '../_mock/data'

export async function GET() {
  return NextResponse.json({ count: BRANDS.length, next: null, previous: null, results: BRANDS })
}
