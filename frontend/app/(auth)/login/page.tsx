'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) { setError('Email is required'); return }
    if (!password) { setError('Password is required'); return }

    setIsLoading(true)
    try {
      const result = await login({ email, password })
      toast.success('Welcome back!')
      const isAdminUser = ['superadmin', 'manager', 'staff'].includes(result?.user?.role)
      router.push(isAdminUser ? '/admin' : '/')
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        'Invalid email or password'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-black text-white mb-2">
          Commerce<span className="text-brand-400">Flow</span>
        </Link>
        <h1 className="text-xl font-bold text-white">Welcome back</h1>
        <p className="text-white/60 text-sm mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400 pr-12"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-brand-300 hover:text-brand-200">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-white/60 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-300 hover:text-brand-200 font-medium">Sign up</Link>
      </p>
    </div>
  )
}
