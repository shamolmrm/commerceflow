import { NextResponse } from 'next/server'

const generateDailyData = (days: number) => {
  const data = []
  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    data.push({
      date: label,
      orders: Math.floor(8 + Math.random() * 22),
      revenue: parseFloat((800 + Math.random() * 3200).toFixed(2)),
    })
  }
  return data
}

export async function GET() {
  const daily = generateDailyData(29)
  const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = daily.reduce((s, d) => s + d.orders, 0)
  return NextResponse.json({
    daily,
    total_revenue: parseFloat(totalRevenue.toFixed(2)),
    total_orders: totalOrders,
    avg_order_value: parseFloat((totalRevenue / totalOrders).toFixed(2)),
  })
}
