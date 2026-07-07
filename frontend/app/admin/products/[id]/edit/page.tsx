'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import ProductForm from '@/components/admin/ProductForm'
import api from '@/lib/api'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: Props) {
  const { id } = use(params)
  const { data: product, isLoading } = useQuery({
    queryKey: ['product-admin', id],
    queryFn: () => api.get(`/products/${id}/`).then((r) => r.data),
  })

  if (isLoading) return <div className="skeleton h-96 rounded-2xl" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  )
}
