'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Plus, Edit2, Trash2, Star } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressSchema } from '@/lib/validators'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Address } from '@/types'
import type { z } from 'zod'

type FormData = z.infer<typeof addressSchema>

export default function AddressesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editAddress, setEditAddress] = useState<Address | null>(null)

  const { data: addresses, isLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => api.get('/addresses/').then((r) => r.data.results ?? r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(addressSchema),
  })

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      editAddress
        ? api.put(`/addresses/${editAddress.id}/`, data)
        : api.post('/addresses/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success(editAddress ? 'Address updated' : 'Address added')
      setShowForm(false)
      setEditAddress(null)
      reset()
    },
    onError: () => toast.error('Failed to save address'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/addresses/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address deleted')
    },
  })

  const openEdit = (addr: Address) => {
    setEditAddress(addr)
    reset({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
    })
    setShowForm(true)
  }

  const onSubmit = (data: FormData) => saveMutation.mutate(data)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditAddress(null); reset() }}
          className="btn-primary flex items-center gap-2 py-2 px-4"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-brand-200 shadow-card p-6">
          <h2 className="font-bold text-gray-900 mb-5">{editAddress ? 'Edit Address' : 'New Address'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input {...register('full_name')} className="input-field" />
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input {...register('phone')} className="input-field" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
              <input {...register('address_line1')} className="input-field" />
              {errors.address_line1 && <p className="text-xs text-red-500 mt-1">{errors.address_line1.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
              <input {...register('address_line2')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input {...register('city')} className="input-field" />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input {...register('state')} className="input-field" />
              {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
              <input {...register('postal_code')} className="input-field" />
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
            </div>
            <div className="col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditAddress(null); reset() }} className="btn-outline py-2 px-4">
                Cancel
              </button>
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary py-2 px-4">
                {saveMutation.isPending ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address list */}
      {isLoading ? (
        <div className="grid gap-4">{[1, 2].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      ) : !addresses?.length ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-16 text-center">
          <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-900">No saved addresses</p>
          <p className="text-sm text-gray-500">Add an address to speed up checkout</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{addr.full_name}</p>
                    {addr.is_default && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{addr.phone}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {addr.address_line1}, {addr.city}, {addr.state} {addr.postal_code}, {addr.country}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(addr)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(addr.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
