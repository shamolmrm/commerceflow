'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  // Wait one tick for redux-persist to rehydrate from localStorage
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 150)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (!isAuthenticated) {
      router.replace('/login?next=/admin')
    } else if (!isAdmin) {
      router.replace('/')
    }
  }, [ready, isAuthenticated, isAdmin, router])

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
