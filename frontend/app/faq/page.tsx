'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const FAQS = [
  {
    category: 'Orders & Shipping',
    items: [
      { q: 'How long does shipping take?', a: 'Standard shipping takes 5-7 business days. Express shipping (2-3 days) and same-day delivery (select cities) are also available at checkout.' },
      { q: 'Do you offer free shipping?', a: 'Yes! Orders over $50 qualify for free standard shipping. Use code WELCOME10 for 10% off your first order.' },
      { q: 'Can I track my order?', a: 'Absolutely. Once your order ships, you\'ll receive a tracking number via email. You can also view order status in My Account → Orders.' },
      { q: 'Can I change or cancel my order?', a: 'Orders can be modified or cancelled within 1 hour of placement. After that, please contact support and we\'ll do our best to help.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'We offer a 30-day hassle-free return policy. Items must be unused, in original packaging, with all tags attached.' },
      { q: 'How do I initiate a return?', a: 'Go to My Account → Orders → select the order → click "Return Item". We\'ll email you a prepaid return label within 24 hours.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 3-5 business days after we receive your return. Your bank may take an additional 2-3 days to post the credit.' },
      { q: 'Are there items that cannot be returned?', a: 'Digital products, perishables, personalized items, and intimate apparel cannot be returned for hygiene reasons.' },
    ],
  },
  {
    category: 'Payments & Security',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, American Express, PayPal, Stripe, SSLCommerz (for Bangladesh), and Cash on Delivery.' },
      { q: 'Is my payment information secure?', a: 'Yes. We use 256-bit SSL encryption and are PCI DSS compliant. We never store your full card details on our servers.' },
      { q: 'Can I pay in installments?', a: 'Yes, we offer Buy Now Pay Later via Stripe. You can split eligible orders into 4 interest-free payments at checkout.' },
      { q: 'Why was my payment declined?', a: 'Common reasons include incorrect card details, insufficient funds, or your bank blocking the transaction. Try a different card or contact your bank.' },
    ],
  },
  {
    category: 'Account & Profile',
    items: [
      { q: 'How do I create an account?', a: 'Click "Sign Up" in the top right corner. Fill in your name, email, and a secure password. You\'ll receive a confirmation email to activate your account.' },
      { q: 'I forgot my password. What should I do?', a: 'Click "Forgot password?" on the login page. Enter your email and we\'ll send you a reset link valid for 24 hours.' },
      { q: 'Can I have multiple shipping addresses?', a: 'Yes! Go to My Account → Addresses to add and manage multiple delivery addresses. You can set a default address for faster checkout.' },
      { q: 'How do I delete my account?', a: 'Please contact our support team at support@commerceflow.com. Account deletion is permanent and cannot be undone.' },
    ],
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-[120px] pb-16">
        <div className="section-container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-brand-500">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">FAQ</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Find answers to the most common questions about orders, shipping, returns, payments, and your account.
            </p>
          </div>

          {/* FAQ sections */}
          <div className="max-w-3xl mx-auto space-y-8">
            {FAQS.map((section) => (
              <div key={section.category}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">{section.category}</h2>
                <div className="space-y-2">
                  {section.items.map((faq) => {
                    const key = `${section.category}-${faq.q}`
                    const isOpen = open === key
                    return (
                      <div key={faq.q} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <button
                          onClick={() => setOpen(isOpen ? null : key)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left"
                        >
                          <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Still need help */}
          <div className="max-w-3xl mx-auto mt-12 bg-brand-50 rounded-2xl p-8 text-center border border-brand-100">
            <h3 className="font-bold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-500 text-sm mb-4">Our support team is available 24/7 to help you.</p>
            <Link href="/contact" className="btn-primary">Contact Us</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
