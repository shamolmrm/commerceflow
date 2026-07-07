'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ChevronRight, Grid3X3, Package } from 'lucide-react'
import api from '@/lib/api'

const CATEGORY_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-600',
  'from-green-500 to-emerald-600',
  'from-red-500 to-pink-600',
  'from-yellow-500 to-orange-600',
  'from-teal-500 to-cyan-600',
]

export default function CategoriesContent() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['all-categories'],
    queryFn: () => api.get('/categories/', { params: { page_size: 100 } }).then((r) => r.data.results ?? r.data),
    staleTime: 300_000,
  })

  const topLevel = categories?.filter((c: any) => !c.parent) || []
  const children = (parentSlug: string) =>
    categories?.filter((c: any) => c.parent?.slug === parentSlug || c.parent === parentSlug) || []

  return (
    <div className="section-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-500">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900">Categories</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Grid3X3 className="w-7 h-7 text-brand-500" />
          <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
        </div>
        <p className="text-gray-500 ml-10">Browse {categories?.length || 0} categories and find what you love</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Top-level category cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {topLevel.map((cat: any, i: number) => {
              const subCats = children(cat.slug)
              const gradient = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                >
                  <Link href={`/products?category=${cat.slug}`} className="group block">
                    <div className={`relative h-40 rounded-2xl bg-gradient-to-br ${gradient} overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]`}>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
                      ) : (
                        <div className="absolute inset-0 opacity-10">
                          <Package className="w-24 h-24 absolute -right-4 -bottom-4 text-white" />
                        </div>
                      )}
                      <div className="relative h-full flex flex-col justify-between p-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">{cat.name}</h3>
                          {subCats.length > 0 && (
                            <p className="text-white/70 text-xs mt-0.5">{subCats.length} subcategories</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Subcategories */}
                  {subCats.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {subCats.slice(0, 4).map((sub: any) => (
                        <Link
                          key={sub.id}
                          href={`/products?category=${sub.slug}`}
                          className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                        >
                          <span>{sub.name}</span>
                          <ChevronRight className="w-3 h-3 opacity-40" />
                        </Link>
                      ))}
                      {subCats.length > 4 && (
                        <Link
                          href={`/products?category=${cat.slug}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-500 hover:text-brand-600 font-medium"
                        >
                          +{subCats.length - 4} more
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* All categories flat list for quick access */}
          {categories && categories.length > topLevel.length && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="font-bold text-gray-900 mb-4">All Subcategories</h2>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((c: any) => c.parent)
                  .map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-brand-50 hover:text-brand-600 rounded-full border border-gray-100 hover:border-brand-200 transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
