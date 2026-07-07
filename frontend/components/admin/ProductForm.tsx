'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Upload, X, Check } from 'lucide-react'
import { productSchema } from '@/lib/validators'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { z } from 'zod'

type FormData = z.infer<typeof productSchema>

interface Props {
  product?: any
}

const STEPS = ['Basic Info', 'Pricing & Inventory', 'Images & Specs']

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const { data: categories } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: () => api.get('/categories/?page_size=100').then((r) => r.data.results ?? r.data),
  })

  const { data: brands } = useQuery({
    queryKey: ['brands-all'],
    queryFn: () => api.get('/brands/?page_size=100').then((r) => r.data.results ?? r.data),
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || '',
          short_description: product.short_description || '',
          sku: product.sku,
          price: String(product.price),
          sale_price: product.sale_price ? String(product.sale_price) : '',
          category: product.category?.id,
          brand: product.brand?.id,
          is_active: product.is_active ?? true,
          is_featured: product.is_featured ?? false,
          weight: product.weight ? String(product.weight) : '',
          specifications: product.specifications || {},
        }
      : { is_active: true, is_featured: false },
  })

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const endpoint = product ? `/products/${product.id}/` : '/products/'
      const method = product ? 'patch' : 'post'
      const res = await api[method](endpoint, {
        ...data,
        price: parseFloat(data.price),
        sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
      })

      // Upload images
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fd = new FormData()
          fd.append('image', file)
          await api.post(`/products/${res.data.id}/images/`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        }
      }
      return res.data
    },
    onSuccess: () => {
      toast.success(product ? 'Product updated' : 'Product created')
      router.push('/admin/products')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || 'Failed to save product'
      toast.error(msg)
    },
  })

  const onSubmit = (data: FormData) => mutation.mutate(data)

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImageFiles((prev) => [...prev, ...files])
    e.target.value = ''
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Step tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              step === i ? 'border-brand-500 text-brand-500' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {i < step ? <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5" />{s}</span> : s}
          </button>
        ))}
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input {...register('name')} className="input-field" placeholder="e.g. iPhone 15 Pro Max" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input {...register('sku')} className="input-field" placeholder="e.g. IPH-15-PM-256" />
              {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select {...register('category', { valueAsNumber: true })} className="input-field">
                <option value="">Select category</option>
                {categories?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select {...register('brand', { valueAsNumber: true })} className="input-field">
                <option value="">No brand</option>
                {brands?.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input {...register('weight')} type="number" step="0.01" className="input-field" placeholder="0.5" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <input {...register('short_description')} className="input-field" placeholder="One-line summary" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
              <textarea {...register('description')} rows={5} className="input-field resize-none" placeholder="Detailed product description..." />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('is_active')} type="checkbox" className="rounded" />
                <span className="text-sm font-medium text-gray-700">Active (visible)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('is_featured')} type="checkbox" className="rounded" />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => setStep(1)} className="btn-primary">Next: Pricing</button>
          </div>
        </div>
      )}

      {/* Step 1: Pricing */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price *</label>
              <input {...register('price')} type="number" step="0.01" className="input-field" placeholder="99.99" />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
              <input {...register('sale_price')} type="number" step="0.01" className="input-field" placeholder="79.99 (optional)" />
            </div>
          </div>
          {watch('sale_price') && watch('price') && parseFloat(watch('sale_price') || '0') < parseFloat(watch('price') || '0') && (
            <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700">
              Discount: {Math.round((1 - parseFloat(watch('sale_price') || '0') / parseFloat(watch('price') || '1')) * 100)}% off
            </div>
          )}
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(0)} className="btn-outline">Back</button>
            <button type="button" onClick={() => setStep(2)} className="btn-primary">Next: Images</button>
          </div>
        </div>
      )}

      {/* Step 2: Images */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Product Images</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-8 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload images</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
              <input type="file" multiple accept="image/*" className="sr-only" onChange={handleImageAdd} />
            </label>
            {imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {imageFiles.map((file, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="btn-outline">Back</button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {mutation.isPending ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
