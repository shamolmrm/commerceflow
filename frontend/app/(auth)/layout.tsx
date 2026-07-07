export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
