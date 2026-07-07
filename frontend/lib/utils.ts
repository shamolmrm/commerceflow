import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    processing: 'text-blue-600 bg-blue-50 border-blue-200',
    shipped: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    delivered: 'text-green-600 bg-green-50 border-green-200',
    cancelled: 'text-red-600 bg-red-50 border-red-200',
    returned: 'text-orange-600 bg-orange-50 border-orange-200',
    refunded: 'text-gray-600 bg-gray-50 border-gray-200',
    paid: 'text-green-600 bg-green-50 border-green-200',
    failed: 'text-red-600 bg-red-50 border-red-200',
  }
  return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200'
}

export function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
}

export function calculateDiscountPercentage(price: number, salePrice: number): number {
  return Math.round((1 - salePrice / price) * 100)
}

export function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url) || url.includes('unsplash.com')
}

export const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:8000'

export function getImageUrl(path?: string, fallback = '/placeholder.jpg'): string {
  if (!path) return fallback
  if (path.startsWith('http')) return path
  return `${MEDIA_URL}${path}`
}
