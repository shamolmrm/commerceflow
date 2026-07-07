'use client'

import { useBrands } from '@/hooks/useProducts'

const fallbackBrands = [
  'Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Zara', 'H&M',
  'Dell', 'HP', 'Lenovo', 'Canon', 'LG', 'Bose', 'Under Armour',
  'Puma', 'Reebok', 'New Balance', 'ASUS', 'Microsoft', 'Amazon'
]

export default function BrandsSlider() {
  const { data: brands } = useBrands()
  const brandNames = brands?.map((b) => b.name) || fallbackBrands

  // Duplicate for infinite scroll
  const allBrands = [...brandNames, ...brandNames]

  return (
    <section className="py-12 border-y border-gray-100 overflow-hidden">
      <div className="section-container mb-6">
        <h2 className="text-xl font-semibold text-gray-900 text-center">Trusted Brands</h2>
      </div>

      <div className="marquee-container">
        <div className="marquee-track">
          {allBrands.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex items-center justify-center mx-8 min-w-[120px] h-12"
            >
              <span className="text-gray-400 font-bold text-lg hover:text-brand-500 transition-colors cursor-pointer whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
