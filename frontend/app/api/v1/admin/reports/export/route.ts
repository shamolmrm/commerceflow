import { NextResponse } from 'next/server'
export async function GET() {
  const csv = 'Date,Orders,Revenue\n2024-12-01,15,3200.50\n2024-12-02,18,4100.00\n2024-12-03,12,2800.75'
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="report.csv"' } })
}
