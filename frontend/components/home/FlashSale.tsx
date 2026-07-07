'use client'

import { useRef, useMemo } from 'react'
import Link from 'next/link'
import { Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import CountdownTimer from '@/components/ui/CountdownTimer'
import ProductCard from '@/components/product/ProductCard'
import { useProducts } from '@/hooks/useProducts'
import type { Product } from '@/types'

interface Props {
  initialProducts?: Product[]
}

export default function FlashSale({ initialProducts = [] }: Props) {
  const swiperRef = useRef<SwiperType | null>(null)
  const endTime = useMemo(() => new Date(Date.now() + 24 * 60 * 60 * 1000), [])

  // Always fetch fresh from client — don't use SSR initialData as React Query cache
  // (initialData makes RQ think data is fresh and skips client fetch)
  const { data } = useProducts({ is_on_sale: true, page_size: 12 } as any)

  // Fall back to SSR-provided products while client fetch is loading
  const products = (data?.results?.length ? data.results : initialProducts).slice(0, 12)

  if (products.length === 0) return null

  const useGrid = products.length < 4
  const useLoop  = products.length >= 4

  return (
    <section className="py-14 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="section-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Flash Sale</h2>
                <p className="text-sm text-gray-500">Hurry up! Deals end soon</p>
              </div>
            </div>
            <CountdownTimer endTime={endTime} className="hidden sm:flex" />
          </div>
          <div className="flex items-center gap-3">
            <CountdownTimer endTime={endTime} className="sm:hidden" />
            <Link href="/products?is_on_sale=true" className="text-sm font-medium text-brand-500 hover:text-brand-600">
              View All →
            </Link>
            {!useGrid && (
              <div className="flex gap-2">
                <button
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:shadow-sm transition-all text-gray-600 hover:text-brand-500"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => swiperRef.current?.slideNext()}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:shadow-sm transition-all text-gray-600 hover:text-brand-500"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grid for <=3 products, Swiper for 4+ */}
        {useGrid ? (
          <div className={`grid gap-4 ${
            products.length === 1
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : products.length === 2
              ? 'grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          }`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Autoplay]}
            onSwiper={(swiper) => { swiperRef.current = swiper }}
            slidesPerView={2}
            spaceBetween={16}
            autoplay={{ delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop={useLoop}
            breakpoints={{
              640:  { slidesPerView: 3 },
              768:  { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
            }}
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  )
}
