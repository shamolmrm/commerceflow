import { NextResponse } from 'next/server'
import { CATEGORIES } from '../_mock/data'

export async function GET() {
  return NextResponse.json({ count: CATEGORIES.length, next: null, previous: null, results: CATEGORIES })
}
