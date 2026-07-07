'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Filter, ChevronDown, X } from 'lucide-react'
import { useCategories, useBrands } from '@/hooks/useProducts'

const PRICE_RANGES = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 – $50', min: 25, max: 50 },
  { label: '$50 – $100', min: 50, max: 100 },
  { label: '$100 – $250', min: 100, max: 250 },
  { label: '$250 – $500', min: 250, max: 500 },
  { label: 'Over $500', min: 500, max: 99999 },
]

const RATINGS = [5, 4, 3, 2, 1]

interface ProductFiltersProps {
  className?: string
}

export default function ProductFilters({ className }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: categories } = useCategories()
  const { data: brands } = useBrands()

  const currentCategory = searchParams.get('category') || ''
  const currentBrand = searchParams.get('brand') || ''
  const currentMinPrice = searchParams.get('min_price') || ''
  const currentMaxPrice = searchParams.get('max_price') || ''
  const currentRating = searchParams.get('min_rating') || ''
  const currentInStock = searchParams.get('in_stock') === 'true'

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const clearAll = () => {
    router.push('/products')
  }

  const hasFilters = currentCategory || currentBrand || currentMinPrice || currentRating || currentInStock

  return (
    <aside className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Category</h4>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => updateFilter('category', null)}
              className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${
                !currentCategory ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
          </li>
          {categories?.slice(0, 9).map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateFilter('category', cat.slug)}
                className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  currentCategory === cat.slug ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                {cat.product_count !== undefined && (
                  <span className="text-xs text-gray-400">({cat.product_count})</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Brand</h4>
        <ul className="space-y-2">
          {brands?.slice(0, 10).map((brand) => (
            <li key={brand.id}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={currentBrand === brand.slug}
                  onChange={() => updateFilter('brand', currentBrand === brand.slug ? null : brand.slug)}
                  className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {brand.name}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Price Range</h4>
        <ul className="space-y-1.5">
          {PRICE_RANGES.map((range) => (
            <li key={range.label}>
              <button
                onClick={() => {
                  updateFilter('min_price', String(range.min))
                  updateFilter('max_price', String(range.max === 99999 ? '' : range.max))
                }}
                className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentMinPrice === String(range.min)
                    ? 'bg-brand-50 text-brand-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Rating</h4>
        <ul className="space-y-1.5">
          {RATINGS.map((rating) => (
            <li key={rating}>
              <button
                onClick={() => updateFilter('min_rating', currentRating === String(rating) ? null : String(rating))}
                className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  currentRating === String(rating) ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                <span className="text-xs">& Up</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={() => updateFilter('in_stock', currentInStock ? null : 'true')}
            className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-gray-700">In Stock Only</span>
        </label>
      </div>
    </aside>
  )
}
