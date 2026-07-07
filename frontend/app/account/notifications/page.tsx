'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications/').then((r) => r.data.results ?? r.data),
  })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/notifications/${id}/`, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllMutation = useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read/'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unreadCount = data?.filter((n: any) => !n.is_read).length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : !data?.length ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-16 text-center">
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-900">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((notification: any) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
                notification.is_read
                  ? 'bg-white border-gray-100'
                  : 'bg-brand-50 border-brand-100'
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.is_read ? 'bg-gray-200' : 'bg-brand-500'}`} />
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(notification.created_at)}</p>
              </div>
              {!notification.is_read && (
                <button
                  onClick={() => markReadMutation.mutate(notification.id)}
                  className="p-1.5 hover:bg-brand-100 rounded-lg transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5 text-brand-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
