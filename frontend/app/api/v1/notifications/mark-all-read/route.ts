import { NextResponse } from 'next/server'
export async function POST() { return NextResponse.json({ detail: 'All notifications marked as read.' }) }
