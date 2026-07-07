'use client'

import { useState, useEffect } from 'react'
import { Quote } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Verified Customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    rating: 5,
    quote: "CommerceFlow has completely changed how I shop online. The product quality is exceptional, delivery is fast, and the customer service is outstanding. I've become a loyal customer!",
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Electronics Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    rating: 5,
    quote: 'The tech section is incredible. Got my new laptop at 30% off the retail price with next-day delivery. The product was exactly as described — pristine condition and fully functional.',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Fashion Blogger',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
    rating: 5,
    quote: "The fashion collection here is amazing. I found pieces I couldn't find anywhere else at such great prices. The sizing is accurate and the quality is premium. Highly recommend!",
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % testimonials.length)
        setVisible(true)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const t = testimonials[current]

  return (
    <section className="py-16 bg-gradient-to-br from-navy-800 to-brand-900 text-white overflow-hidden">
      <div className="section-container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">What Our Customers Say</h2>
          <p className="text-white/70 mt-2">Trusted by thousands of happy shoppers worldwide</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20"
          >
            <Quote className="w-10 h-10 text-brand-400 mx-auto mb-4" />
            <p className="text-lg text-white/90 leading-relaxed italic mb-6">
              "{t.quote}"
            </p>
            <img
              src={t.avatar}
              alt={t.name}
              className="w-14 h-14 rounded-full mx-auto mb-3 border-2 border-brand-400 object-cover"
            />
            <div className="font-semibold text-white">{t.name}</div>
            <div className="text-white/60 text-sm mb-2">{t.role}</div>
            <StarRating rating={t.rating} size="sm" className="justify-center" />
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setVisible(false)
                  setTimeout(() => { setCurrent(i); setVisible(true) }, 300)
                }}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-8 h-2 bg-brand-400' : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 pt-10 border-t border-white/10">
          {[
            { value: '50K+', label: 'Happy Customers' },
            { value: '10K+', label: 'Products' },
            { value: '99%',  label: 'Satisfaction Rate' },
            { value: '24/7', label: 'Customer Support' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-white">{value}</div>
              <div className="text-white/60 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
