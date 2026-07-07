'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Grid, List, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import ProductFilters from '@/components/product/ProductFilters'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useProducts } from '@/hooks/useProducts'

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Highest Rated' },
  { value: '-review_count', label: 'Most Reviewed' },
]

export default function ProductsContent() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  const filters = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    min_rating: searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : undefined,
    in_stock: searchParams.get('in_stock') === 'true' ? true : undefined,
    is_on_sale: searchParams.get('is_on_sale') === 'true' ? true : undefined,
    is_featured: searchParams.get('is_featured') === 'true' ? true : undefined,
    ordering: searchParams.get('ordering') || '-created_at',
    page,
  }

  const { data, isLoading, error } = useProducts(filters)

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('ordering', value)
    window.history.pushState({}, '', `/products?${params.toString()}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const searchQuery = searchParams.get('search')
  const categoryFilter = searchParams.get('category')

  return (
    <div className="section-container py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-brand-500">Home</a>
        <span>/</span>
        <span className="text-gray-900">Products</span>
        {categoryFilter && (
          <>
            <span>/</span>
            <span className="text-gray-900 capitalize">{categoryFilter}</span>
          </>
        )}
        {searchQuery && (
          <>
            <span>/</span>
            <span className="text-gray-900">"{searchQuery}"</span>
          </>
        )}
      </div>

      {/* Search result info */}
      {searchQuery && (
        <div className="mb-6 p-4 bg-brand-50 rounded-xl border border-brand-100">
          <p className="text-gray-700">
            Search results for <strong>"{searchQuery}"</strong>
            {data && ` — ${data.count} products found`}
          </p>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Filters */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-28">
            <ProductFilters />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              <span className="text-sm text-gray-500">
                {isLoading ? 'Loading...' : `${data?.count || 0} products`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={searchParams.get('ordering') || '-created_at'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* View toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton h-72 rounded-card" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">Failed to load products</div>
          ) : data?.results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl font-medium text-gray-900">No products found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
              <a href="/products" className="btn-primary inline-block mt-6">Clear Filters</a>
            </div>
          ) : (
            <>
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'flex flex-col gap-4'
              }>
                {data?.results.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {data && data.count > 20 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!data.previous}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {page} of {Math.ceil(data.count / 20)}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data.next}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filters overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductFilters />
          </div>
        </div>
      )}
    </div>
  )
}
