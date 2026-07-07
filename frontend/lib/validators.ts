import { z } from 'zod'

// Auth validators
export const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const otpSchema = z.object({
  otp_code: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
})

export const resetPasswordSchema = z.object({
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

// Address validator — matches Django model fields
export const addressSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(6, 'Phone number is required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postal_code: z.string().min(4, 'Postal code is required'),
  is_default: z.boolean().optional(),
})

// Checkout validator
export const checkoutSchema = z.object({
  shipping_address_id: z.number({ required_error: 'Please select a shipping address' }),
  billing_address_id: z.number().optional(),
  payment_method: z.enum(['stripe', 'paypal', 'sslcommerz', 'cod']),
  notes: z.string().optional(),
  coupon_code: z.string().optional(),
})

// Profile update validator
export const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
})

// Review validator
export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(10, 'Review must be at least 10 characters'),
})

// Newsletter validator
export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Admin product validator
export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  category: z.coerce.number({ required_error: 'Category is required' }).min(1, 'Category is required'),
  brand: z.coerce.number().optional(),
  price: z.string().min(1, 'Price is required'),
  sale_price: z.string().optional(),
  weight: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  specifications: z.record(z.string()).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type ProductInput = z.infer<typeof productSchema>
