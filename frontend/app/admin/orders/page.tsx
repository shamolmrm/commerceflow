'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Download, Eye, X, ShoppingCart } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

const STATUS_STYLE: Record<string, string> = {
  all:        'bg-gray-100 text-gray-600',
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-500',
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [detailOrder, setDetailOrder] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, status, page],
    queryFn: () => api.get('/orders/', {
      params: {
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        page,
        page_size: 20,
      },
    }).then((r) => r.data),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/orders/${id}/update-status/`, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Order status updated')
      if (detailOrder?.id === vars.id) setDetailOrder((prev: any) => ({ ...prev, status: vars.status }))
    },
  })

  const handleInvoiceDownload = async (orderId: number, orderNumber: string) => {
    const res = await api.get(`/orders/${orderId}/invoice/`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${orderNumber}.pdf`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.count ?? '—'} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by order # or customer..."
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-full sm:w-64"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                status === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left">
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Payment</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>{[1,2,3,4,5,6,7].map((j) => (
                      <td key={j} className="px-4 py-3.5"><div className="skeleton h-5 rounded-lg" /></td>
                    ))}</tr>
                  ))
                : data?.results?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-3.5 font-semibold text-indigo-600">
                        #{order.order_number}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 max-w-[140px] truncate">
                        {order.customer_name || order.user?.email}
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 text-xs hidden sm:table-cell">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          order.payment_status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.payment_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                            className={`pr-5 pl-2.5 py-0.5 rounded-full text-xs font-semibold border-0 cursor-pointer appearance-none ${getStatusColor(order.status)}`}
                          >
                            {['pending','processing','shipped','delivered','cancelled','refunded'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDetailOrder(order)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleInvoiceDownload(order.id, order.order_number)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Download invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {data && data.count > 20 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 text-xs">
            <span className="text-gray-500">{data.count} total orders</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={!data.previous} className="px-3 py-1.5 border border-gray-200 rounded-lg font-medium hover:bg-white disabled:opacity-40 transition-colors">← Prev</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={!data.next} className="px-3 py-1.5 border border-gray-200 rounded-lg font-medium hover:bg-white disabled:opacity-40 transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Order #{detailOrder.order_number}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(detailOrder.created_at)}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Customer</p>
                  <p className="font-semibold text-gray-900">{detailOrder.customer_name || detailOrder.user?.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="font-bold text-indigo-600 text-lg">{formatCurrency(detailOrder.total)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2">Order Status</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[detailOrder.status] || 'bg-gray-100 text-gray-600'}`}>
                    {detailOrder.status}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2">Payment</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${detailOrder.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {detailOrder.payment_status}
                  </span>
                </div>
              </div>

              {/* Items */}
              {detailOrder.items?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {detailOrder.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.total_price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="flex gap-2 flex-wrap">
                  {['pending','processing','shipped','delivered','cancelled','refunded'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatusMutation.mutate({ id: detailOrder.id, status: s })}
                      disabled={detailOrder.status === s}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all disabled:opacity-50 ${
                        detailOrder.status === s
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
