'use client'

import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ShoppingCart, Package, ChevronDown, ChevronRight, Eye } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { getBundleProducts } from '@/lib/database'
import { ProductDetailDialog } from './ProductDetailDialog'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface BundleCardProps {
  product: Product
}

export function BundleCard({ product }: BundleCardProps) {
  const { addToCart } = useCart()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAddingToCart(true)
    await addToCart(product)
    // Reset animation after a brief delay
    setTimeout(() => setIsAddingToCart(false), 600)
  }

  const handleCardClick = () => {
    setIsDialogOpen(true)
  }

  // Get child products for this bundle
  const [childProducts, setChildProducts] = useState<any[]>([])

  useEffect(() => {
    getBundleProducts(product.id).then(setChildProducts)
  }, [product.id])

  const bundleSubtotal = childProducts.reduce((total, child) => {
    return total + (child?.child_product?.price || 0) * (child?.quantity_ratio || 1)
  }, 0)

  return (
    <>
      <Card 
        className="group flex h-full flex-col overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 hover:bg-muted/30 border-2 cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={product.imageUrl || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Badge className="absolute top-3 right-3">
              <Package className="mr-1 h-3 w-3" />
              Bundle
            </Badge>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white/90 rounded-full p-2">
                  <Eye className="h-4 w-4 text-gray-700" />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      
        <CardContent className="flex-1 p-4">
          <CardTitle className="mb-2 line-clamp-2 text-lg group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description}
          </p>
        
        <div className="space-y-2 mb-4">
          <div className="text-2xl font-bold">
            {formatPrice(product.price)}
          </div>
          <div className="text-sm text-muted-foreground">
            Bundle value: {formatPrice(bundleSubtotal)}
            {product.price < bundleSubtotal && (
              <span className="ml-1 font-medium">
                (Save {formatPrice(bundleSubtotal - product.price)})
              </span>
            )}
          </div>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between p-0 h-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm">Includes {childProducts.length} items</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2">
              {childProducts.map((child) => (
                <div key={child?.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="relative h-8 w-8 overflow-hidden rounded">
                      <Image
                        src={child?.child_product?.image_url || '/placeholder-product.jpg'}
                        alt={child?.child_product?.name || ''}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                    <span className="font-medium">{child?.child_product?.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(child?.child_product?.price || 0)}</div>
                    {child?.quantity_ratio && child.quantity_ratio > 1 && (
                      <div className="text-xs text-muted-foreground">×{child.quantity_ratio}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={handleAddToCart}
            className={`w-full transition-all duration-300 ${isAddingToCart ? 'scale-95 bg-green-600 hover:bg-green-700' : ''}`}
            disabled={isAddingToCart}
          >
            <ShoppingCart className={`mr-2 h-4 w-4 transition-transform duration-300 ${isAddingToCart ? 'scale-110' : ''}`} />
            {isAddingToCart ? 'Added!' : 'Add Bundle to Cart'}
          </Button>
        </CardFooter>
      </Card>

      <ProductDetailDialog
        product={product}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  )
}
