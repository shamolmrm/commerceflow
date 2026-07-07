import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export default function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-brand-200 border-t-brand-500 animate-spin',
          sizes[size]
        )}
      />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  )
}
