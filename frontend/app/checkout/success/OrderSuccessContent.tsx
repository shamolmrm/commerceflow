'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react'

export default function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const method = searchParams.get('method')

  const methodLabel: Record<string, string> = {
    stripe: 'Your payment was processed successfully.',
    paypal: 'Your PayPal payment was completed.',
    sslcommerz: 'Your mobile banking payment was completed.',
    cod: 'You will pay when the order arrives.',
  }

  return (
    <div className="section-container py-20 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-12 h-12 text-green-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Order Placed!</h1>
        <p className="text-gray-500 mt-3 text-lg">
          {method ? methodLabel[method] : 'Your order has been received.'}
        </p>
        {orderNumber && (
          <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-50 rounded-xl border border-brand-100">
            <Package className="w-4 h-4 text-brand-500" />
            <span className="text-brand-700 font-medium">Order # {orderNumber}</span>
          </div>
        )}

        <p className="text-gray-500 mt-6 max-w-md mx-auto">
          A confirmation email has been sent to you. You can track your order in the customer dashboard.
        </p>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/account/orders" className="btn-primary flex items-center gap-2">
            Track Order
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/" className="btn-outline flex items-center gap-2">
            <Home className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
