import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'CommerceFlow — Premium E-commerce',
    template: '%s | CommerceFlow',
  },
  description: 'Shop premium products at unbeatable prices. Electronics, fashion, beauty, sports and more.',
  keywords: ['e-commerce', 'online shopping', 'electronics', 'fashion', 'beauty'],
  authors: [{ name: 'CommerceFlow' }],
  creator: 'CommerceFlow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'CommerceFlow',
    title: 'CommerceFlow — Premium E-commerce',
    description: 'Shop premium products at unbeatable prices.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'CommerceFlow' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CommerceFlow — Premium E-commerce',
    description: 'Shop premium products at unbeatable prices.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-white antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
