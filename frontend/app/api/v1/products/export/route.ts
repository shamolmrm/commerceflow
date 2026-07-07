import { NextResponse } from 'next/server'
import { PRODUCTS } from '../../_mock/data'

export async function GET() {
  const header = 'id,name,sku,price,stock,category,brand\n'
  const rows = PRODUCTS.map(p =>
    `${p.id},"${p.name}",${p.sku},${p.price},${p.total_stock},"${p.category?.name}","${p.brand?.name}"`
  ).join('\n')
  const csv = header + rows
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="products.csv"',
    },
  })
}
