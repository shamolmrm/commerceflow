'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Grid, Tag, Warehouse, ShoppingBag,
  Users, Truck, Factory, Percent, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products',   href: '/admin/products',   icon: Package,     color: 'text-blue-400',   bg: 'bg-blue-500/20' },
      { label: 'Categories', href: '/admin/categories', icon: Grid,        color: 'text-violet-400', bg: 'bg-violet-500/20' },
      { label: 'Brands',     href: '/admin/brands',     icon: Tag,         color: 'text-pink-400',   bg: 'bg-pink-500/20' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Inventory',  href: '/admin/inventory',  icon: Warehouse,   color: 'text-amber-400',  bg: 'bg-amber-500/20' },
      { label: 'Orders',     href: '/admin/orders',     icon: ShoppingBag, color: 'text-green-400',  bg: 'bg-green-500/20' },
      { label: 'Customers',  href: '/admin/customers',  icon: Users,       color: 'text-cyan-400',   bg: 'bg-cyan-500/20' },
    ],
  },
  {
    label: 'Supply Chain',
    items: [
      { label: 'Suppliers',  href: '/admin/suppliers',  icon: Truck,       color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'Warehouses', href: '/admin/warehouses', icon: Factory,     color: 'text-teal-400',   bg: 'bg-teal-500/20' },
      { label: 'Coupons',    href: '/admin/coupons',    icon: Percent,     color: 'text-rose-400',   bg: 'bg-rose-500/20' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Reports',    href: '/admin/reports',    icon: BarChart3,   color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
      { label: 'Settings',   href: '/admin/settings',   icon: Settings,    color: 'text-slate-400',   bg: 'bg-slate-500/20' },
    ],
  },
]

const ROLE_COLORS: Record<string, string> = {
  superadmin: 'bg-red-500/20 text-red-400',
  manager:    'bg-amber-500/20 text-amber-400',
  staff:      'bg-blue-500/20 text-blue-400',
  customer:   'bg-slate-500/20 text-slate-400',
}

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  useEffect(() => { setMounted(true) }, [])

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const initials = mounted
    ? (user?.first_name || user?.email || 'A').charAt(0).toUpperCase()
    : 'A'

  return (
    <aside
      style={{ width: collapsed ? 72 : 260, transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)' }}
      className="flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-hidden bg-slate-950 border-r border-white/5"
    >
      {/* Brand header */}
      <div className="flex items-center h-16 px-3 flex-shrink-0 border-b border-white/5">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform"
          >
            <span className="text-white font-bold text-sm">CF</span>
          </button>
        ) : (
          <>
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-white font-bold text-sm whitespace-nowrap leading-tight">CommerceFlow</p>
              <p className="text-indigo-400 text-[10px] font-medium whitespace-nowrap">Admin Panel</p>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? 'mt-2' : ''}>
            {!collapsed && (
              <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 select-none">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && <div className="my-2 border-t border-white/5 mx-1" />}
            <div className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon, color, bg }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                      active ? 'bg-white/20' : bg
                    )}>
                      <Icon className={cn('w-[15px] h-[15px]', active ? 'text-white' : color)} />
                    </div>
                    {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>


      {/* User card */}
      <div className="border-t border-white/5 p-3 flex-shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
              <span className="text-white text-sm font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {mounted ? `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || 'Admin' : 'Admin'}
              </p>
              <span className={cn(
                'inline-block text-[10px] font-semibold capitalize px-1.5 py-0.5 rounded-full mt-0.5',
                mounted ? (ROLE_COLORS[user?.role || 'customer'] ?? 'bg-slate-500/20 text-slate-400') : 'bg-slate-500/20 text-slate-400'
              )}>
                {mounted ? (user?.role ?? '') : ''}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
