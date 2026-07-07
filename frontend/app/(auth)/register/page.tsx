'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { registerSchema } from '@/lib/validators'
import { useAuth } from '@/hooks/useAuth'
import type { z } from 'zod'

type FormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await registerUser(data)
      toast.success('Account created! Welcome to CommerceFlow 🎉')
      router.push('/')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { email?: string[]; detail?: string } } })
          ?.response?.data?.email?.[0] ||
        (err as { response?: { data?: { detail?: string } } })
          ?.response?.data?.detail ||
        'Registration failed. Please try again.'
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
        <h1 className="text-xl font-bold text-white">Create account</h1>
        <p className="text-white/60 text-sm mt-1">Join thousands of happy shoppers</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">First Name</label>
            <input
              {...register('first_name')}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="John"
            />
            {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Last Name</label>
            <input
              {...register('last_name')}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Doe"
            />
            {errors.last_name && <p className="text-xs text-red-400 mt-1">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPwd ? 'text' : 'password'}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400 pr-12"
              placeholder="Min. 8 characters"
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Confirm Password</label>
          <input
            {...register('confirm_password')}
            type={showPwd ? 'text' : 'password'}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Repeat password"
          />
          {errors.confirm_password && <p className="text-xs text-red-400 mt-1">{errors.confirm_password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-white/60 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-300 hover:text-brand-200 font-medium">Sign in</Link>
      </p>
    </div>
  )
}
