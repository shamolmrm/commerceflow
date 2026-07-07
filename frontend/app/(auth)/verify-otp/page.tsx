'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const resetSchema = z.object({
  new_password: z.string().min(8, 'Min 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})
type ResetData = z.infer<typeof resetSchema>

function OTPForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const mode = searchParams.get('mode') || 'verify'

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'otp' | 'password'>('otp')
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
  })

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const next = [...otp]
    next[i] = v.slice(-1)
    setOtp(next)
    if (v && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  const otpValue = otp.join('')

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) { toast.error('Enter 6-digit OTP'); return }
    setIsLoading(true)
    try {
      await api.post('/users/verify-otp/', { email, otp: otpValue })
      if (mode === 'verify') {
        toast.success('Email verified! You can now log in.')
        router.push('/login')
      } else {
        setStep('password')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid or expired OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const onResetPassword = async (data: ResetData) => {
    setIsLoading(true)
    try {
      await api.post('/users/reset-password/', {
        email,
        otp: otpValue,
        new_password: data.new_password,
      })
      toast.success('Password reset successfully!')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Reset failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await api.post('/users/forgot-password/', { email })
      toast.success('New OTP sent')
      setOtp(['', '', '', '', '', ''])
    } catch {
      toast.error('Could not resend OTP')
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-black text-white mb-2">
          Commerce<span className="text-brand-400">Flow</span>
        </Link>
        <h1 className="text-xl font-bold text-white">
          {step === 'otp' ? (mode === 'verify' ? 'Verify Email' : 'Reset Password') : 'New Password'}
        </h1>
        {step === 'otp' && (
          <p className="text-white/60 text-sm mt-1">
            Enter the 6-digit code sent to <strong className="text-white">{email}</strong>
          </p>
        )}
      </div>

      {step === 'otp' ? (
        <div className="space-y-6">
          <div className="flex gap-2 justify-center">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                maxLength={1}
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={isLoading || otpValue.length < 6}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify OTP'}
          </button>

          <p className="text-center text-sm text-white/60">
            Didn&apos;t receive it?{' '}
            <button onClick={handleResend} className="text-brand-300 hover:text-brand-200 font-medium">Resend OTP</button>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onResetPassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">New Password</label>
            <input
              {...register('new_password')}
              type="password"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Min. 8 characters"
            />
            {errors.new_password && <p className="text-xs text-red-400 mt-1">{errors.new_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Confirm Password</label>
            <input
              {...register('confirm_password')}
              type="password"
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
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
          </button>
        </form>
      )}

      <p className="text-center mt-6">
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-white/60 hover:text-white/80">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </p>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense>
      <OTPForm />
    </Suspense>
  )
}
