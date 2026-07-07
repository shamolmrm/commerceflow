'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Share2, ShieldCheck, Truck, RotateCcw, Star, ChevronRight, ChevronLeft, Minus, Plus } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, getImageUrl } from '@/lib/utils'
import StarRating from '@/components/ui/StarRating'
import ProductCard from '@/components/product/ProductCard'
import { useProducts } from '@/hooks/useProducts'
import type { ProductVariant } from '@/types'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface Props { slug: string }

export default function ProductDetail({ slug }: Props) {
  const { data: product, isLoading } = useProduct(slug)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({})
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const { data: relatedData } = useProducts({
    category: product?.category?.slug,
    page: 1,
  })
  const relatedProducts = relatedData?.results.filter((p) => p.id !== product?.id).slice(0, 10) || []

  if (isLoading) {
    return (
      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`skeleton h-${i === 0 ? '8' : '4'} rounded-lg`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!product) return <div className="text-center py-20 text-red-500">Product not found</div>

  const variantGroups = product.variants?.reduce<Record<string, ProductVariant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = []
    acc[v.name].push(v)
    return acc
  }, {}) || {}

  const handleAddToCart = async () => {
    const variant = Object.values(selectedVariants)[0]
    setIsAddingToCart(true)
    try {
      await addToCart(product.id, variant?.id, quantity)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please sign in'); return }
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
    } catch { toast.error('Failed to update wishlist') }
  }

  const images = product.images || []
  const currentImage = images[selectedImage]?.url || product.primary_image?.url

  const totalPrice = (product.effective_price + Object.values(selectedVariants).reduce((s, v) => s + v.price_modifier, 0)) * quantity

  return (
    <div className="section-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-brand-500">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-brand-500">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-500">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Image Gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Image
                  src={getImageUrl(currentImage, 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600')}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.discount_percentage > 0 && (
                <span className="badge bg-red-500 text-white">{product.discount_percentage}% OFF</span>
              )}
              {!product.in_stock && (
                <span className="badge bg-gray-800 text-white">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    i === selectedImage ? 'border-brand-500 shadow-glow' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={getImageUrl(img.url)}
                    alt={img.alt_text || product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="space-y-5">
          {/* Brand */}
          {product.brand && (
            <Link
              href={`/products?brand=${product.brand.slug}`}
              className="inline-block text-sm font-semibold text-brand-500 uppercase tracking-wide hover:text-brand-600"
            >
              {product.brand.name}
            </Link>
          )}

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

          {/* SKU */}
          <p className="text-xs text-gray-400">SKU: {product.sku}</p>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} size="md" showValue />
            <span className="text-sm text-gray-500">({product.review_count} reviews)</span>
            <span className={`text-sm font-medium ${product.in_stock ? 'text-green-600' : 'text-red-500'}`}>
              {product.in_stock ? '✓ In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.effective_price)}</span>
            {product.sale_price && product.sale_price < product.price && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatCurrency(product.price)}</span>
                <span className="badge bg-red-100 text-red-600 text-sm">Save {product.discount_percentage}%</span>
              </>
            )}
          </div>

          {product.short_description && (
            <p className="text-gray-600 text-sm leading-relaxed">{product.short_description}</p>
          )}

          {/* Variants */}
          {Object.entries(variantGroups).map(([name, variants]) => (
            <div key={name}>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {name}: <span className="font-normal text-gray-500">{selectedVariants[name]?.value || 'Select'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, [name]: variant }))}
                    disabled={!variant.is_active || variant.stock === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      selectedVariants[name]?.id === variant.id
                        ? 'border-brand-500 bg-brand-50 text-brand-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {variant.value}
                    {variant.price_modifier > 0 && ` (+${formatCurrency(variant.price_modifier)})`}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-2.5 font-semibold text-gray-900 min-w-[50px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">Total: {formatCurrency(totalPrice)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !product.in_stock}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-base disabled:bg-gray-200 disabled:text-gray-500"
            >
              <ShoppingCart className="w-5 h-5" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className={`p-3 rounded-button border-2 transition-all ${
                isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 text-gray-500 hover:border-red-300'
              }`}
            >
              <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
              className="p-3 rounded-button border-2 border-gray-200 text-gray-500 hover:border-brand-300 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            {[
              { icon: Truck, text: 'Free Shipping over $50' },
              { icon: ShieldCheck, text: 'Secure Payment' },
              { icon: RotateCcw, text: '30-Day Returns' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1 text-center p-2 rounded-lg bg-gray-50">
                <Icon className="w-5 h-5 text-brand-500" />
                <span className="text-xs text-gray-600">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="flex gap-1 border-b border-gray-200 mb-8">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'reviews' && ` (${product.review_count})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'SKU', value: product.sku },
              { label: 'Category', value: product.category?.name },
              { label: 'Brand', value: product.brand?.name },
              { label: 'Weight', value: product.weight ? `${product.weight} kg` : 'N/A' },
              { label: 'Tax Rate', value: `${product.tax_rate}%` },
              { label: 'Stock', value: `${product.total_stock} units` },
            ].filter((s) => s.value).map(({ label, value }) => (
              <div key={label} className="flex items-center gap-4 py-3 border-b border-gray-100">
                <span className="w-32 text-sm font-medium text-gray-500">{label}</span>
                <span className="text-sm text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <ReviewSection productSlug={slug} />
        )}
      </div>

      {/* Related products — auto-sliding carousel */}
      {relatedProducts.length > 0 && (
        <div className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
            <div className="flex items-center gap-2">
              <button className="related-prev w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button className="related-next w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <Swiper
            modules={[Autoplay, Navigation]}
            navigation={{ prevEl: '.related-prev', nextEl: '.related-next' }}
            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop={relatedProducts.length > 4}
            spaceBetween={16}
            breakpoints={{
              0:   { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
          >
            {relatedProducts.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  )
}

function ReviewSection({ productSlug }: { productSlug: string }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newRating, setNewRating] = useState(5)
  const [newBody, setNewBody] = useState('')
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    api.get(`/reviews/products/${productSlug}/reviews/`).then(({ data }) => {
      setReviews(data.results || data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [productSlug])

  const submitReview = async () => {
    try {
      const { data } = await api.post(`/reviews/products/${productSlug}/reviews/`, {
        rating: newRating, body: newBody
      })
      setReviews((prev) => [data, ...prev])
      setNewBody('')
      toast.success('Review submitted!')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to submit review')
    }
  }

  if (loading) return <div className="skeleton h-32 rounded-xl" />

  return (
    <div>
      {isAuthenticated && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Write a Review</h4>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((r) => (
              <button key={r} onClick={() => setNewRating(r)}>
                <Star className={`w-6 h-6 ${r <= newRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Share your experience..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            rows={3}
          />
          <button onClick={submitReview} className="btn-primary mt-3">Submit Review</button>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-5 bg-white border border-gray-100 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{review.user_name}</p>
                  <StarRating rating={review.rating} size="sm" className="mt-0.5" />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.title && <p className="font-medium text-gray-800 mt-2">{review.title}</p>}
              <p className="text-gray-600 text-sm mt-1">{review.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
