'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success('Message sent! We\'ll get back to you within 24 hours.')
    setForm({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-[120px] pb-16">
        <div className="section-container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-brand-500">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">Contact Us</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Get in Touch</h1>
            <p className="text-gray-500 mt-3">We're here to help. Send us a message and we'll respond within 24 hours.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-4">
              {[
                { icon: MapPin, title: 'Visit Us', lines: ['123 Commerce Street', 'Dhaka, Bangladesh'] },
                { icon: Phone, title: 'Call Us', lines: ['+880 1700-000000', 'Mon – Fri, 9am – 6pm'] },
                { icon: Mail, title: 'Email Us', lines: ['support@commerceflow.com', 'We reply within 24 hours'] },
                { icon: Clock, title: 'Working Hours', lines: ['Mon – Fri: 9am – 6pm', 'Sat – Sun: 10am – 4pm'] },
              ].map(({ icon: Icon, title, lines }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    {lines.map((l) => <p key={l} className="text-sm text-gray-500">{l}</p>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="font-bold text-gray-900 mb-5">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="input-field" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required className="input-field" placeholder="john@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="input-field" placeholder="Order issue, product question, feedback..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} required rows={6} className="input-field resize-none" placeholder="Describe your issue or question in detail..." />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
