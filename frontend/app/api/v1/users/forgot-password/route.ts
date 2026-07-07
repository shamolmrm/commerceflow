import { NextResponse } from 'next/server'
export async function POST() { return NextResponse.json({ detail: 'OTP sent to your email. (Demo: use 123456)' }) }
