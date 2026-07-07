'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, MapPin, CreditCard, ClipboardList, ChevronRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectCart } from '@/store/cartSlice'
import { formatCurrency } from '@/lib/utils'
import StepShipping from './StepShipping'
import StepPayment from './StepPayment'
import StepReview from './StepReview'

export type CheckoutData = {
  address: {
    id?: number
    full_name: string
    phone: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  payment_method: 'stripe' | 'paypal' | 'sslcommerz' | 'cod'
  notes: string
}

const STEPS = [
  { id: 1, label: 'Shipping', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: ClipboardList },
]

export default function CheckoutContent() {
  const router = useRouter()
  const cart = useSelector(selectCart)
  const [step, setStep] = useState(1)
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    address: {
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
    payment_method: 'stripe',
    notes: '',
  })

  const updateData = (partial: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...partial }))
  }

  if (!cart || cart.items.length === 0) {
    router.replace('/cart')
    return null
  }

  const shipping = cart.total >= 50 ? 0 : 5
  const tax = cart.total * 0.05
  const orderTotal = cart.total - cart.discount + shipping + tax

  return (
    <div className="section-container">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isCompleted = step > s.id
          const isCurrent = step === s.id
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-brand-500 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-sm font-medium ${isCurrent ? 'text-brand-500' : isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-400' : 'bg-gray-100'}`} style={{ minWidth: 40 }} />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main step content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <StepShipping
                  data={checkoutData.address}
                  onUpdate={(address) => updateData({ address })}
                  onNext={() => setStep(2)}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <StepPayment
                  selected={checkoutData.payment_method}
                  onUpdate={(payment_method) => updateData({ payment_method })}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <StepReview
                  data={checkoutData}
                  cart={cart}
                  onUpdate={(notes) => updateData({ notes })}
                  onBack={() => setStep(2)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="sticky top-28 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                    {item.product.name}
                    {item.variant_info && <span className="text-gray-400"> ({item.variant_info})</span>}
                    <span className="text-gray-400"> ×{item.quantity}</span>
                  </span>
                  <span className="font-medium flex-shrink-0">{formatCurrency(item.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(cart.total)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-brand-500">{formatCurrency(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
