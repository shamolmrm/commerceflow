'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setWishlist, removeFromWishlist } from '@/store/wishlistSlice'
import { formatCurrency, getImageUrl } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const { addToCart } = useCart()

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist/').then((r) => r.data.results ?? r.data),
  })

  useEffect(() => {
    if (data) dispatch(setWishlist(data))
  }, [data, dispatch])

  const removeMutation = useMutation({
    mutationFn: (productId: number) => api.delete(`/wishlist/remove/${productId}/`),
    onSuccess: (_, productId) => {
      dispatch(removeFromWishlist(productId))
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Removed from wishlist')
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : !data?.length ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-16 text-center">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-900">Your wishlist is empty</p>
          <Link href="/products" className="btn-primary inline-block mt-4">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {data.map((item: any) => {
            const product = item.product || item
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden group">
                <Link href={`/products/${product.slug}`} className="relative block h-48 bg-gray-50">
                  <Image
                    src={getImageUrl(product.primary_image?.url)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </Link>
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium text-gray-900 hover:text-brand-500 transition-colors line-clamp-2 text-sm">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-bold text-brand-500 mt-1">{formatCurrency(product.effective_price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addToCart(product.id)}
                      className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeMutation.mutate(product.id)}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
