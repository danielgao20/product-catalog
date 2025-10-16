'use client'

import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Package, Check, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { getBundleProducts } from '@/lib/database'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface ProductDetailDialogProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailDialog({ product, isOpen, onClose }: ProductDetailDialogProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    await addToCart(product, quantity)
    // Reset animation after a brief delay
    setTimeout(() => {
      setIsAddingToCart(false)
      onClose()
    }, 600)
  }

  // Get child products for bundles
  const [childProducts, setChildProducts] = useState<any[]>([])

  useEffect(() => {
    if (product.isBundle) {
      getBundleProducts(product.id).then(setChildProducts)
    }
  }, [product.id, product.isBundle])

  const bundleSubtotal = childProducts.reduce((total, child) => {
    return total + (child?.child_product?.price || 0) * (child?.quantity_ratio || 1)
  }, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.isBundle && <Package className="h-5 w-5" />}
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={product.imageUrl || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {product.isBundle && (
                <Badge className="absolute top-3 right-3">
                  <Package className="mr-1 h-3 w-3" />
                  Bundle
                </Badge>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    In Stock ({product.stockCount} available)
                  </span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Price */}
            <div>
              <div className="text-3xl font-bold mb-2">
                {formatPrice(product.price)}
              </div>
              {product.isBundle && (
                <div className="text-sm text-muted-foreground">
                  Bundle value: {formatPrice(bundleSubtotal)}
                  {product.price < bundleSubtotal && (
                    <span className="ml-1 font-medium text-green-600">
                      (Save {formatPrice(bundleSubtotal - product.price)})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Details */}
            {product.details && (
              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <p className="text-muted-foreground">{product.details}</p>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Key Features</h3>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}


            {/* Bundle Contents */}
            {product.isBundle && childProducts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Bundle Contents</h3>
                <div className="space-y-2">
                  {childProducts.map((child) => (
                    <div key={child?.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded">
                          <Image
                            src={child?.child_product?.image_url || '/placeholder-product.jpg'}
                            alt={child?.child_product?.name || ''}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{child?.child_product?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatPrice(child?.child_product?.price || 0)}
                            {child?.quantity_ratio && child.quantity_ratio > 1 && (
                              <span> × {child.quantity_ratio}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stockCount || 10, quantity + 1))}
                    disabled={quantity >= (product.stockCount || 10)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleAddToCart}
                className={`w-full transition-all duration-300 ${isAddingToCart ? 'scale-95 bg-green-600 hover:bg-green-700' : ''}`}
                size="lg"
                disabled={!product.inStock || isAddingToCart}
              >
                <ShoppingCart className={`mr-2 h-4 w-4 transition-transform duration-300 ${isAddingToCart ? 'scale-110' : ''}`} />
                {isAddingToCart ? 'Added!' : `Add ${quantity} to Cart`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
