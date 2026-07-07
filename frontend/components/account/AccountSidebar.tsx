'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Heart, MapPin, User, Bell, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/store/authSlice'

const NAV = [
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/notifications', label: 'Notifications', icon: Bell },
]

export default function AccountSidebar() {
  const pathname = usePathname()
  const user = useSelector(selectCurrentUser)
  const { logout } = useAuth()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 h-fit">
      {user && (
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600 text-lg">
            {user.first_name?.[0] || user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.email}</p>
          </div>
        </div>
      )}

      <nav className="space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              pathname === href
                ? 'bg-brand-50 text-brand-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>
    </div>
  )
}
