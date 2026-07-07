import { NextResponse } from 'next/server'
export async function POST() { return NextResponse.json({ detail: 'Successfully subscribed to newsletter.' }) }
