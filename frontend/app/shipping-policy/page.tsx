import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Truck, Clock, Globe, Package, AlertCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'Shipping Policy | CommerceFlow' }

const SHIPPING_METHODS = [
  { name: 'Standard Shipping', time: '5–7 Business Days', cost: '$5.99', note: 'Free on orders over $50' },
  { name: 'Express Shipping', time: '2–3 Business Days', cost: '$12.99', note: 'Available for most locations' },
  { name: 'Overnight Shipping', time: 'Next Business Day', cost: '$24.99', note: 'Order by 12pm local time' },
  { name: 'Same-Day Delivery', time: 'Same Day', cost: '$19.99', note: 'Select cities only' },
]

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-[120px] pb-16">
        <div className="section-container py-8 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-brand-500">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">Shipping Policy</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Shipping Policy</h1>
            <p className="text-gray-500 mt-3">Fast, reliable delivery to your door. Free shipping on orders over $50.</p>
          </div>

          {/* Shipping methods */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-brand-500" /> Shipping Methods & Rates</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Method</th>
                    <th className="pb-3 font-medium">Delivery Time</th>
                    <th className="pb-3 font-medium">Cost</th>
                    <th className="pb-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {SHIPPING_METHODS.map((m) => (
                    <tr key={m.name}>
                      <td className="py-3 font-medium text-gray-900">{m.name}</td>
                      <td className="py-3 text-gray-600">{m.time}</td>
                      <td className="py-3 text-brand-500 font-semibold">{m.cost}</td>
                      <td className="py-3 text-gray-400 text-xs">{m.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-5">
            {[
              {
                icon: Package,
                title: 'Order Processing',
                content: 'Orders are processed Monday–Friday, excluding public holidays. Orders placed before 2pm EST on business days are typically shipped the same day. Orders placed after 2pm or on weekends are processed the next business day. You\'ll receive a shipping confirmation email with a tracking number once your order ships.',
              },
              {
                icon: Globe,
                title: 'International Shipping',
                content: `We ship to 50+ countries worldwide. International shipping rates and delivery times vary by destination:
• Asia Pacific: 7–14 business days ($15–$25)
• Europe: 10–18 business days ($20–$35)
• Americas: 7–14 business days ($15–$30)
• Rest of World: 14–21 business days ($25–$45)

International orders may be subject to customs duties and import taxes, which are the responsibility of the recipient.`,
              },
              {
                icon: AlertCircle,
                title: 'Important Notes',
                content: `• Delivery times are estimates and may vary due to carrier delays, weather, or customs
• We are not responsible for delays caused by incorrect shipping addresses
• Signature may be required for high-value orders (over $200)
• P.O. Boxes are supported for standard shipping only
• Some items (large/heavy/hazardous) may have shipping restrictions`,
              },
            ].map(({ icon: Icon, title, content }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-brand-500" />
                  {title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-brand-50 rounded-2xl p-6 text-center border border-brand-100">
            <p className="text-gray-700 font-medium mb-2">Questions about your shipment?</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <Link href="/contact" className="btn-primary">Contact Support</Link>
              <Link href="/account/orders" className="btn-outline">Track Order</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
