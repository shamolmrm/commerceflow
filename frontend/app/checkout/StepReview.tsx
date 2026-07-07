'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, CheckCircle } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { clearCart } from '@/store/cartSlice'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Cart } from '@/types'
import type { CheckoutData } from './CheckoutContent'

interface Props {
  data: CheckoutData
  cart: Cart
  onUpdate: (notes: string) => void
  onBack: () => void
}

export default function StepReview({ data, cart, onUpdate, onBack }: Props) {
  const router = useRouter()
  const dispatch = useDispatch()
  const [notes, setNotes] = useState(data.notes)
  const [isPlacing, setIsPlacing] = useState(false)

  const shipping = cart.total >= 50 ? 0 : 5
  const tax = cart.total * 0.05
  const orderTotal = cart.total - cart.discount + shipping + tax

  const handlePlaceOrder = async () => {
    setIsPlacing(true)
    try {
      const payload = {
        shipping_address: data.address,
        payment_method: data.payment_method,
        notes,
      }
      const response = await api.post('/orders/create/', payload)
      const order = response.data

      if (data.payment_method === 'stripe') {
        // Initiate Stripe payment
        const paymentRes = await api.post('/payments/stripe/initiate/', { order_id: order.id })
        const { client_secret, payment_intent_id } = paymentRes.data
        // For now redirect to success — in production you'd use Stripe.js
        dispatch(clearCart())
        router.push(`/checkout/success?order=${order.order_number}&method=stripe&pi=${payment_intent_id}`)
      } else if (data.payment_method === 'paypal') {
        const paymentRes = await api.post('/payments/paypal/initiate/', { order_id: order.id })
        dispatch(clearCart())
        router.push(`/checkout/success?order=${order.order_number}&method=paypal`)
      } else if (data.payment_method === 'sslcommerz') {
        const paymentRes = await api.post('/payments/sslcommerz/initiate/', { order_id: order.id })
        const { redirect_url } = paymentRes.data
        dispatch(clearCart())
        if (redirect_url) window.location.href = redirect_url
        else router.push(`/checkout/success?order=${order.order_number}&method=sslcommerz`)
      } else {
        // COD
        dispatch(clearCart())
        router.push(`/checkout/success?order=${order.order_number}&method=cod`)
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to place order. Please try again.'
      toast.error(msg)
      setIsPlacing(false)
    }
  }

  const methodLabel: Record<string, string> = {
    stripe: 'Credit / Debit Card (Stripe)',
    paypal: 'PayPal',
    sslcommerz: 'Mobile Banking (SSLCommerz)',
    cod: 'Cash on Delivery',
  }

  return (
    <div className="space-y-5">
      {/* Shipping summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Shipping To</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-900">{data.address.full_name}</p>
          <p>{data.address.phone}</p>
          <p>{data.address.address_line1}{data.address.address_line2 ? `, ${data.address.address_line2}` : ''}</p>
          <p>{data.address.city}, {data.address.state} {data.address.postal_code}</p>
          <p>{data.address.country}</p>
        </div>
      </div>

      {/* Payment summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Payment Method</h3>
        <p className="text-sm text-gray-700">{methodLabel[data.payment_method]}</p>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Order Items ({cart.item_count})</h3>
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.product.name}
                {item.variant_info && <span className="text-gray-400"> ({item.variant_info})</span>}
                <span className="text-gray-400 ml-1">×{item.quantity}</span>
              </span>
              <span className="font-medium">{formatCurrency(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(cart.total)}</span></div>
          {cart.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(cart.discount)}</span></div>}
          <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Tax (5%)</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
            <span>Order Total</span>
            <span className="text-brand-500">{formatCurrency(orderTotal)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h3 className="font-bold text-gray-900 mb-3">Order Notes (Optional)</h3>
        <textarea
          value={notes}
          onChange={(e) => { setNotes(e.target.value); onUpdate(e.target.value) }}
          rows={3}
          placeholder="Any special instructions for your order..."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-outline flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          className="btn-primary flex items-center gap-2 px-8"
        >
          {isPlacing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Place Order
            </>
          )}
        </button>
      </div>
    </div>
  )
}
