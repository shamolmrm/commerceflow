'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { selectCart, selectCartOpen, closeCart } from '@/store/cartSlice'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, getImageUrl } from '@/lib/utils'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const cart = useSelector(selectCart)
  const isOpen = useSelector(selectCartOpen)
  const { updateItem, removeItem, refreshCart } = useCart()

  useEffect(() => {
    if (isOpen) refreshCart()
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => dispatch(closeCart())}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-500" />
                <h2 className="font-semibold text-gray-900">Shopping Cart</h2>
                {cart && cart.item_count > 0 && (
                  <span className="ml-1 bg-brand-100 text-brand-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {cart.item_count}
                  </span>
                )}
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {!cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
                  <p className="text-sm text-gray-500 mt-1">Add items to start shopping</p>
                  <Link
                    href="/products"
                    onClick={() => dispatch(closeCart())}
                    className="mt-6 btn-primary inline-block"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                cart.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-brand-200 transition-colors"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={getImageUrl(item.product.primary_image?.url)}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
                      {item.variant_info && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.variant_info}</p>
                      )}
                      <p className="text-sm font-semibold text-brand-500 mt-1">
                        {formatCurrency(item.unit_price)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateItem(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      {formatCurrency(item.line_total)}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-4 space-y-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(cart.total)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Coupon discount</span>
                    <span>-{formatCurrency(cart.discount)}</span>
                  </div>
                )}
                <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout</p>
                <div className="flex gap-3">
                  <Link
                    href="/cart"
                    onClick={() => dispatch(closeCart())}
                    className="flex-1 text-center border-2 border-brand-500 text-brand-500 font-medium py-2.5 rounded-button hover:bg-brand-50 transition-colors text-sm"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => dispatch(closeCart())}
                    className="flex-1 btn-primary text-center text-sm flex items-center justify-center gap-2"
                  >
                    Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
