'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    title: 'Summer Sale',
    subtitle: 'Up to 70% Off',
    description: 'Discover incredible deals on the latest electronics. Premium quality at unbeatable prices.',
    cta: 'Shop Electronics',
    href: '/products?category=electronics',
    badge: 'Limited Time',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80',
    gradient: 'from-navy-800/90 to-brand-900/70',
    accent: 'text-yellow-400',
  },
  {
    id: 2,
    title: 'New Arrivals',
    subtitle: 'Fashion 2025 Collection',
    description: 'Explore the latest trends in fashion. Style that speaks before you do.',
    cta: 'Shop Fashion',
    href: '/products?category=fashion',
    badge: 'Just Landed',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80',
    gradient: 'from-purple-900/85 to-pink-900/70',
    accent: 'text-pink-300',
  },
  {
    id: 3,
    title: 'Tech Week',
    subtitle: 'Laptops & Mobiles',
    description: 'Power up your life with the latest smartphones and laptops from top brands.',
    cta: 'Explore Now',
    href: '/products?category=electronics&search=laptop',
    badge: 'Best Deals',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80',
    gradient: 'from-slate-900/90 to-indigo-900/70',
    accent: 'text-indigo-300',
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = (index: number) => {
    setCurrent((index + slides.length) % slides.length)
  }

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 5000)
  }

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handlePrev = () => { goTo(current - 1); resetTimer() }
  const handleNext = () => { goTo(current + 1); resetTimer() }

  return (
    <div className="relative h-[72vh] min-h-[500px] overflow-hidden">
      {/* Slide track — pure CSS transform */}
      <div
        className="flex h-full"
        style={{
          width: `${slides.length * 100}%`,
          transform: `translateX(-${(current * 100) / slides.length}%)`,
          transition: 'transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative h-full"
            style={{ width: `${100 / slides.length}%` }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />

            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <span className="inline-block badge bg-white/20 text-white border border-white/30 backdrop-blur-sm mb-4 text-sm">
                    🔥 {slide.badge}
                  </span>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-2">
                    {slide.title}
                  </h1>
                  <p className={`text-3xl sm:text-4xl font-bold ${slide.accent} mb-4`}>
                    {slide.subtitle}
                  </p>
                  <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href={slide.href}
                      className="inline-flex items-center gap-2 bg-white text-navy-800 font-bold px-8 py-3.5 rounded-button hover:bg-brand-50 transition-all duration-200 shadow-lg"
                    >
                      {slide.cta}
                    </Link>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 border-2 border-white text-white font-semibold px-8 py-3.5 rounded-button hover:bg-white/10 transition-all duration-200"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrow controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetTimer() }}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
        <div
          key={current}
          className="h-full bg-brand-500"
          style={{ animation: 'heroProgress 5s linear forwards' }}
        />
      </div>

      <style>{`
        @keyframes heroProgress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}
