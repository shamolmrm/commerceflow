'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, getImageUrl } from '@/lib/utils'
import type { Product } from '@/types'
import StarRating from '@/components/ui/StarRating'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [isWishlisted, setIsWishlisted] = useState(product.is_wishlisted || false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const imageUrl = getImageUrl(
    product.primary_image?.url || product.images?.[0]?.url,
    `https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400`
  )

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsAddingToCart(true)
    try {
      await addToCart(product.id)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please sign in to add to wishlist')
      return
    }
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/remove/${product.id}/`)
        setIsWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        await api.post('/wishlist/add/', { product_id: product.id })
        setIsWishlisted(true)
        toast.success('Added to wishlist!')
      }
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  return (
    <div className={`product-card group transition-transform duration-200 hover:-translate-y-1 ${className ?? ''}`}>
      <Link href={`/products/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discount_percentage > 0 && (
              <span className="badge bg-red-500 text-white text-[10px] font-bold">
                -{product.discount_percentage}%
              </span>
            )}
            {product.is_featured && (
              <span className="badge bg-brand-500 text-white text-[10px] font-bold">
                Featured
              </span>
            )}
            {!product.in_stock && (
              <span className="badge bg-gray-800 text-white text-[10px] font-bold">
                Out of Stock
              </span>
            )}
          </div>

          {/* Hover actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/products/${product.slug}`) }}
              className="w-8 h-8 rounded-full bg-white text-gray-600 flex items-center justify-center shadow-sm hover:bg-brand-500 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Add to cart overlay */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !product.in_stock}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2.5 flex items-center justify-center gap-2 transition-colors disabled:bg-gray-300"
            >
              <ShoppingCart className="w-4 h-4" />
              {isAddingToCart ? 'Adding...' : product.in_stock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {(product.brand?.name || product.brand_name) && (
            <p className="text-xs text-brand-500 font-medium uppercase tracking-wide mb-1">
              {product.brand?.name || product.brand_name}
            </p>
          )}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-brand-500 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mt-1.5">
            <StarRating rating={product.rating} size="sm" />
            <span className="text-xs text-gray-400">({product.review_count})</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(product.effective_price)}
            </span>
            {product.sale_price && product.sale_price < product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
