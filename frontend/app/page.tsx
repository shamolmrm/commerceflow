import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSlider from '@/components/home/HeroSlider'
import FlashSale from '@/components/home/FlashSale'
import CategoryGrid from '@/components/home/CategoryGrid'
import TrendingProducts from '@/components/home/TrendingProducts'
import BrandsSlider from '@/components/home/BrandsSlider'
import Testimonials from '@/components/home/Testimonials'
import type { Product, Category } from '@/types'

export const metadata: Metadata = {
  title: 'CommerceFlow — Premium E-commerce',
  description: 'Shop premium products at unbeatable prices. Electronics, fashion, beauty, sports and more.',
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function fetchProducts(params: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products/?${params}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.results || []
  } catch {
    return []
  }
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/categories/`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.results || data || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  // Fetch all critical data in parallel on the server — zero client waterfall
  const [saleProducts, featuredProducts, categories] = await Promise.all([
    fetchProducts('is_on_sale=true&page_size=10'),
    fetchProducts('is_featured=true&page_size=8'),
    fetchCategories(),
  ])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSlider />
        <FlashSale initialProducts={saleProducts} />
        <CategoryGrid initialCategories={categories} />
        <TrendingProducts initialFeatured={featuredProducts} />
        <BrandsSlider />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
