'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search, ShoppingCart, Heart, User, Menu, X,
  ChevronDown, ChevronRight, Bell, LogOut, Settings, Package,
  Tag, ArrowRight, Sparkles,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsAuthenticated, selectIsAdmin } from '@/store/authSlice'
import { selectCartItemCount, toggleCart } from '@/store/cartSlice'
import { useDispatch } from 'react-redux'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/useProducts'
import CartDrawer from '@/components/cart/CartDrawer'
import type { Category } from '@/types'

const ICON_MAP: Record<string, { icon: string; color: string }> = {
  electronics:  { icon: '💻', color: 'from-blue-500 to-indigo-500' },
  fashion:      { icon: '👗', color: 'from-pink-500 to-rose-500' },
  'home-decor': { icon: '🏠', color: 'from-amber-500 to-orange-500' },
  sports:       { icon: '⚽', color: 'from-green-500 to-emerald-500' },
  beauty:       { icon: '💄', color: 'from-rose-500 to-pink-500' },
  books:        { icon: '📚', color: 'from-teal-500 to-cyan-500' },
  grocery:      { icon: '🛒', color: 'from-lime-500 to-green-500' },
  toys:         { icon: '🧸', color: 'from-orange-500 to-amber-500' },
  automotive:   { icon: '🚗', color: 'from-slate-500 to-gray-600' },
  mobile:       { icon: '📱', color: 'from-purple-500 to-violet-500' },
  laptop:       { icon: '💻', color: 'from-blue-600 to-indigo-600' },
  audio:        { icon: '🎧', color: 'from-indigo-500 to-purple-500' },
  camera:       { icon: '📷', color: 'from-sky-500 to-blue-500' },
  health:       { icon: '💊', color: 'from-emerald-500 to-teal-500' },
}

const CHILD_ICON_MAP: Record<string, string> = {
  smartphones:     '📱', laptops: '💻', audio: '🎧', cameras: '📷',
  "men's clothing": '👔', "women's clothing": '👗', footwear: '👟', accessories: '💍',
  furniture: '🪑', kitchen: '🍳', bedding: '🛏️', lighting: '💡',
  fitness: '🏋️', outdoor: '🏕️', 'team sports': '⚽', yoga: '🧘',
  skincare: '🧴', makeup: '💄', haircare: '💇', fragrance: '🌸',
  fiction: '📖', 'non-fiction': '📰', science: '🔬', 'self-help': '🌱',
  organic: '🥦', beverages: '🥤', snacks: '🍿', 'fresh produce': '🍎',
  'action figures': '🦸', 'board games': '🎲', educational: '🎓', 'outdoor toys': '🏃',
  'car accessories': '🔧', tools: '🛠️', 'care products': '✨',
}

function getCatStyle(slug: string) {
  const lower = slug.toLowerCase()
  for (const [key, val] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return val
  }
  return { icon: '🏷️', color: 'from-brand-500 to-purple-500' }
}

function getChildIcon(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(CHILD_ICON_MAP)) {
    if (lower.includes(key)) return icon
  }
  return '▸'
}

// Fallback categories if API is slow
const FALLBACK_CATS: Category[] = [
  { id: 1, name: 'Electronics',  slug: 'electronics',  is_active: true, sort_order: 0, children: [
    { id: 11, name: 'Smartphones', slug: 'smartphones', is_active: true, sort_order: 0, parent: 1 },
    { id: 12, name: 'Laptops',     slug: 'laptops',     is_active: true, sort_order: 1, parent: 1 },
    { id: 13, name: 'Audio',       slug: 'audio',       is_active: true, sort_order: 2, parent: 1 },
    { id: 14, name: 'Cameras',     slug: 'cameras',     is_active: true, sort_order: 3, parent: 1 },
  ]},
  { id: 2, name: 'Fashion',      slug: 'fashion',      is_active: true, sort_order: 1, children: [
    { id: 21, name: "Men's Clothing",   slug: 'mens-clothing',   is_active: true, sort_order: 0, parent: 2 },
    { id: 22, name: "Women's Clothing", slug: 'womens-clothing', is_active: true, sort_order: 1, parent: 2 },
    { id: 23, name: 'Footwear',         slug: 'footwear',        is_active: true, sort_order: 2, parent: 2 },
    { id: 24, name: 'Accessories',      slug: 'accessories',     is_active: true, sort_order: 3, parent: 2 },
  ]},
  { id: 3, name: 'Home & Decor', slug: 'home-decor',   is_active: true, sort_order: 2, children: [
    { id: 31, name: 'Furniture', slug: 'furniture', is_active: true, sort_order: 0, parent: 3 },
    { id: 32, name: 'Kitchen',   slug: 'kitchen',   is_active: true, sort_order: 1, parent: 3 },
    { id: 33, name: 'Bedding',   slug: 'bedding',   is_active: true, sort_order: 2, parent: 3 },
    { id: 34, name: 'Lighting',  slug: 'lighting',  is_active: true, sort_order: 3, parent: 3 },
  ]},
  { id: 4, name: 'Sports',  slug: 'sports',  is_active: true, sort_order: 3, children: [] },
  { id: 5, name: 'Beauty',  slug: 'beauty',  is_active: true, sort_order: 4, children: [] },
  { id: 6, name: 'Books',   slug: 'books',   is_active: true, sort_order: 5, children: [] },
  { id: 7, name: 'Grocery', slug: 'grocery', is_active: true, sort_order: 6, children: [] },
  { id: 8, name: 'Toys',    slug: 'toys',    is_active: true, sort_order: 7, children: [] },
  { id: 9, name: 'Automotive', slug: 'automotive', is_active: true, sort_order: 8, children: [] },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled]       = useState(false)
  const [mounted, setMounted]             = useState(false)
  const [searchQuery, setSearchQuery]     = useState('')
  const [isMobileMenuOpen, setMobileMenu] = useState(false)
  const [isUserMenuOpen, setUserMenu]     = useState(false)
  const [isCatOpen, setCatOpen]           = useState(false)
  const [activeIdx, setActiveIdx]         = useState(0)
  const catRef   = useRef<HTMLDivElement>(null)
  const catTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openCat  = () => { if (catTimer.current) clearTimeout(catTimer.current); setCatOpen(true) }
  const closeCat = () => { catTimer.current = setTimeout(() => setCatOpen(false), 220) }

  const router   = useRouter()
  const pathname = usePathname()
  // Transparent only on homepage before scroll — all other pages always solid white
  const isTransparent = pathname === '/' && !isScrolled
  const dispatch = useDispatch()
  const user            = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin         = useSelector(selectIsAdmin)
  const cartCount       = useSelector(selectCartItemCount)
  const { logout }      = useAuth()
  const { data: catsRaw } = useCategories()

  // Root categories (with children nested inside)
  const cats = (catsRaw?.length ? catsRaw : FALLBACK_CATS).filter((c: Category) => !c.parent)
  const active = cats[activeIdx] ?? cats[0]
  const children: Category[] = (active?.children as Category[]) ?? []

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isCatOpen) return
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isCatOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) { router.push(`/products?search=${encodeURIComponent(searchQuery)}`); setSearchQuery('') }
  }

  const closeAll = () => { setCatOpen(false); setActiveIdx(0) }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent ? 'bg-transparent' : 'bg-white shadow-soft border-b border-gray-100'
      }`}>
        {/* Top bar */}
        <div className="bg-navy-800 text-white text-xs py-1.5 text-center">
          🚀 Free shipping on orders over $50 &nbsp;|&nbsp; Use code <span className="font-bold text-brand-300">WELCOME10</span> for 10% off
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <span className={`font-bold text-xl hidden sm:block transition-colors ${!isTransparent ? 'text-navy-800' : 'text-white'}`}>
                CommerceFlow
              </span>
            </Link>

            {/* ── Categories mega-menu ── */}
            <div
              ref={catRef}
              className="relative hidden lg:block"
              onMouseEnter={openCat}
              onMouseLeave={closeCat}
            >
              {/* Trigger button */}
              <button
                onClick={openCat}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors py-2 px-1 ${
                  !isTransparent ? 'text-gray-700 hover:text-brand-500' : 'text-white/90 hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4" />
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCatOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {isCatOpen && (
                <div
                  className="absolute top-full left-0 z-50 w-[680px]"
                  style={{ paddingTop: 8 }}
                  onMouseEnter={openCat}
                  onMouseLeave={closeCat}
                >
                  <div
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      animation: 'catDrop 0.18s ease-out',
                    }}
                  >
                    <style>{`
                      @keyframes catDrop {
                        from { opacity:0; transform:translateY(-6px) scale(0.98); }
                        to   { opacity:1; transform:translateY(0) scale(1); }
                      }
                    `}</style>

                    {/* Top gradient banner */}
                    <div className="bg-gradient-to-r from-brand-600 to-purple-600 px-5 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span className="text-white font-semibold text-sm">All Categories</span>
                      </div>
                      <Link
                        href="/categories"
                        onClick={closeAll}
                        className="text-xs text-white/80 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        View all <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* 2-column body */}
                    <div className="flex" style={{ minHeight: 320 }}>

                      {/* Left: parent category list */}
                      <div className="w-52 bg-gray-50 border-r border-gray-100 py-2 flex-shrink-0">
                        {cats.map((cat: Category, idx: number) => {
                          const style = getCatStyle(cat.slug)
                          const isActive = idx === activeIdx
                          return (
                            <div
                              key={cat.id}
                              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-all duration-100 ${
                                isActive
                                  ? 'bg-white border-r-2 border-brand-500'
                                  : 'hover:bg-white/70'
                              }`}
                              onMouseEnter={() => setActiveIdx(idx)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Gradient icon bubble */}
                                <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${style.color} flex items-center justify-center text-base flex-shrink-0 shadow-sm`}>
                                  {style.icon}
                                </span>
                                <div className="min-w-0">
                                  <Link
                                    href={`/products?category=${cat.slug}`}
                                    onClick={closeAll}
                                    className={`block text-[13px] font-semibold truncate transition-colors ${
                                      isActive ? 'text-brand-600' : 'text-gray-800 hover:text-brand-500'
                                    }`}
                                  >
                                    {cat.name}
                                  </Link>
                                  {cat.product_count != null && (
                                    <span className="text-[10px] text-gray-400">{cat.product_count} items</span>
                                  )}
                                </div>
                              </div>
                              {(cat.children as Category[] ?? []).length > 0 && (
                                <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isActive ? 'text-brand-500' : 'text-gray-300'}`} />
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Right: children of active parent */}
                      <div className="flex-1 p-5">
                        {active && (
                          <>
                            {/* Parent header with "all" link */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getCatStyle(active.slug).icon}</span>
                                <h3 className="font-bold text-gray-900 text-sm">{active.name}</h3>
                              </div>
                              <Link
                                href={`/products?category=${active.slug}`}
                                onClick={closeAll}
                                className="text-xs text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1"
                              >
                                Shop all <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>

                            {children.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2">
                                {children.map((child: Category) => (
                                  <Link
                                    key={child.id}
                                    href={`/products?category=${child.slug}`}
                                    onClick={closeAll}
                                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 border border-transparent hover:border-brand-100 transition-all duration-150"
                                  >
                                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-brand-100 group-hover:to-brand-200 flex items-center justify-center text-base transition-all flex-shrink-0">
                                      {getChildIcon(child.name)}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="text-[13px] font-semibold text-gray-800 group-hover:text-brand-600 transition-colors truncate">
                                        {child.name}
                                      </p>
                                      {child.product_count != null && (
                                        <p className="text-[10px] text-gray-400">{child.product_count} products</p>
                                      )}
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-400 ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-all" />
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                <span className="text-4xl mb-2">{getCatStyle(active.slug).icon}</span>
                                <p className="text-sm">Browse all {active.name}</p>
                                <Link
                                  href={`/products?category=${active.slug}`}
                                  onClick={closeAll}
                                  className="mt-3 btn-primary text-xs py-1.5 px-4"
                                >
                                  Shop Now
                                </Link>
                              </div>
                            )}

                            {/* Quick filters */}
                            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                              <Link href={`/products?category=${active.slug}&is_on_sale=true`} onClick={closeAll}
                                className="text-xs font-medium text-gray-600 hover:text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-all">
                                🔥 On Sale
                              </Link>
                              <Link href={`/products?category=${active.slug}&is_featured=true`} onClick={closeAll}
                                className="text-xs font-medium text-gray-600 hover:text-brand-500 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full transition-all">
                                ⭐ Featured
                              </Link>
                              <Link href={`/products?category=${active.slug}&ordering=-rating`} onClick={closeAll}
                                className="text-xs font-medium text-gray-600 hover:text-emerald-500 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full transition-all">
                                👑 Top Rated
                              </Link>
                              <Link href={`/products?category=${active.slug}&ordering=-created_at`} onClick={closeAll}
                                className="text-xs font-medium text-gray-600 hover:text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-all">
                                🆕 New
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-gray-100 px-5 py-2.5 bg-gray-50 flex items-center gap-4">
                      <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">Quick:</span>
                      {[
                        { label: '🔥 Flash Sale',  href: '/products?is_on_sale=true' },
                        { label: '⭐ Featured',    href: '/products?is_featured=true' },
                        { label: '🆕 New Arrivals',href: '/products?ordering=-created_at' },
                        { label: '👑 Best Sellers', href: '/products?ordering=-review_count' },
                      ].map(({ label, href }) => (
                        <Link key={label} href={href} onClick={closeAll}
                          className="text-xs font-medium text-gray-500 hover:text-brand-500 transition-colors whitespace-nowrap">
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands..."
                  className={`w-full h-10 pl-4 pr-12 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                    !isTransparent
                      ? 'border border-gray-200 bg-gray-50 text-gray-900'
                      : 'border border-white/30 bg-white/15 text-white placeholder:text-white/60 backdrop-blur-sm'
                  }`}
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-500 rounded-lg text-white hover:bg-brand-600 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {mounted && isAuthenticated && (
                <Link href="/account/wishlist" className={`p-2 rounded-lg transition-colors ${!isTransparent ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                  <Heart className={`w-5 h-5 ${!isTransparent ? 'text-gray-600' : 'text-white/90'}`} />
                </Link>
              )}
              {mounted && isAuthenticated && (
                <Link href="/account/notifications" className={`p-2 rounded-lg transition-colors ${!isTransparent ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                  <Bell className={`w-5 h-5 ${!isTransparent ? 'text-gray-600' : 'text-white/90'}`} />
                </Link>
              )}

              {/* Cart */}
              <button onClick={() => dispatch(toggleCart())} className={`p-2 rounded-lg transition-colors relative ${!isTransparent ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                <ShoppingCart className={`w-5 h-5 ${!isTransparent ? 'text-gray-600' : 'text-white/90'}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              {mounted && isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenu(!isUserMenuOpen)}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${!isTransparent ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${!isTransparent ? 'bg-brand-100' : 'bg-white/20'}`}>
                      <span className={`text-xs font-bold ${!isTransparent ? 'text-brand-600' : 'text-white'}`}>
                        {(user?.first_name || user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className={`w-3 h-3 hidden sm:block ${!isTransparent ? 'text-gray-400' : 'text-white/70'}`} />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-soft border border-gray-100 py-2 z-50"
                      onMouseLeave={() => setUserMenu(false)}>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link href="/account/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-500" onClick={() => setUserMenu(false)}>
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-500" onClick={() => setUserMenu(false)}>
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-500 border-t border-gray-100" onClick={() => setUserMenu(false)}>
                          <Settings className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full border-t border-gray-100">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className={`text-sm font-medium transition-colors hidden sm:block ${!isTransparent ? 'text-gray-700 hover:text-brand-500' : 'text-white/90 hover:text-white'}`}>Sign In</Link>
                  <Link href="/register" className="btn-primary text-sm hidden sm:block">Sign Up</Link>
                  <Link href="/login" className={`p-2 rounded-lg sm:hidden ${!isTransparent ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                    <User className={`w-5 h-5 ${!isTransparent ? 'text-gray-600' : 'text-white/90'}`} />
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button className={`lg:hidden p-2 rounded-lg ${!isTransparent ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`} onClick={() => setMobileMenu(!isMobileMenuOpen)}>
                {isMobileMenuOpen
                  ? <X className={`w-5 h-5 ${!isTransparent ? '' : 'text-white'}`} />
                  : <Menu className={`w-5 h-5 ${!isTransparent ? '' : 'text-white'}`} />
                }
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="pb-3 md:hidden">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..."
                  className="w-full h-10 pl-4 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-500 rounded-lg text-white"><Search className="w-4 h-4" /></button>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-soft">
            <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Categories</p>
              <div className="space-y-1">
                {cats.map((cat: Category) => {
                  const style = getCatStyle(cat.slug)
                  const childList = (cat.children as Category[]) ?? []
                  return (
                    <div key={cat.id}>
                      <Link
                        href={`/products?category=${cat.slug}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-brand-50 hover:text-brand-600"
                        onClick={() => setMobileMenu(false)}
                      >
                        <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${style.color} flex items-center justify-center text-base`}>{style.icon}</span>
                        {cat.name}
                        {cat.product_count != null && <span className="ml-auto text-xs text-gray-400">{cat.product_count}</span>}
                      </Link>
                      {childList.length > 0 && (
                        <div className="ml-11 grid grid-cols-2 gap-1 mt-1 mb-1">
                          {childList.map((child: Category) => (
                            <Link
                              key={child.id}
                              href={`/products?category=${child.slug}`}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:text-brand-500 hover:bg-brand-50"
                              onClick={() => setMobileMenu(false)}
                            >
                              <span>{getChildIcon(child.name)}</span>
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  )
}
