import { NextResponse } from 'next/server'
export async function POST() { return NextResponse.json({ detail: 'Password reset successfully.' }) }
