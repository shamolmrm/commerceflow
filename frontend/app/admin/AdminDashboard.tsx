'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  DollarSign, ShoppingCart, Users, Package, TrendingUp,
  AlertTriangle, ArrowUpRight, Plus, Eye, BarChart3, Warehouse,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

type Period = '7d' | '30d' | '90d' | '1y'

const STATUS_STYLE: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-600',
}

const QUICK_ACTIONS = [
  { label: 'Add Product',   href: '/admin/products/new',  icon: Plus,       color: 'bg-indigo-500 hover:bg-indigo-600' },
  { label: 'View Orders',   href: '/admin/orders',         icon: ShoppingCart, color: 'bg-emerald-500 hover:bg-emerald-600' },
  { label: 'Inventory',     href: '/admin/inventory',      icon: Warehouse,  color: 'bg-amber-500 hover:bg-amber-600' },
  { label: 'Reports',       href: '/admin/reports',        icon: BarChart3,  color: 'bg-purple-500 hover:bg-purple-600' },
]

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>('30d')

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats/overview/').then((r) => r.data),
    staleTime: 60_000,
  })

  const { data: salesData } = useQuery({
    queryKey: ['admin-sales-report', period],
    queryFn: () =>
      api.get('/admin/reports/sales/', { params: { period } }).then((r) => r.data),
  })

  const { data: topProducts } = useQuery({
    queryKey: ['admin-top-products', period],
    queryFn: () =>
      api.get('/admin/reports/top-products/', { params: { period, limit: 8 } }).then((r) => r.data),
  })

  const { data: recentOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: () =>
      api.get('/orders/', { params: { page_size: 8 } }).then((r) => r.data.results ?? r.data),
  })

  const { data: lowStock } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: () =>
      api.get('/inventory/low-stock/').then((r) => r.data.results ?? r.data),
  })

  const daily = salesData?.daily || []
  const maxRevenue = topProducts?.[0]?.revenue || 1

  const STAT_CARDS = [
    {
      label: 'Total Revenue',
      value: stats?.total_revenue || 0,
      sub: stats ? `${formatCurrency(stats.revenue_this_month)} this month` : '—',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/25',
      format: 'currency',
    },
    {
      label: 'Total Orders',
      value: stats?.total_orders || 0,
      sub: stats ? `${stats.orders_this_month} this month` : '—',
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-indigo-500',
      glow: 'shadow-blue-500/25',
      format: 'number',
    },
    {
      label: 'Customers',
      value: stats?.total_customers || 0,
      sub: stats ? `+${stats.new_customers_this_month} new this month` : '—',
      icon: Users,
      gradient: 'from-violet-500 to-purple-500',
      glow: 'shadow-violet-500/25',
      format: 'number',
    },
    {
      label: 'Products',
      value: stats?.total_products || 0,
      sub: stats ? `${stats.active_products} active` : '—',
      icon: Package,
      gradient: 'from-orange-500 to-amber-500',
      glow: 'shadow-orange-500/25',
      format: 'number',
    },
  ]

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 self-start sm:self-auto">
          {(['7d', '30d', '90d', '1y'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p === '1y' ? '1 Year' : p === '90d' ? '3 Mo' : p === '30d' ? '30 Days' : '7 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Low-stock alert */}
      {stats && (stats.low_stock_count > 0 || stats.out_of_stock_count > 0) && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm text-amber-800 flex-1">
            <span className="font-semibold">{stats.low_stock_count} products</span> running low on stock
            {stats.out_of_stock_count > 0 && (
              <>, <span className="font-semibold">{stats.out_of_stock_count}</span> out of stock</>
            )}
          </p>
          <Link
            href="/admin/inventory"
            className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            Fix now <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${card.gradient} shadow-xl ${card.glow}`}
            >
              {/* Decorative circle */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 -right-2 w-20 h-20 bg-white/5 rounded-full" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-white/80 text-sm font-medium">{card.label}</p>
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold leading-none">
                  {card.format === 'currency'
                    ? formatCurrency(card.value)
                    : <AnimatedCounter value={card.value} />
                  }
                </p>
                <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {card.sub}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(({ label, href, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${color} shadow-sm`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue area chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Revenue</h2>
              <p className="text-xs text-gray-400 mt-0.5">{period} period</p>
            </div>
            {salesData?.total_revenue && (
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                {formatCurrency(salesData.total_revenue)}
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={45} />
              <Tooltip
                formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          {daily.length === 0 && <p className="text-center text-sm text-gray-400 -mt-8">No data for this period</p>}
        </div>

        {/* Orders bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Orders</h2>
              <p className="text-xs text-gray-400 mt-0.5">{period} period</p>
            </div>
            {salesData?.total_orders && (
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                {salesData.total_orders} orders
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {daily.length === 0 && <p className="text-center text-sm text-gray-400 -mt-8">No data for this period</p>}
        </div>
      </div>

      {/* Top products + Low stock */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Top Products</h2>
            <Link href="/admin/products" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {topProducts?.length ? (
            <div className="space-y-3.5">
              {topProducts.slice(0, 8).map((p: any, i: number) => (
                <div key={p.id ?? i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all duration-700"
                          style={{ width: `${((p.revenue || 0) / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 w-14 text-right">{p.total_sold} sold</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Package className="w-10 h-10 mb-2 text-gray-200" />
              <p className="text-sm">No sales data yet</p>
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="font-bold text-gray-900">Low Stock Alerts</h2>
            {lowStock?.length > 0 && (
              <span className="ml-auto px-2.5 py-0.5 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full border border-amber-200">
                {lowStock.length} items
              </span>
            )}
          </div>
          {lowStock?.length ? (
            <div className="space-y-2">
              {lowStock.slice(0, 8).map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-amber-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {inv.product_name || inv.product?.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{inv.warehouse_name || inv.warehouse?.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className={`text-sm font-bold ${inv.quantity === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {inv.quantity} left
                    </span>
                    <p className="text-[10px] text-gray-400">min: {inv.low_stock_threshold}</p>
                  </div>
                </div>
              ))}
              <Link
                href="/admin/inventory?tab=low"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors mt-2"
              >
                View all low stock <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-500 text-lg">✓</span>
              </div>
              <p className="text-sm font-medium text-gray-600">All products well stocked</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3">Order</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3 hidden sm:table-cell">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 hidden md:table-cell">Payment</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders?.length ? (
                recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-3 font-semibold text-indigo-600">
                      <Link href={`/admin/orders?id=${order.order_number}`} className="hover:underline">
                        #{order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-700 max-w-[120px] truncate">
                      {order.customer_name || order.customer_email || '—'}
                    </td>
                    <td className="py-3 text-gray-400 text-xs hidden sm:table-cell">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
