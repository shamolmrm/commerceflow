import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Return a minimal PDF-like response (text placeholder)
  const pdfContent = `%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n%%EOF`
  return new NextResponse(pdfContent, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
    },
  })
}
