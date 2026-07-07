'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { Download, TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'

const PERIODS = [
  { label: '7 Days',  value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year',  value: '1y' },
] as const

type Period = typeof PERIODS[number]['value']

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<Period>('30d')

  const { data: salesData } = useQuery({
    queryKey: ['report-sales', period],
    queryFn: () => api.get('/admin/reports/sales/', { params: { period } }).then((r) => r.data),
  })

  const { data: topProducts } = useQuery({
    queryKey: ['report-top-products', period],
    queryFn: () => api.get('/admin/reports/top-products/', { params: { period, limit: 8 } }).then((r) => r.data),
  })

  const { data: customerData } = useQuery({
    queryKey: ['report-customers', period],
    queryFn: () => api.get('/admin/reports/customers/', { params: { period } }).then((r) => r.data),
  })

  const handleExport = async (type: 'csv' | 'excel') => {
    const res = await api.get('/admin/reports/export/', {
      params: { period, format: type },
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${period}.${type === 'csv' ? 'csv' : 'xlsx'}`
    a.click()
  }

  const daily: any[] = salesData?.daily || []

  const summaryCards = [
    { label: 'Total Revenue',   value: formatCurrency(salesData?.total_revenue ?? 0),   icon: DollarSign,   gradient: 'from-emerald-500 to-teal-500',   glow: 'shadow-emerald-500/20' },
    { label: 'Total Orders',    value: String(salesData?.total_orders ?? 0),             icon: ShoppingCart, gradient: 'from-blue-500 to-indigo-500',     glow: 'shadow-blue-500/20' },
    { label: 'Avg Order Value', value: formatCurrency(salesData?.avg_order_value ?? 0),  icon: TrendingUp,   gradient: 'from-violet-500 to-purple-500',   glow: 'shadow-violet-500/20' },
    { label: 'New Customers',   value: String(customerData?.total_new_customers ?? 0),   icon: Users,        gradient: 'from-orange-500 to-amber-500',    glow: 'shadow-orange-500/20' },
  ]

  const maxRev = topProducts?.[0]?.revenue || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Business performance overview</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${s.gradient} shadow-lg ${s.glow}`}
            >
              <div className="absolute -top-3 -right-3 w-20 h-20 bg-white/10 rounded-full" />
              <div className="relative">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-white/75 text-xs font-medium mb-1">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-gray-900">Revenue Over Time</h2>
            <p className="text-xs text-gray-400 mt-0.5">{period} period</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={daily}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} width={50} />
            <Tooltip
              formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.1)', fontSize: 12 }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        {daily.length === 0 && <p className="text-center text-sm text-gray-400 -mt-4">No data for this period</p>}
      </div>

      {/* Top products + New customers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Top Products by Revenue</h2>
          {topProducts?.length ? (
            <div className="space-y-3.5">
              {topProducts.map((p: any, i: number) => (
                <div key={p.id ?? i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                          style={{ width: `${((p.revenue || 0) / maxRev) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 w-12 text-right">{p.total_sold} sold</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data available</div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">New Customers Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={customerData?.new_customers || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(v: number) => [v, 'New Customers']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.1)', fontSize: 12 }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {(customerData?.new_customers?.length ?? 0) === 0 && (
            <p className="text-center text-sm text-gray-400 -mt-4">No customer data for this period</p>
          )}
        </div>
      </div>

      {/* Top customers */}
      {customerData?.top_customers?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Top Customers</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3">#</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3 text-center">Orders</th>
                <th className="pb-3 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customerData.top_customers.map((c: any, i: number) => (
                <tr key={c.customer_id ?? i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-gray-400 font-bold text-xs">{i + 1}</td>
                  <td className="py-3">
                    <p className="font-semibold text-gray-900">{c.name || '—'}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold">{c.total_orders}</span>
                  </td>
                  <td className="py-3 text-right font-bold text-gray-900">{formatCurrency(c.total_spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
