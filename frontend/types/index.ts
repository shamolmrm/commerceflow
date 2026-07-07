// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name?: string
  phone?: string
  avatar?: string
  avatar_url?: string
  role: 'superadmin' | 'manager' | 'staff' | 'customer'
  is_verified: boolean
  created_at: string
}

export interface AuthState {
  user: User | null
  access: string | null
  refresh: string | null
  isLoading: boolean
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: number
  name: string
  slug: string
  parent?: number | null
  image?: string
  description?: string
  is_active: boolean
  sort_order: number
  children?: Category[]
  product_count?: number
}

// ─── Brand ───────────────────────────────────────────────────────────────────
export interface Brand {
  id: number
  name: string
  slug: string
  logo?: string
  website?: string
  is_active: boolean
  product_count?: number
}

// ─── Product ─────────────────────────────────────────────────────────────────
export interface ProductImage {
  id: number
  image?: string
  image_url?: string
  url: string
  alt_text: string
  is_primary: boolean
  sort_order: number
}

export interface ProductVariant {
  id: number
  name: string
  value: string
  price_modifier: number
  sku_suffix: string
  stock: number
  is_active: boolean
}

export interface Product {
  id: number
  name: string
  slug: string
  sku: string
  description?: string
  short_description?: string
  category?: Category
  category_name?: string
  brand?: Brand
  brand_name?: string
  price: number
  sale_price?: number
  effective_price: number
  discount_percentage: number
  tax_rate?: number
  weight?: number
  rating: number
  review_count: number
  is_featured: boolean
  is_active: boolean
  primary_image?: ProductImage
  images?: ProductImage[]
  variants?: ProductVariant[]
  total_stock?: number
  in_stock?: boolean
  is_wishlisted?: boolean
  specifications?: Record<string, string>
  created_at: string
  updated_at?: string
}

export interface ProductFilters {
  search?: string
  category?: string
  brand?: string
  min_price?: number
  max_price?: number
  min_rating?: number
  in_stock?: boolean
  is_featured?: boolean
  is_on_sale?: boolean
  ordering?: string
  page?: number
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: number
  product: Product
  variant?: ProductVariant
  variant_info?: string
  quantity: number
  unit_price: number
  line_total: number
  added_at: string
}

export interface Cart {
  id: number
  items: CartItem[]
  total: number
  item_count: number
  discount: number
  coupon_code?: string
}

// ─── Address ─────────────────────────────────────────────────────────────────
export interface Address {
  id: number
  label?: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  country: string
  postal_code: string
  is_default: boolean
  created_at?: string
}

// ─── Order ───────────────────────────────────────────────────────────────────
export interface OrderItem {
  id: number
  product?: number
  variant?: number
  product_name: string
  variant_info?: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface OrderStatusHistory {
  id: number
  status: string
  notes: string
  changed_by_name?: string
  created_at: string
}

export interface Order {
  id: number
  order_number: string
  user?: { id: number; email: string }
  customer?: number
  customer_name?: string
  customer_email?: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded'
  subtotal: number
  tax_amount: number
  shipping_cost: number
  discount_amount: number
  total: number
  coupon?: number
  shipping_address?: Address
  billing_address?: Address
  payment_method: 'stripe' | 'paypal' | 'sslcommerz' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  notes?: string
  tracking_number?: string
  estimated_delivery?: string
  items?: OrderItem[]
  status_history?: OrderStatusHistory[]
  created_at: string
  updated_at?: string
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface Review {
  id: number
  product: number
  user: number
  user_name: string
  user_avatar?: string
  rating: number
  title?: string
  body: string
  is_approved: boolean
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
}

// ─── Wishlist ────────────────────────────────────────────────────────────────
export interface WishlistItem {
  id: number
  product: Product
  added_at: string
}

// ─── Coupon ──────────────────────────────────────────────────────────────────
export interface Coupon {
  id: number
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order: number
  max_uses?: number
  used_count: number
  expiry: string
  is_active: boolean
  description?: string
}

// ─── Notification ────────────────────────────────────────────────────────────
export interface Notification {
  id: number
  type: string
  title: string
  message: string
  is_read: boolean
  link?: string
  created_at: string
}

// ─── Inventory ───────────────────────────────────────────────────────────────
export interface Inventory {
  id: number
  product: { id: number; name: string; sku: string } | null
  product_name?: string
  product_sku?: string
  warehouse: { id: number; name: string } | null
  warehouse_name?: string
  quantity: number
  low_stock_threshold: number
  is_low_stock: boolean
  is_out_of_stock: boolean
  updated_at: string
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export interface SalesData {
  date: string
  orders: number
  revenue: number
}

export interface RevenueData {
  month: string
  revenue: number
  orders: number
}

export interface TopProduct {
  id: number
  name: string
  sku: string
  total_sold: number
  revenue: number
}

export interface StatsOverview {
  total_revenue: number
  revenue_this_month: number
  orders_this_month: number
  new_customers_this_month: number
  total_orders: number
  active_products: number
  total_products: number
  total_customers: number
  low_stock_count: number
  out_of_stock_count: number
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
