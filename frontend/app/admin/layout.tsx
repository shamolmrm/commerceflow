import type { Metadata } from 'next'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminTopBar from '@/components/admin/AdminTopBar'
import AdminGuard from './AdminGuard'

export const metadata: Metadata = { title: 'Admin | CommerceFlow' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        <AdminTopBar />
        <main className="flex-1 p-6 lg:p-8">
          <AdminGuard>{children}</AdminGuard>
        </main>
      </div>
    </div>
  )
}
