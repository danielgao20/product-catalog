'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Package, DollarSign, Hash, Search } from 'lucide-react'
import { Product } from '@/lib/types'
import { eventManager, EVENTS } from '@/lib/events'

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showBundlesOnly, setShowBundlesOnly] = useState(false)
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  useEffect(() => {
    fetchProducts()
    
    // Listen for stock update events
    const handleStockUpdate = () => {
      fetchProducts()
    }
    
    eventManager.on(EVENTS.STOCK_UPDATED, handleStockUpdate)
    
    // Cleanup event listener
    return () => {
      eventManager.off(EVENTS.STOCK_UPDATED, handleStockUpdate)
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/admin/products?t=${Date.now()}`)
      const data = await response.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      const data = await response.json()
      if (data.success) {
        await fetchProducts()
        setIsDialogOpen(false)
        setEditingProduct(null)
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchProducts()
      } else {
        alert(`Failed to delete product: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product. Please try again.')
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBundleFilter = !showBundlesOnly || product.isBundle
    const matchesLowStockFilter = !showLowStockOnly || (product.stockCount || 0) <= 5
    return matchesSearch && matchesBundleFilter && matchesLowStockFilter
  })

  // Calculate inventory stats
  const totalProducts = products.length
  const totalStock = products.reduce((sum, product) => sum + (product.stockCount || 0), 0)
  const lowStockProducts = products.filter(product => (product.stockCount || 0) <= 5 && (product.stockCount || 0) > 0).length
  const outOfStockProducts = products.filter(product => (product.stockCount || 0) === 0).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
              </div>
              <Hash className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-amber-600">{lowStockProducts}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 text-sm font-bold">!</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">×</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="bundles-only"
                checked={showBundlesOnly}
                onChange={(e) => setShowBundlesOnly(e.target.checked)}
                className="h-4 w-4 rounded border border-input"
              />
              <label htmlFor="bundles-only" className="text-sm font-medium leading-none">
                Bundles only
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="low-stock-only"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border border-input"
              />
              <label htmlFor="low-stock-only" className="text-sm font-medium leading-none">
                Low stock
              </label>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </DialogTitle>
                </DialogHeader>
                <ProductForm 
                  product={editingProduct} 
                  onSave={handleSaveProduct}
                  onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingProduct(null)
                  }}
                />
              </DialogContent>
            </Dialog>
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
            {loading ? 'Loading...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'} found`}
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {product.isBundle && (
                    <Badge variant="secondary">Bundle</Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.imageUrl && (
                    <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">${product.price}</span>
                      </div>
                      <Badge variant={(product.stockCount || 0) > 10 ? "default" : (product.stockCount || 0) > 0 ? "secondary" : "destructive"}>
                        {product.stockCount || 0} in stock
                      </Badge>
                    </div>
                    {(product.stockCount || 0) <= 5 && (product.stockCount || 0) > 0 && (
                      <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        Low stock warning
                      </div>
                    )}
                    {(product.stockCount || 0) === 0 && (
                      <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        Out of stock
                      </div>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductForm({ 
  product, 
  onSave, 
  onCancel 
}: { 
  product: Product | null
  onSave: (data: Partial<Product>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    imageUrl: product?.imageUrl || '',
    stockCount: product?.stockCount || 0,
    inStock: product?.inStock ?? true,
    isBundle: product?.isBundle || false,
    details: product?.details || '',
    features: product?.features?.join(', ') || ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }))
      } else {
        setUploadError(data.error || 'Upload failed')
      }
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      features: formData.features ? formData.features.split(',').map(f => f.trim()) : []
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">Product Image</Label>
        <div className="space-y-3">
          {/* Image URL Input */}
          <div>
            <Input
              id="imageUrl"
              placeholder="Paste an image URL (supports Unsplash)"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="max-w-md"
            />
          </div>

          {/* Upload Section */}
          <div className="text-sm font-normal text-gray-500 mb-2">Upload from your device:</div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              id="file-upload"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload(file)
                }
              }}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
            <span className="text-sm text-gray-500">
              JPG, PNG, WebP (max 5MB)
            </span>
          </div>
          
          {uploadError && (
            <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
              {uploadError}
            </div>
          )}
          
          {formData.imageUrl && (
            <div className="relative">
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden max-w-sm">
                <img 
                  src={formData.imageUrl} 
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setFormData({ ...formData, imageUrl: '' })}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stockCount">Stock Count</Label>
          <Input
            id="stockCount"
            type="number"
            value={formData.stockCount}
            onChange={(e) => setFormData({ ...formData, stockCount: parseInt(e.target.value) })}
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="inStock"
            checked={formData.inStock}
            onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="inStock">In Stock</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="features">Features (comma-separated)</Label>
        <Input
          id="features"
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          placeholder="Feature 1, Feature 2, Feature 3"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}