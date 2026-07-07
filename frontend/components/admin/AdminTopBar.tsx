'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, ChevronRight } from 'lucide-react'

const PATH_LABELS: Record<string, string> = {
  '/admin':             'Dashboard',
  '/admin/products':    'Products',
  '/admin/products/new':'New Product',
  '/admin/categories':  'Categories',
  '/admin/brands':      'Brands',
  '/admin/inventory':   'Inventory',
  '/admin/orders':      'Orders',
  '/admin/customers':   'Customers',
  '/admin/suppliers':   'Suppliers',
  '/admin/warehouses':  'Warehouses',
  '/admin/coupons':     'Coupons',
  '/admin/reports':     'Reports & Analytics',
  '/admin/settings':    'Settings',
}

export default function AdminTopBar() {
  const pathname = usePathname()

  const isEditPage = pathname.match(/\/admin\/products\/\d+\/edit/)
  const label = isEditPage
    ? 'Edit Product'
    : PATH_LABELS[pathname] ?? pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'Admin'

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 h-14 flex items-center px-6 flex-shrink-0">
      <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
        <span className="text-gray-400 hidden sm:block">Admin</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:block" />
        <span className="font-semibold text-gray-800 capitalize truncate">{label}</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="hidden md:block text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
          {today}
        </span>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-indigo-600 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition-all"
        >
          <Store className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Storefront</span>
        </Link>
      </div>
    </header>
  )
}
