'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Search, Grid, X } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', slug: '', description: '', is_active: true })
  const [editId, setEditId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories', search],
    queryFn: () =>
      api.get('/categories/', { params: { search: search || undefined, page_size: 100 } })
        .then((r) => r.data.results ?? r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (d: typeof form) =>
      editId ? api.patch(`/categories/${form.slug}/`, d) : api.post('/categories/', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(editId ? 'Category updated' : 'Category created')
      resetForm()
    },
    onError: () => toast.error('Failed to save category'),
  })

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => api.delete(`/categories/${slug}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success('Category deleted')
      setDeleteId(null)
    },
  })

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', is_active: true })
    setEditId(null)
    setShowForm(false)
  }

  const openEdit = (cat: any) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', is_active: cat.is_active })
    setEditId(cat.id)
    setShowForm(true)
  }

  const slugify = (val: string) =>
    val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.length ?? '—'} total categories</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">{editId ? 'Edit Category' : 'New Category'}</h2>
            <button onClick={resetForm} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g. Electronics"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Slug *</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="electronics"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                rows={2}
                placeholder="Optional description..."
              />
            </div>
            <div className="flex items-center gap-3">
              <div
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${form.is_active ? 'bg-indigo-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <label className="text-sm text-gray-700 cursor-pointer select-none" onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}>
                {form.is_active ? 'Active' : 'Inactive'}
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={resetForm} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button
              onClick={() => saveMutation.mutate(form)}
              disabled={!form.name || saveMutation.isPending}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left">
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Slug</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4].map((j) => (
                    <td key={j} className="px-4 py-3.5"><div className="skeleton h-5 rounded-lg" /></td>
                  ))}</tr>
                ))
              : data?.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Grid className="w-3.5 h-3.5 text-violet-500" />
                        </div>
                        <span className="font-semibold text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 font-mono text-xs hidden sm:table-cell">{cat.slug}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && !data?.length && (
          <div className="text-center py-14 text-gray-400 text-sm">No categories found</div>
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
            <h3 className="font-bold text-gray-900 text-center mb-1">Delete Category?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This may affect products in this category.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                onClick={() => { const cat = data?.find((c: any) => c.id === deleteId); if (cat) deleteMutation.mutate(cat.slug) }}
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
