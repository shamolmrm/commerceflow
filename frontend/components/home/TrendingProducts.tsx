'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import type { Product } from '@/types'
import {
  useFeaturedProducts,
  useNewArrivals,
  useBestSellers,
  useTopRated,
} from '@/hooks/useProducts'

const TABS = [
  { id: 'featured', label: '⭐ Featured' },
  { id: 'new',      label: '🆕 New Arrivals' },
  { id: 'best',     label: '🔥 Best Sellers' },
  { id: 'top',      label: '🏆 Top Rated' },
] as const

type TabId = typeof TABS[number]['id']

interface Props {
  initialFeatured?: Product[]
}

function TabContent({ tabId, initialFeatured }: { tabId: TabId; initialFeatured: Product[] }) {
  const featured  = useFeaturedProducts()
  const newArr    = useNewArrivals()
  const bestSell  = useBestSellers()
  const topRated  = useTopRated()

  const queryMap = { featured: featured, new: newArr, best: bestSell, top: topRated }
  const { data, isLoading } = queryMap[tabId]

  // For featured tab, use server-prefetched data while client loads
  const products = data ?? (tabId === 'featured' ? initialFeatured : [])

  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-72 rounded-card" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default function TrendingProducts({ initialFeatured = [] }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('featured')

  return (
    <section className="py-14 bg-gray-50">
      <div className="section-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Trending Products</h2>
            <p className="text-gray-500 mt-1">Curated picks from our best categories</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-brand-500 hover:text-brand-600">
            View All Products →
          </Link>
        </div>

        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-white text-gray-600 hover:bg-brand-50 hover:text-brand-500 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <TabContent tabId={activeTab} initialFeatured={initialFeatured} />
      </div>
    </section>
  )
}
