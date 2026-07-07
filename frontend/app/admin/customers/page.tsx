'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const ROLES = ['customer', 'staff', 'manager', 'superadmin']

const ROLE_STYLES: Record<string, string> = {
  superadmin: 'bg-red-100 text-red-700',
  manager:    'bg-amber-100 text-amber-700',
  staff:      'bg-blue-100 text-blue-700',
  customer:   'bg-gray-100 text-gray-600',
}

const AVATAR_COLORS = [
  'from-indigo-500 to-purple-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-violet-500 to-fuchsia-500',
]

function getAvatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

export default function AdminCustomersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search, page],
    queryFn: () => api.get('/users/users/', {
      params: { search: search || undefined, page, page_size: 20 },
    }).then((r) => r.data),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      api.patch(`/users/users/${id}/role/`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-customers'] })
      toast.success('Role updated')
    },
    onError: () => toast.error('Failed to update role'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.count ?? '—'} total users</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by name or email..."
          className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-72"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left">
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Joined</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4].map((j) => (
                    <td key={j} className="px-4 py-3.5"><div className="skeleton h-5 rounded-lg" /></td>
                  ))}</tr>
                ))
              : data?.results?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(user.id)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <span className="text-white text-sm font-bold">
                            {(user.first_name || user.email)?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.first_name || user.last_name
                              ? `${user.first_name} ${user.last_name}`.trim()
                              : '—'}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs hidden sm:table-cell">
                      {formatDate(user.date_joined || user.created_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={user.role}
                        onChange={(e) => updateRoleMutation.mutate({ id: user.id, role: e.target.value })}
                        className={`pr-6 pl-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer appearance-none capitalize ${ROLE_STYLES[user.role] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {(!isLoading && !data?.results?.length) && (
          <div className="flex flex-col items-center justify-center py-14 text-gray-400">
            <Users className="w-10 h-10 mb-2 text-gray-200" />
            <p className="text-sm">No customers found</p>
          </div>
        )}

        {data && data.count > 20 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 text-xs">
            <span className="text-gray-500">{data.count} users</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={!data.previous} className="px-3 py-1.5 border border-gray-200 rounded-lg font-medium hover:bg-white disabled:opacity-40 transition-colors">← Prev</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={!data.next} className="px-3 py-1.5 border border-gray-200 rounded-lg font-medium hover:bg-white disabled:opacity-40 transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
