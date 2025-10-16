'use client'

import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Eye } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { BundleCard } from './BundleCard'
import { ProductDetailDialog } from './ProductDetailDialog'
import Image from 'next/image'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
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

  // Use BundleCard for bundle products
  if (product.isBundle) {
    return <BundleCard product={product} />
  }

  return (
    <>
      <Card 
        className="group flex h-full flex-col overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 hover:bg-muted/30 cursor-pointer"
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
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {product.description}
          </p>
          <div className="text-2xl font-bold">
            {formatPrice(product.price)}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={handleAddToCart}
            className={`w-full transition-all duration-300 ${isAddingToCart ? 'scale-95 bg-green-600 hover:bg-green-700' : ''}`}
            disabled={isAddingToCart}
          >
            <ShoppingCart className={`mr-2 h-4 w-4 transition-transform duration-300 ${isAddingToCart ? 'scale-110' : ''}`} />
            {isAddingToCart ? 'Added!' : 'Add to Cart'}
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