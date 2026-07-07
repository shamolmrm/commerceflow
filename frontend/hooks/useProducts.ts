import { useQuery, keepPreviousData } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ProductFilters, PaginatedResponse, Product, Category, Brand } from '@/types'

export function useProducts(filters: ProductFilters = {}, options?: { initialData?: PaginatedResponse<Product> }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
      const { data } = await api.get<PaginatedResponse<Product>>(`/products/?${params}`)
      return data
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    initialData: options?.initialData,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${slug}/`)
      return data
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!slug,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Category> | Category[]>('/categories/')
      // Handle both paginated { results: [] } and direct array responses
      return (Array.isArray(data) ? data : (data as PaginatedResponse<Category>).results) as Category[]
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Brand> | Brand[]>('/brands/?page_size=100')
      return (Array.isArray(data) ? data : (data as PaginatedResponse<Brand>).results) as Brand[]
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/products/?is_featured=true&page_size=8')
      return data.results ?? []
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/products/?ordering=-created_at&page_size=8')
      return data.results ?? []
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useBestSellers() {
  return useQuery({
    queryKey: ['products', 'best-sellers'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/products/?ordering=-review_count&page_size=8')
      return data.results ?? []
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useTopRated() {
  return useQuery({
    queryKey: ['products', 'top-rated'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/products/?ordering=-rating&page_size=8')
      return data.results ?? []
    },
    staleTime: 5 * 60 * 1000,
  })
}
