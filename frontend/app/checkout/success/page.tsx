import type { Metadata } from 'next'
import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import OrderSuccessContent from './OrderSuccessContent'

export const metadata: Metadata = { title: 'Order Placed! | CommerceFlow' }

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[120px]">
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <OrderSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
