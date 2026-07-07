import type { Metadata } from 'next'
import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductDetail from './ProductDetail'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    description: 'Premium product details and reviews.',
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[120px]">
        <Suspense fallback={<div className="min-h-[600px]" />}>
          <ProductDetail slug={slug} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
