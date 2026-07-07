'use client'

import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/store/authSlice'
import { Store, Bell, Shield, Database, ExternalLink } from 'lucide-react'

export default function AdminSettingsPage() {
  const user = useSelector(selectCurrentUser)

  const ROLE_COLOR: Record<string, string> = {
    superadmin: 'bg-red-100 text-red-700',
    manager:    'bg-amber-100 text-amber-700',
    staff:      'bg-blue-100 text-blue-700',
    customer:   'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Store configuration and account details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Store className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-bold text-gray-900">Store Information</h2>
          </div>
          <div className="space-y-0 divide-y divide-gray-50">
            {[
              { label: 'Store Name',               value: 'CommerceFlow' },
              { label: 'Currency',                 value: 'USD ($)' },
              { label: 'Timezone',                 value: 'UTC' },
              { label: 'Free Shipping Threshold',  value: '$50.00' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Account */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-bold text-gray-900">Admin Account</h2>
          </div>
          <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">
                {(user?.first_name || user?.email || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLOR[user?.role || 'customer'] ?? 'bg-gray-100 text-gray-600'}`}>
              {user?.role}
            </span>
          </div>
          <div className="space-y-0 divide-y divide-gray-50">
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-500">Account Status</span>
              <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-500">Auth Method</span>
              <span className="text-sm font-semibold text-gray-900">JWT (simplejwt)</span>
            </div>
          </div>
        </div>

        {/* System */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="font-bold text-gray-900">System</h2>
          </div>
          <div className="space-y-0 divide-y divide-gray-50">
            {[
              { label: 'Backend',   value: 'Django 5 + DRF' },
              { label: 'Frontend',  value: 'Next.js 15 App Router' },
              { label: 'Database',  value: 'SQLite (local dev)' },
              { label: 'API Base',  value: 'localhost:8000/api/v1', mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-500">{label}</span>
                <span className={`text-sm font-semibold text-gray-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-bold text-gray-900">Notifications</h2>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">UI only</span>
          </div>
          <div className="space-y-1">
            {[
              { label: 'New Order Alerts',  desc: 'Get notified when a new order is placed', on: true },
              { label: 'Low Stock Alerts',  desc: 'Alert when product stock drops below threshold', on: true },
              { label: 'Customer Reviews',  desc: 'Notification when a review is submitted', on: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <div className={`w-10 h-5 rounded-full relative flex-shrink-0 ml-4 ${item.on ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.on ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Database className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800">Full configuration via Django Admin</p>
          <p className="text-xs text-amber-700 mt-0.5">Payment gateway keys, email SMTP, and other advanced settings are managed at Django Admin.</p>
        </div>
        <a
          href="http://localhost:8000/django-admin/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          Open <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
