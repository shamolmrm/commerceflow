import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, RotateCcw, Clock, CheckCircle, XCircle, Package } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'Returns & Refunds | CommerceFlow' }

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-[120px] pb-16">
        <div className="section-container py-8 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-brand-500">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">Returns & Refunds</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Returns & Refunds Policy</h1>
            <p className="text-gray-500 mt-3">30-day hassle-free returns. Your satisfaction is our priority.</p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: Clock, label: '30 Days', sub: 'Return Window', color: 'bg-blue-50 text-blue-600' },
              { icon: CheckCircle, label: 'Free Returns', sub: 'Prepaid Label', color: 'bg-green-50 text-green-600' },
              { icon: Package, label: '3-5 Days', sub: 'Refund Processing', color: 'bg-brand-50 text-brand-600' },
            ].map(({ icon: Icon, label, sub, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 text-center">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            ))}
          </div>

          {/* Policy content */}
          <div className="space-y-6">
            {[
              {
                title: '1. Return Eligibility',
                content: `To be eligible for a return, your item must be:
• Unused and in the same condition you received it
• In the original packaging with all tags and accessories
• Returned within 30 days of the delivery date
• Accompanied by your order number or receipt`,
              },
              {
                title: '2. Non-Returnable Items',
                icon: XCircle,
                content: `The following items cannot be returned:
• Digital products and software licenses
• Perishable goods (food, flowers, newspapers)
• Personalized or custom-made products
• Intimate or sanitary goods for hygiene reasons
• Hazardous materials or flammable liquids`,
              },
              {
                title: '3. How to Initiate a Return',
                content: `Step 1: Log in to your account and go to My Account → Orders
Step 2: Select the order and click "Return Item"
Step 3: Choose the items and reason for return
Step 4: We'll email you a prepaid return shipping label within 24 hours
Step 5: Pack items securely and drop off at any authorized shipping location`,
              },
              {
                title: '4. Refund Process',
                content: `Once we receive and inspect your returned item:
• We'll notify you by email within 2 business days
• Approved refunds are processed within 3-5 business days
• Refunds are credited to your original payment method
• Your bank may take an additional 2-3 days to post the credit
• Original shipping charges are non-refundable (unless the return is due to our error)`,
              },
              {
                title: '5. Exchanges',
                content: `We offer free exchanges for the same product in a different size or color, subject to availability. To exchange, initiate a return as described above and place a new order for the replacement item. We'll process your refund once we receive the original.`,
              },
              {
                title: '6. Damaged or Defective Items',
                content: `If you received a damaged or defective item, please contact us within 48 hours of delivery at support@commerceflow.com with:
• Your order number
• Photos of the damage/defect
• Description of the issue

We'll arrange a free return and send a replacement or full refund immediately.`,
              },
            ].map(({ title, content, icon: Icon }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="font-bold text-gray-900 mb-3">{title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-brand-50 rounded-2xl p-6 text-center border border-brand-100">
            <p className="text-gray-700 font-medium mb-2">Have a return or refund question?</p>
            <p className="text-sm text-gray-500 mb-4">Our team is available 24/7 to assist you.</p>
            <Link href="/contact" className="btn-primary">Contact Support</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
