'use client'

import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CartItem } from './CartItem'
import { ShoppingCart, ShoppingBag } from 'lucide-react'

export function CartSidebar() {
  const { cart, isOpen, setIsOpen, clearCart } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart
          {cart.itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
              {cart.itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center text-lg">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Shopping Cart
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex h-full flex-col">
          {cart.items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">Add some products to get started</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pb-4">
                <div className="space-y-0">
                  {cart.items
                    .filter(item => !item.isBundleItem) // Show only main items (bundles and individual products)
                    .map((item) => (
                      <div key={item.id}>
                        <CartItem item={item} />
                        {/* Show bundle children if this is a bundle */}
                        {item.product.isBundle && (
                          <div className="ml-4 border-l-2 border-border pl-4">
                            {cart.items
                              .filter(child => child.parentBundleId === item.productId)
                              .map((child) => (
                                <div key={child.id} className="opacity-75">
                                  <CartItem item={child} />
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="border-t bg-background p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold">
                    {formatPrice(cart.total)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    Checkout
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
