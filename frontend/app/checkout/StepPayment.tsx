'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, CreditCard, Smartphone, Truck } from 'lucide-react'
import type { CheckoutData } from './CheckoutContent'

type PaymentMethod = CheckoutData['payment_method']

const METHODS = [
  {
    id: 'stripe' as PaymentMethod,
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, Amex via Stripe',
    icon: CreditCard,
    badge: 'Most Popular',
  },
  {
    id: 'paypal' as PaymentMethod,
    label: 'PayPal',
    description: 'Pay securely with your PayPal account',
    icon: null,
    badge: null,
  },
  {
    id: 'sslcommerz' as PaymentMethod,
    label: 'Mobile Banking',
    description: 'bKash, Nagad, Rocket & more (SSLCommerz)',
    icon: Smartphone,
    badge: 'BD Only',
  },
  {
    id: 'cod' as PaymentMethod,
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: Truck,
    badge: null,
  },
]

interface Props {
  selected: PaymentMethod
  onUpdate: (method: PaymentMethod) => void
  onNext: () => void
  onBack: () => void
}

export default function StepPayment({ selected, onUpdate, onNext, onBack }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-5 h-5 text-brand-500" />
        <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
      </div>

      <div className="space-y-3 mb-8">
        {METHODS.map((method) => {
          const Icon = method.icon
          return (
            <label
              key={method.id}
              className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                selected === method.id ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={selected === method.id}
                onChange={() => onUpdate(method.id)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selected === method.id ? 'border-brand-500' : 'border-gray-300'
              }`}>
                {selected === method.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
              </div>
              {Icon ? (
                <Icon className={`w-6 h-6 flex-shrink-0 ${selected === method.id ? 'text-brand-500' : 'text-gray-400'}`} />
              ) : (
                <span className="font-bold text-blue-600 text-sm flex-shrink-0">PayPal</span>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 text-sm">{method.label}</p>
                  {method.badge && (
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-600 text-xs rounded-full">{method.badge}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
              </div>
            </label>
          )
        })}
      </div>

      {selected === 'stripe' && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Card details will be collected securely on the next step via Stripe.
          </p>
        </div>
      )}

      {selected === 'cod' && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-6">
          <p className="text-sm text-amber-700">
            Cash on Delivery available. Please have exact amount ready. Extra $2 COD fee may apply.
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-outline flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          Review Order
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
