import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AccountSidebar from '@/components/account/AccountSidebar'

export const metadata: Metadata = { title: 'My Account | CommerceFlow' }

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-[120px] pb-16">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <AccountSidebar />
            <div className="lg:col-span-3">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
