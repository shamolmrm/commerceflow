'use client'

import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Save, Lock } from 'lucide-react'
import { selectCurrentUser, updateUser } from '@/store/authSlice'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { MEDIA_URL } from '@/lib/utils'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Minimum 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

type ProfileData = z.infer<typeof profileSchema>
type PasswordData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: pErrors }, reset: resetProfile } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    },
  })

  useEffect(() => {
    if (user) {
      resetProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      })
    }
  }, [user, resetProfile])

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: pwErrors } } = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSaveProfile = async (data: ProfileData) => {
    try {
      const res = await api.patch('/users/me/', data)
      dispatch(updateUser(res.data))
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const onChangePassword = async (data: PasswordData) => {
    try {
      await api.post('/users/change-password/', {
        old_password: data.old_password,
        new_password: data.new_password,
      })
      toast.success('Password changed successfully')
      resetPwd()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to change password')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    setUploading(true)
    try {
      const res = await api.patch('/users/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      dispatch(updateUser(res.data))
      toast.success('Avatar updated')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const avatarUrl = user?.avatar ? `${MEDIA_URL}${user.avatar}` : null

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-brand-600">
                {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center shadow-md hover:bg-brand-600 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} />
        </div>
        <div>
          <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          {uploading && <p className="text-xs text-brand-500 mt-1">Uploading...</p>}
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="font-bold text-gray-900 mb-5">Personal Information</h2>
        <form onSubmit={handleProfile(onSaveProfile)} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input {...regProfile('first_name')} className="input-field" />
            {pErrors.first_name && <p className="text-xs text-red-500 mt-1">{pErrors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input {...regProfile('last_name')} className="input-field" />
            {pErrors.last_name && <p className="text-xs text-red-500 mt-1">{pErrors.last_name.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (read-only)</label>
            <input value={user?.email || ''} readOnly className="input-field bg-gray-50 cursor-not-allowed" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...regProfile('phone')} className="input-field" placeholder="+1 555 0100" />
          </div>
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Password form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-brand-500" />
          <h2 className="font-bold text-gray-900">Change Password</h2>
        </div>
        <form onSubmit={handlePwd(onChangePassword)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input {...regPwd('old_password')} type="password" className="input-field" />
            {pwErrors.old_password && <p className="text-xs text-red-500 mt-1">{pwErrors.old_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input {...regPwd('new_password')} type="password" className="input-field" />
            {pwErrors.new_password && <p className="text-xs text-red-500 mt-1">{pwErrors.new_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input {...regPwd('confirm_password')} type="password" className="input-field" />
            {pwErrors.confirm_password && <p className="text-xs text-red-500 mt-1">{pwErrors.confirm_password.message}</p>}
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
