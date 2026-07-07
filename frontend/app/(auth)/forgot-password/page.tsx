'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { z } from 'zod'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const schema = z.object({ email: z.string().email('Invalid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await api.post('/users/forgot-password/', data)
      setSent(true)
      toast.success('OTP sent to your email')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'No account found with this email')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-brand-300" />
        </div>
        <h2 className="text-xl font-bold text-white">Check your email</h2>
        <p className="text-white/60 text-sm mt-2 mb-6">We sent a 6-digit OTP to <strong className="text-white">{getValues('email')}</strong></p>
        <button
          onClick={() => router.push(`/verify-otp?email=${encodeURIComponent(getValues('email'))}&mode=reset`)}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Enter OTP
        </button>
        <button onClick={() => setSent(false)} className="mt-3 text-sm text-white/60 hover:text-white/80">Try a different email</button>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-black text-white mb-2">
          Commerce<span className="text-brand-400">Flow</span>
        </Link>
        <h1 className="text-xl font-bold text-white">Forgot password?</h1>
        <p className="text-white/60 text-sm mt-1">Enter your email to receive a reset OTP</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
          <input
            {...register('email')}
            type="email"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</> : 'Send Reset OTP'}
        </button>
      </form>

      <p className="text-center mt-6">
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-white/60 hover:text-white/80">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </p>
    </div>
  )
}
