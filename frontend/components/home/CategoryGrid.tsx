'use client'

import Link from 'next/link'
import {
  Laptop, Shirt, Smartphone, Monitor, Sparkles,
  ShoppingBasket, Home, Dumbbell, BookOpen
} from 'lucide-react'
import { useCategories } from '@/hooks/useProducts'

const ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  electronics:  { icon: Laptop,         color: 'text-blue-600',   bg: 'bg-blue-50' },
  fashion:      { icon: Shirt,          color: 'text-pink-600',   bg: 'bg-pink-50' },
  mobile:       { icon: Smartphone,     color: 'text-purple-600', bg: 'bg-purple-50' },
  laptop:       { icon: Monitor,        color: 'text-indigo-600', bg: 'bg-indigo-50' },
  beauty:       { icon: Sparkles,       color: 'text-rose-600',   bg: 'bg-rose-50' },
  grocery:      { icon: ShoppingBasket, color: 'text-green-600',  bg: 'bg-green-50' },
  'home-decor': { icon: Home,           color: 'text-amber-600',  bg: 'bg-amber-50' },
  home:         { icon: Home,           color: 'text-amber-600',  bg: 'bg-amber-50' },
  sports:       { icon: Dumbbell,       color: 'text-orange-600', bg: 'bg-orange-50' },
  books:        { icon: BookOpen,       color: 'text-teal-600',   bg: 'bg-teal-50' },
}

const DEFAULT_CATEGORIES = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Fashion',     slug: 'fashion' },
  { name: 'Mobile',      slug: 'mobile' },
  { name: 'Laptops',     slug: 'laptop' },
  { name: 'Beauty',      slug: 'beauty' },
  { name: 'Grocery',     slug: 'grocery' },
  { name: 'Home Decor',  slug: 'home-decor' },
  { name: 'Sports',      slug: 'sports' },
  { name: 'Books',       slug: 'books' },
]

interface Props {
  initialCategories?: typeof DEFAULT_CATEGORIES
}

export default function CategoryGrid({ initialCategories = [] }: Props) {
  const { data: apiCats } = useCategories()

  const display = (
    apiCats?.length ? apiCats : initialCategories.length ? initialCategories : DEFAULT_CATEGORIES
  ).slice(0, 9)

  return (
    <section className="py-14">
      <div className="section-container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-500 mt-2">Explore our wide range of product categories</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-4">
          {display.map((cat: any) => {
            const cfg = ICONS[cat.slug] || { icon: ShoppingBasket, color: 'text-brand-600', bg: 'bg-brand-50' }
            const Icon = cfg.icon
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-card transition-all duration-200 group text-center"
              >
                <div className={`w-14 h-14 rounded-2xl ${cfg.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-7 h-7 ${cfg.color}`} />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-brand-500 transition-colors leading-tight">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
