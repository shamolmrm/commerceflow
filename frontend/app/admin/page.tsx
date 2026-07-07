import type { Metadata } from 'next'
import AdminDashboard from './AdminDashboard'

export const metadata: Metadata = { title: 'Dashboard | Admin' }

export default function AdminPage() {
  return <AdminDashboard />
}
