'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, ChevronLeft } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectCart } from '@/store/cartSlice'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, getImageUrl } from '@/lib/utils'

export default function CartContent() {
  const cart = useSelector(selectCart)
  const { refreshCart, updateItem, removeItem, applyCoupon } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  useEffect(() => {
    refreshCart()
  }, [])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setIsApplyingCoupon(true)
    try {
      await applyCoupon(couponCode)
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="section-container py-20 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Add some products to get started</p>
        <Link href="/products" className="btn-primary inline-block mt-6">
          Continue Shopping
        </Link>
      </div>
    )
  }

  const shipping = cart.total >= 50 ? 0 : 5
  const tax = cart.total * 0.05
  const orderTotal = cart.total - cart.discount + shipping + tax

  return (
    <div className="section-container py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/products" className="text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="badge bg-brand-100 text-brand-600">{cart.item_count} items</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className="flex gap-5 p-5 bg-white rounded-2xl border border-gray-100 shadow-card"
              >
                <Link href={`/products/${item.product.slug}`} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  <Image
                    src={getImageUrl(item.product.primary_image?.url)}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-medium text-gray-900 hover:text-brand-500 transition-colors line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  {item.variant_info && (
                    <p className="text-sm text-gray-500 mt-0.5">{item.variant_info}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-4 py-2 font-medium text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-900">{formatCurrency(item.line_total)}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div>
          <div className="sticky top-28 bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({cart.item_count} items)</span>
                <span className="font-medium">{formatCurrency(cart.total)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : 'font-medium'}>
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (5%)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-100">
                <span>Order Total</span>
                <span className="text-brand-500">{formatCurrency(orderTotal)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Coupon Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                  className="px-4 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-70"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {cart.coupon_code && (
                <p className="text-xs text-green-600 mt-1.5">✓ Coupon "{cart.coupon_code}" applied!</p>
              )}
            </div>

            {shipping > 0 && (
              <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                💡 Add ${(50 - cart.total).toFixed(2)} more for free shipping!
              </p>
            )}

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full btn-primary py-3.5 text-base"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link href="/products" className="block text-center text-sm text-gray-500 hover:text-brand-500">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
