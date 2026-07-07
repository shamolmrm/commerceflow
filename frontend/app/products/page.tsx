import type { Metadata } from 'next'
import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductsContent from './ProductsContent'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our complete collection of premium products.',
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[120px]">
        <Suspense fallback={<div className="min-h-[600px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <ProductsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
