'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSubmitting(true)
    try {
      await api.post('/notifications/newsletter/subscribe/', { email })
      toast.success('Successfully subscribed to newsletter!')
      setEmail('')
    } catch (err: any) {
      const msg = err?.response?.data?.email?.[0] || 'Subscription failed. Try again.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-navy-800 text-gray-300">
      {/* Newsletter section */}
      <div className="bg-brand-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-2xl font-bold">Subscribe to our newsletter</h3>
              <p className="text-brand-100 mt-1">Get the latest deals, new arrivals, and exclusive offers.</p>
            </div>
            <form onSubmit={handleNewsletter} className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-white text-brand-600 font-semibold px-5 py-3 rounded-xl hover:bg-brand-50 transition-colors disabled:opacity-70"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">CF</span>
              </div>
              <span className="text-white font-bold text-xl">CommerceFlow</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your premium destination for electronics, fashion, beauty, and more.
              Quality products at unbeatable prices.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-brand-500 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/products' },
                { label: 'Categories', href: '/categories' },
                { label: 'Deals & Offers', href: '/products?is_on_sale=true' },
                { label: 'New Arrivals', href: '/products?ordering=-created_at' },
                { label: 'Best Sellers', href: '/products?ordering=-review_count' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'FAQ', href: '/faq' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Returns & Refunds', href: '/returns-refunds' },
                { label: 'Shipping Policy', href: '/shipping-policy' },
                { label: 'Track Your Order', href: '/account/orders' },
                { label: 'Privacy Policy', href: '/privacy-policy' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">123 Commerce Street, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href="tel:+8801700000000" className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                  +880 1700-000000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href="mailto:support@commerceflow.com" className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                  support@commerceflow.com
                </a>
              </li>
            </ul>

            <div className="mt-5">
              <p className="text-xs text-gray-500 mb-2">Download our app</p>
              <div className="flex gap-2">
                <div className="bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-white/20 cursor-pointer transition-colors">
                  App Store
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-white/20 cursor-pointer transition-colors">
                  Google Play
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} CommerceFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">We accept:</span>
            {['Visa', 'Mastercard', 'PayPal', 'Stripe'].map((payment) => (
              <span key={payment} className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                {payment}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
