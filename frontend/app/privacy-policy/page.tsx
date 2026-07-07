import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Shield } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'Privacy Policy | CommerceFlow' }

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, such as when you:
• Create an account (name, email, password)
• Place an order (shipping address, payment details)
• Contact our support team
• Subscribe to our newsletter

We also automatically collect certain information when you use our services, including:
• Device information (browser type, IP address, operating system)
• Usage data (pages visited, time spent, clicks)
• Cookies and similar tracking technologies`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:
• Process and fulfill your orders
• Send order confirmations, shipping updates, and receipts
• Provide customer support
• Send promotional emails (with your consent)
• Improve our website and services
• Detect and prevent fraud
• Comply with legal obligations`,
  },
  {
    title: '3. Information Sharing',
    content: `We do not sell, trade, or rent your personal information. We may share your information with:
• Payment processors (Stripe, PayPal) — to process transactions
• Shipping carriers (FedEx, DHL) — to deliver your orders
• Analytics providers (Google Analytics) — to improve our services
• Legal authorities — when required by law or to protect our rights

All third-party partners are contractually bound to protect your information.`,
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures including:
• 256-bit SSL/TLS encryption for all data transmission
• PCI DSS compliance for payment processing
• Regular security audits and penetration testing
• Access controls limiting employee data access
• Encrypted storage of sensitive information

No method of transmission over the Internet is 100% secure. We strive to protect your personal information but cannot guarantee absolute security.`,
  },
  {
    title: '5. Cookies Policy',
    content: `We use cookies and similar tracking technologies to:
• Keep you logged in
• Remember your cart and preferences
• Analyze site traffic and usage patterns
• Personalize your shopping experience
• Show relevant advertisements

You can control cookies through your browser settings. Disabling cookies may affect the functionality of our website.`,
  },
  {
    title: '6. Your Rights',
    content: `You have the right to:
• Access the personal data we hold about you
• Correct inaccurate or incomplete data
• Request deletion of your personal data
• Opt out of marketing communications
• Data portability (receive your data in a machine-readable format)
• Lodge a complaint with your local data protection authority

To exercise these rights, contact us at privacy@commerceflow.com.`,
  },
  {
    title: '7. Data Retention',
    content: `We retain your personal information for as long as necessary to:
• Maintain your account and provide our services
• Comply with legal obligations (typically 7 years for financial records)
• Resolve disputes and enforce our agreements

When you delete your account, we anonymize your data within 30 days, though some information may be retained for legal compliance.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately at privacy@commerceflow.com and we will delete it promptly.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by:
• Posting the new policy on this page with an updated date
• Sending you an email notification
• Displaying a prominent notice on our website

Your continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact:

CommerceFlow Privacy Team
Email: privacy@commerceflow.com
Address: 123 Commerce Street, Dhaka, Bangladesh
Phone: +880 1700-000000

We aim to respond to all privacy requests within 30 days.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-[120px] pb-16">
        <div className="section-container py-8 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-brand-500">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">Privacy Policy</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-500 mt-2 text-sm">Last updated: June 13, 2026</p>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              At CommerceFlow, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.
            </p>
          </div>

          <div className="space-y-4">
            {SECTIONS.map(({ title, content }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="font-bold text-gray-900 mb-3">{title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
