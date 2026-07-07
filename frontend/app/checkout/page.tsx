import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import CheckoutContent from './CheckoutContent'

export const metadata: Metadata = { title: 'Checkout | CommerceFlow' }

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-[120px] pb-16">
        <CheckoutContent />
      </main>
    </div>
  )
}
