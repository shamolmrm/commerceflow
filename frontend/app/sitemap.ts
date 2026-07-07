import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://commerceflow.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/products/?page_size=500&is_active=true`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const data = await res.json()
      const products = data.results || data
      productRoutes = products.map((p: any) => ({
        url: `${BASE_URL}/products/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))
    }
  } catch {
    // Build continues even if API is down
  }

  return [...staticRoutes, ...productRoutes]
}
