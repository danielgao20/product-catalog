'use client'

import { ProductGrid } from '@/components/products/ProductGrid'
import { CartSidebar } from '@/components/cart/CartSidebar'
import { getProducts } from '@/lib/database'
import { Product } from '@/lib/types'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Package } from 'lucide-react'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showBundlesOnly, setShowBundlesOnly] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await getProducts()
        setProducts(fetchedProducts)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
    
    // Refresh products every 30 seconds to catch any changes
    const interval = setInterval(loadProducts, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBundleFilter = !showBundlesOnly || product.isBundle
    return matchesSearch && matchesBundleFilter
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Wiley's Store</h1>
            </div>
            <CartSidebar />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="bundles-only"
                checked={showBundlesOnly}
                onChange={(e) => setShowBundlesOnly(e.target.checked)}
                className="h-4 w-4 rounded border border-input"
              />
              <label htmlFor="bundles-only" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Show bundles only
              </label>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Products
            </h2>
            <p className="text-muted-foreground">
              {isLoading ? 'Loading...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'} found`}
            </p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </main>
    </div>
  )
}
