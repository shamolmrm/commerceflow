import type { Metadata } from 'next'
import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CategoriesContent from './CategoriesContent'

export const metadata: Metadata = {
  title: 'All Categories | CommerceFlow',
  description: 'Browse all product categories — electronics, fashion, beauty, sports and more.',
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-[120px] pb-16">
        <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <CategoriesContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
