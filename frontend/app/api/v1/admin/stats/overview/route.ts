import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    total_revenue: 284750.60,
    revenue_this_month: 38420.50,
    orders_this_month: 312,
    new_customers_this_month: 87,
    total_orders: 4821,
    active_products: 298,
    total_products: 312,
    total_customers: 1543,
    low_stock_count: 14,
    out_of_stock_count: 3,
  })
}
