import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartContent from './CartContent'

export const metadata: Metadata = { title: 'Shopping Cart' }

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[120px]">
        <CartContent />
      </main>
      <Footer />
    </div>
  )
}
