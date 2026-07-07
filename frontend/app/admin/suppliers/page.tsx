'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Search, Truck, X } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const emptyForm = { name: '', contact_person: '', email: '', phone: '', address: '', is_active: true }

export default function AdminSuppliersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-suppliers', search],
    queryFn: () =>
      api.get('/suppliers/', { params: { search: search || undefined, page_size: 100 } })
        .then((r) => r.data.results ?? r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (d: typeof form) =>
      editId ? api.patch(`/suppliers/${editId}/`, d) : api.post('/suppliers/', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-suppliers'] })
      toast.success(editId ? 'Supplier updated' : 'Supplier added')
      resetForm()
    },
    onError: () => toast.error('Failed to save supplier'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/suppliers/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-suppliers'] })
      toast.success('Supplier deleted')
      setDeleteId(null)
    },
  })

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false) }

  const openEdit = (s: any) => {
    setForm({ name: s.name, contact_person: s.contact_person || '', email: s.email || '', phone: s.phone || '', address: s.address || '', is_active: s.is_active })
    setEditId(s.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.length ?? '—'} total suppliers</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">{editId ? 'Edit Supplier' : 'New Supplier'}</h2>
            <button onClick={resetForm} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Company Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Supplier Co."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Contact Person</label>
              <input
                value={form.contact_person}
                onChange={(e) => setForm((f) => ({ ...f, contact_person: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="supplier@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="+1 555 0100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                rows={2}
                placeholder="123 Main St, New York, NY"
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
              onClick={() => saveMutation.mutate(form)}
              disabled={!form.name || saveMutation.isPending}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Supplier'}
            </button>
          </div>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-64"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left">
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4,5].map((j) => (
                    <td key={j} className="px-4 py-3.5"><div className="skeleton h-5 rounded-lg" /></td>
                  ))}</tr>
                ))
              : data?.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Truck className="w-3.5 h-3.5 text-orange-500" />
                        </div>
                        <span className="font-semibold text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 hidden sm:table-cell">{s.contact_person || '—'}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs hidden md:table-cell">{s.email || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && !data?.length && (
          <div className="text-center py-14 text-gray-400 text-sm">No suppliers found</div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-1">Delete Supplier?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
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
