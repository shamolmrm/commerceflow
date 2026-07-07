'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronRight, Download, ExternalLink } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import api from '@/lib/api'
import type { Order } from '@/types'

const STATUS_TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', statusFilter],
    queryFn: () => api.get('/orders/', {
      params: statusFilter !== 'all' ? { status: statusFilter } : undefined,
    }).then((r) => r.data.results ?? r.data),
  })

  const handleInvoiceDownload = async (orderId: number) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice/`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderId}.pdf`
      a.click()
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === s ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : !data?.length ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-16 text-center">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-900">No orders found</p>
          <p className="text-sm text-gray-500 mt-1">Your orders will appear here once placed</p>
          <Link href="/products" className="btn-primary inline-block mt-4">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(data as Order[]).map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-gray-900">#{order.order_number}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-500 text-lg">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-gray-400">{order.items?.length || 0} items</p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {order.items.slice(0, 3).map((item: any) => (
                    <span key={item.id} className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                      {item.product_name} ×{item.quantity}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium"
                >
                  View Details <ChevronRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => handleInvoiceDownload(order.id)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
