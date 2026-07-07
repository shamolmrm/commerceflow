'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit2, Trash2, Upload, Download, Eye, Package } from 'lucide-react'
import { formatCurrency, getImageUrl } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [ordering, setOrdering] = useState('-created_at')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page, ordering],
    queryFn: () => api.get('/products/', {
      params: { search: search || undefined, page, ordering, page_size: 20 },
    }).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Product deleted')
      setDeleteId(null)
    },
    onError: () => toast.error('Delete failed'),
  })

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.post('/products/bulk-upload/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(`${res.data.created} products imported`)
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    } catch {
      toast.error('Bulk upload failed')
    }
    e.target.value = ''
  }

  const handleExport = async () => {
    try {
      const res = await api.get('/products/export/', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'products.csv'
      a.click()
    } catch {
      toast.error('Export failed')
    }
  }

  const stockColor = (qty: number) =>
    qty === 0 ? 'text-red-500 bg-red-50' : qty < 10 ? 'text-amber-500 bg-amber-50' : 'text-green-600 bg-green-50'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.count ?? '—'} total products
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" /> Import CSV
            <input type="file" accept=".csv" className="sr-only" onChange={handleBulkUpload} />
          </label>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
        <select
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700"
        >
          <option value="-created_at">Newest First</option>
          <option value="price">Price: Low → High</option>
          <option value="-price">Price: High → Low</option>
          <option value="name">Name A–Z</option>
          <option value="-rating">Top Rated</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left">
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="skeleton h-5 rounded-lg" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.results?.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            {product.primary_image?.url ? (
                              <Image
                                src={getImageUrl(product.primary_image.url)}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{product.brand?.name} · {product.category?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">{product.sku}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900">{formatCurrency(product.effective_price)}</p>
                        {product.sale_price && (
                          <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${stockColor(product.total_stock ?? 0)}`}>
                          {product.total_stock ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {product.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.count > 20 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 text-sm bg-gray-50/50">
            <span className="text-gray-500 text-xs">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.count)} of {data.count}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!data.previous}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-white disabled:opacity-40 transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.next}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-white disabled:opacity-40 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-1">Delete Product?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-70"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
