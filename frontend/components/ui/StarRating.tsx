'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  reviewCount?: number
  className?: string
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  reviewCount,
  className,
}: StarRatingProps) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }
  const starSize = sizes[size]

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, i) => {
          const fill = Math.min(Math.max(rating - i, 0), 1)
          return (
            <div key={i} className="relative">
              <Star className={cn(starSize, 'text-gray-200')} fill="currentColor" />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={cn(starSize, 'text-yellow-400')} fill="currentColor" />
              </div>
            </div>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-400">({reviewCount})</span>
      )}
    </div>
  )
}
