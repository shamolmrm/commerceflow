'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRight, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { addressSchema } from '@/lib/validators'
import api from '@/lib/api'
import type { Address } from '@/types'
import type { z } from 'zod'

type FormData = z.infer<typeof addressSchema>

interface Props {
  data: FormData
  onUpdate: (address: FormData) => void
  onNext: () => void
}

export default function StepShipping({ data, onUpdate, onNext }: Props) {
  const { data: savedAddresses } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => api.get('/addresses/').then((r) => r.data.results ?? r.data),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: data,
  })

  const selectSavedAddress = (addr: Address) => {
    const values: FormData = {
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
    }
    reset(values)
    onUpdate(values)
  }

  const onSubmit = (values: FormData) => {
    onUpdate(values)
    onNext()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-brand-500" />
        <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
      </div>

      {savedAddresses && savedAddresses.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Saved Addresses</p>
          <div className="grid gap-3">
            {savedAddresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => selectSavedAddress(addr)}
                className="text-left p-4 border border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-colors text-sm"
              >
                <p className="font-medium text-gray-900">{addr.full_name}</p>
                <p className="text-gray-500">{addr.address_line1}, {addr.city}, {addr.state} {addr.postal_code}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Or enter a new address below</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input {...register('full_name')} className="input-field" placeholder="John Doe" />
            {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input {...register('phone')} className="input-field" placeholder="+1 555 0100" />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
          <input {...register('address_line1')} className="input-field" placeholder="123 Main St" />
          {errors.address_line1 && <p className="text-xs text-red-500 mt-1">{errors.address_line1.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
          <input {...register('address_line2')} className="input-field" placeholder="Apt, Suite, etc. (optional)" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input {...register('city')} className="input-field" placeholder="New York" />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input {...register('state')} className="input-field" placeholder="NY" />
            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
            <input {...register('postal_code')} className="input-field" placeholder="10001" />
            {errors.postal_code && <p className="text-xs text-red-500 mt-1">{errors.postal_code.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <select {...register('country')} className="input-field">
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="BD">Bangladesh</option>
              <option value="IN">India</option>
            </select>
            {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary flex items-center gap-2">
            Continue to Payment
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
