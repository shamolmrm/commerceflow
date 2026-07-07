'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Download, Package } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import api from '@/lib/api'
import type { Order } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params)

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}/`).then((r) => r.data),
  })

  const handleInvoiceDownload = async () => {
    if (!order) return
    const response = await api.get(`/orders/${order.id}/invoice/`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${order.order_number}.pdf`
    a.click()
  }

  if (isLoading) return <div className="skeleton h-96 rounded-2xl" />

  if (!order) return <div className="text-center py-16 text-gray-500">Order not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{order.order_number}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{item.product_name}</p>
                {item.variant_info && <p className="text-sm text-gray-500">{item.variant_info}</p>}
                <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
              </div>
              <span className="font-bold text-gray-900">{formatCurrency(item.total_price)}</span>
            </div>
          ))}
        </div>
        <div className="pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount_amount)}</span></div>}
          <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shipping_cost === 0 ? 'Free' : formatCurrency(order.shipping_cost)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatCurrency(order.tax_amount)}</span></div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
            <span>Total</span>
            <span className="text-brand-500">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      {order.shipping_address && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="font-bold text-gray-900 mb-3">Shipping Address</h2>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p className="font-medium text-gray-900">{order.shipping_address.full_name}</p>
            <p>{order.shipping_address.phone}</p>
            <p>{order.shipping_address.address_line1}</p>
            {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
            <p>{order.shipping_address.country}</p>
          </div>
        </div>
      )}

      {/* Status history */}
      {order.status_history && order.status_history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="font-bold text-gray-900 mb-4">Order Timeline</h2>
          <div className="space-y-4">
            {order.status_history.map((h: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-brand-500 mt-0.5" />
                  {i < (order.status_history?.length ?? 0) - 1 && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium text-gray-900 capitalize">{h.status}</p>
                  <p className="text-xs text-gray-500">{formatDate(h.created_at)}</p>
                  {h.notes && <p className="text-xs text-gray-500 mt-0.5">{h.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleInvoiceDownload} className="btn-outline flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Invoice
        </button>
      </div>
    </div>
  )
}
