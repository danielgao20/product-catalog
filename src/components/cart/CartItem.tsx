'use client'

import { CartItem as CartItemType } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import { useState } from 'react'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()
  const [isRemoving, setIsRemoving] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      setIsRemoving(true)
      await removeFromCart(item.productId)
      // Reset animation after a brief delay
      setTimeout(() => setIsRemoving(false), 600)
    } else {
      updateQuantity(item.productId, newQuantity)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    await removeFromCart(item.productId)
    // Reset animation after a brief delay
    setTimeout(() => setIsRemoving(false), 600)
  }

  // Don't show quantity controls for bundle items (they're managed by the parent bundle)
  const isBundleItem = item.isBundleItem

  return (
    <div className="flex items-center space-x-4 border-b p-4">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={item.product.imageUrl || '/placeholder-product.jpg'}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="64px"
        />
        {item.isBundleItem && (
          <Badge className="absolute -top-1 -right-1 text-xs">
            Bundle
          </Badge>
        )}
      </div>
      
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium">
          {item.product.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.product.price)} each
        </p>
        <div className="text-sm font-semibold">
          {formatPrice(item.product.price * item.quantity)}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {!isBundleItem ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium w-8 text-center">
              {item.quantity}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <span className="text-sm font-medium text-muted-foreground">
            Qty: {item.quantity}
          </span>
        )}
        
        {!isBundleItem && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className={`h-8 w-8 p-0 transition-all duration-300 ${
              isRemoving 
                ? 'scale-95 bg-red-100 text-red-600 hover:bg-red-200' 
                : 'text-destructive hover:text-destructive'
            }`}
            disabled={isRemoving}
          >
            <Trash2 className={`h-4 w-4 transition-transform duration-300 ${isRemoving ? 'scale-110' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  )
}
