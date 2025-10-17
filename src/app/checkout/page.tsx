'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import { eventManager, EVENTS } from '@/lib/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [isValidCode, setIsValidCode] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase()
    setPromoCode(code)
    setIsValidCode(code === 'FREE')
  }

  const calculateTotal = () => {
    if (isValidCode && promoCode === 'FREE') {
      return 0
    }
    return cart.total
  }

  const handleCheckout = async () => {
    if (!isValidCode) {
      alert('Please enter a valid promo code (try "FREE")')
      return
    }

    setIsCheckingOut(true)
    
    try {
      // Prepare items for stock update (only main items, not bundle children)
      const itemsToUpdate = cart.items
        .filter(item => !item.isBundleItem)
        .map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          isBundle: item.product.isBundle
        }))

      // Update stock in database
      const stockResponse = await fetch('/api/products/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: itemsToUpdate })
      })

      if (!stockResponse.ok) {
        throw new Error('Failed to update stock')
      }

      // Emit event to refresh product data across the app
      eventManager.emit(EVENTS.STOCK_UPDATED)

      // Simulate additional checkout processing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Clear cart and show success
      await clearCart()
      setOrderComplete(true)
    } catch (error) {
      console.error('Checkout error:', error)
      alert('There was an error processing your order. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (cart.items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">Add some products to checkout</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h1 className="text-2xl font-bold mb-2">Order Complete!</h1>
              <p className="text-muted-foreground mb-4">
                Your items have been successfully ordered for free!
              </p>
              <Link href="/">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shopping
            </Link>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cart.items
                      .filter(item => !item.isBundleItem)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                            {item.product.isBundle && (
                              <div className="mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  Bundle
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checkout Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Promo Code Section */}
                  <div>
                    <Label htmlFor="promoCode">Promo Code</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="promoCode"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={handlePromoCodeChange}
                        className="flex-1"
                      />
                      {isValidCode && (
                        <Badge variant="default" className="px-3 py-2">
                          Valid!
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try entering &quot;FREE&quot; to get your items for free!
                    </p>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPrice(cart.total)}</span>
                    </div>
                    {isValidCode && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount (FREE code):</span>
                        <span>-{formatPrice(cart.total)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className={isValidCode ? 'text-green-600' : ''}>
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={!isValidCode || isCheckingOut}
                  >
                    {isCheckingOut ? 'Processing...' : 'Complete Order'}
                  </Button>

                  {!isValidCode && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please enter a valid promo code to continue
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
