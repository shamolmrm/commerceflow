'use client'

import { Fragment, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Search, ArrowUpDown, Warehouse, X } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

type Tab = 'all' | 'low'

export default function AdminInventoryPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [adjusting, setAdjusting] = useState<number | null>(null)
  const [adjustForm, setAdjustForm] = useState({ quantity: '', change_type: 'adjust', notes: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory', tab, search],
    queryFn: () => {
      const url = tab === 'low' ? '/inventory/low-stock/' : '/inventory/'
      return api.get(url, { params: { search: search || undefined, page_size: 50 } })
        .then((r) => r.data.results ?? r.data)
    },
  })

  const adjustMutation = useMutation({
    mutationFn: ({ id, ...payload }: any) => api.post(`/inventory/${id}/adjust/`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })
      toast.success('Inventory adjusted')
      setAdjusting(null)
    },
    onError: () => toast.error('Adjustment failed'),
  })

  const stockLevel = (qty: number, threshold: number) => {
    if (qty === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700', bar: 'bg-red-400' }
    if (qty <= threshold) return { label: 'Low Stock', cls: 'bg-amber-100 text-amber-700', bar: 'bg-amber-400' }
    return { label: 'In Stock', cls: 'bg-green-100 text-green-700', bar: 'bg-green-400' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.length ?? '—'} items</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-200'}`}
          >
            All Stock
          </button>
          <button
            onClick={() => setTab('low')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'low' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-200'}`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock
          </button>
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left">
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Warehouse</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Threshold</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{[1, 2, 3, 4, 5].map((j) => (
                    <td key={j} className="px-4 py-3.5"><div className="skeleton h-5 rounded-lg" /></td>
                  ))}</tr>
                ))
              : data?.map((inv: any) => {
                  const level = stockLevel(inv.quantity, inv.low_stock_threshold)
                  return (
                    <Fragment key={inv.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Warehouse className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">
                                {inv.product?.name || inv.product_name}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">{inv.product?.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 hidden sm:table-cell">{inv.warehouse?.name}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900 w-8 text-right">{inv.quantity}</span>
                            <div className="flex-1 max-w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${level.bar}`}
                                style={{ width: `${Math.min((inv.quantity / Math.max(inv.low_stock_threshold * 3, 1)) * 100, 100)}%` }}
                              />
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${level.cls}`}>
                              {level.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-400 text-sm hidden md:table-cell">{inv.low_stock_threshold}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setAdjusting(adjusting === inv.id ? null : inv.id)
                              setAdjustForm({ quantity: '', change_type: 'adjust', notes: '' })
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                          >
                            <ArrowUpDown className="w-3 h-3" />
                            Adjust
                          </button>
                        </td>
                      </tr>

                      {adjusting === inv.id && (
                        <tr>
                          <td colSpan={5} className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
                            <div className="flex flex-wrap items-end gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
                                <select
                                  value={adjustForm.change_type}
                                  onChange={(e) => setAdjustForm((f) => ({ ...f, change_type: e.target.value }))}
                                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                >
                                  <option value="in">Stock In</option>
                                  <option value="out">Stock Out</option>
                                  <option value="adjust">Adjust</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quantity</label>
                                <input
                                  type="number"
                                  value={adjustForm.quantity}
                                  onChange={(e) => setAdjustForm((f) => ({ ...f, quantity: e.target.value }))}
                                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-24 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                  placeholder="0"
                                />
                              </div>
                              <div className="flex-1 min-w-[180px]">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
                                <input
                                  value={adjustForm.notes}
                                  onChange={(e) => setAdjustForm((f) => ({ ...f, notes: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                  placeholder="Reason for adjustment"
                                />
                              </div>
                              <button
                                onClick={() => adjustMutation.mutate({ id: inv.id, ...adjustForm, quantity: parseInt(adjustForm.quantity) })}
                                disabled={!adjustForm.quantity || adjustMutation.isPending}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                              >
                                Save
                              </button>
                              <button onClick={() => setAdjusting(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
          </tbody>
        </table>
        {!isLoading && !data?.length && (
          <div className="text-center py-14 text-gray-400 text-sm">No inventory items found</div>
        )}
      </div>
    </div>
  )
}
