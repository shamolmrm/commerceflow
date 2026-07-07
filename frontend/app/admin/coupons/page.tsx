'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Search, Percent, X } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const emptyForm = {
  code: '', type: 'percentage', value: '', min_order_amount: '',
  max_uses: '', expiry: '', is_active: true, description: '',
}

export default function AdminCouponsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons', search],
    queryFn: () =>
      api.get('/coupons/', { params: { search: search || undefined, page_size: 100 } })
        .then((r) => r.data.results ?? r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (d: any) =>
      editId ? api.patch(`/coupons/${editId}/`, d) : api.post('/coupons/', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success(editId ? 'Coupon updated' : 'Coupon created')
      resetForm()
    },
    onError: () => toast.error('Failed to save coupon'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/coupons/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon deleted')
      setDeleteId(null)
    },
  })

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false) }

  const openEdit = (c: any) => {
    setForm({
      code: c.code, type: c.type, value: String(c.value),
      min_order_amount: String(c.min_order_amount || ''),
      max_uses: String(c.max_uses || ''),
      expiry: c.expiry ? c.expiry.split('T')[0] : '',
      is_active: c.is_active, description: c.description || '',
    })
    setEditId(c.id)
    setShowForm(true)
  }

  const handleSave = () => {
    saveMutation.mutate({
      ...form,
      value: parseFloat(form.value),
      min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : undefined,
      max_uses: form.max_uses ? parseInt(form.max_uses) : undefined,
      expiry: form.expiry || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.length ?? '—'} total coupons</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">{editId ? 'Edit Coupon' : 'New Coupon'}</h2>
            <button onClick={resetForm} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 tracking-widest"
                placeholder="SAVE10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Value * {form.type === 'percentage' ? '(%)' : '($)'}
              </label>
              <input
                type="number" value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="10" min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Min Order ($)</label>
              <input
                type="number" value={form.min_order_amount}
                onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="0" min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Max Uses</label>
              <input
                type="number" value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Unlimited" min="1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Expiry Date</label>
              <input
                type="date" value={form.expiry}
                onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="10% off on all orders"
              />
            </div>
            <div className="flex items-center gap-3">
              <div
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${form.is_active ? 'bg-indigo-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-gray-700 cursor-pointer select-none" onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}>
                {form.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={resetForm} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!form.code || !form.value || saveMutation.isPending}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Coupon'}
            </button>
          </div>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coupons..." className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-64" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left">
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Uses</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Expiry</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4,5,6].map((j) => <td key={j} className="px-4 py-3.5"><div className="skeleton h-5 rounded-lg" /></td>)}</tr>
                ))
              : data?.map((coupon: any) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Percent className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <span className="font-bold text-indigo-600 font-mono tracking-wider">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-gray-900">
                        {coupon.type === 'percentage' ? `${coupon.value}% off` : formatCurrency(coupon.value)}
                      </span>
                      {coupon.min_order_amount > 0 && (
                        <p className="text-xs text-gray-400">min {formatCurrency(coupon.min_order_amount)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 hidden sm:table-cell">
                      {coupon.used_count || 0}{coupon.max_uses ? `/${coupon.max_uses}` : ''}
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs hidden md:table-cell">
                      {coupon.expiry ? formatDate(coupon.expiry) : 'Never'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(coupon)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(coupon.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && !data?.length && (
          <div className="text-center py-14 text-gray-400 text-sm">No coupons found</div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-1">Delete Coupon?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
