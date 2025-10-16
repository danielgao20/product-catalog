'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Cart, CartItem, Product, CartContextType } from '@/lib/types'
import { getCartItems, addToCart as addToCartDB, updateCartItemQuantity as updateCartItemQuantityDB, removeFromCart as removeFromCartDB, clearCart as clearCartDB, getBundleProducts } from '@/lib/database'
import { supabase } from '@/lib/supabase'

// Cart actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'SET_OPEN'; payload: boolean }
  | { type: 'ADD_TO_CART_SUCCESS'; payload: { product: Product; quantity?: number } }
  | { type: 'REMOVE_FROM_CART_SUCCESS'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY_SUCCESS'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART_SUCCESS' }

// Initial state
const initialState: Cart & { isOpen: boolean; isLoading: boolean } = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
  isLoading: false,
}

// Cart reducer
function cartReducer(state: typeof initialState, action: CartAction): typeof initialState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }

    case 'SET_CART':
      return {
        ...state,
        ...action.payload,
      }

    case 'SET_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      }

    case 'ADD_TO_CART_SUCCESS':
    case 'REMOVE_FROM_CART_SUCCESS':
    case 'UPDATE_QUANTITY_SUCCESS':
    case 'CLEAR_CART_SUCCESS':
      // These actions will trigger a cart refresh
      return {
        ...state,
        isLoading: false,
      }

    default:
      return state
  }
}

// Helper functions
function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    // For bundle items, only count the main bundle price (not child items)
    if (item.isBundleItem) {
      return total // Child items don't contribute to total
    }
    return total + (item.product.price * item.quantity)
  }, 0)
}

function calculateItemCount(items: CartItem[]): number {
  // Count unique main items (not bundle children) for the cart count
  // This shows how many different products are in the cart, not total quantities
  return items.filter(item => !item.isBundleItem).length
}

// Helper function to calculate bundle savings
export async function calculateBundleSavings(bundleId: string): Promise<{ totalChildPrice: number; bundlePrice: number; savings: number }> {
  try {
    const bundleProducts = await getBundleProducts(bundleId)
    const totalChildPrice = bundleProducts.reduce((total, bp) => {
      const childPrice = bp.child_product?.price || 0
      return total + (childPrice * bp.quantity_ratio)
    }, 0)
    
    // Get bundle price
    const { data: bundle, error } = await supabase
      .from('products')
      .select('price')
      .eq('id', bundleId)
      .single()
    
    if (error || !bundle) {
      return { totalChildPrice, bundlePrice: 0, savings: 0 }
    }
    
    const bundlePrice = bundle.price
    const savings = totalChildPrice - bundlePrice
    
    return { totalChildPrice, bundlePrice, savings }
  } catch (error) {
    console.error('Error calculating bundle savings:', error)
    return { totalChildPrice: 0, bundlePrice: 0, savings: 0 }
  }
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from database on mount
  useEffect(() => {
    refreshCart()
  }, [])

  const refreshCart = async () => {
    try {
      const items = await getCartItems()
      const cart = {
        items,
        total: calculateTotal(items),
        itemCount: calculateItemCount(items),
      }
      dispatch({ type: 'SET_CART', payload: cart })
    } catch (error) {
      console.error('Failed to load cart:', error)
    }
  }

  const addToCart = async (product: Product, quantity = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Add the main product
      await addToCartDB(product.id, quantity, false)
      
      // If it's a bundle, add child products
      if (product.isBundle) {
        const bundleChildren = await getBundleProducts(product.id)
        for (const child of bundleChildren) {
          await addToCartDB(
            child.child_product_id,
            quantity * child.quantity_ratio,
            true,
            product.id
          )
        }
      }
      
      dispatch({ type: 'ADD_TO_CART_SUCCESS', payload: { product, quantity } })
      await refreshCart()
    } catch (error) {
      console.error('Failed to add to cart:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const removeFromCart = async (productId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Find cart items for this product
      const itemsToRemove = state.items.filter(item => 
        item.productId === productId || item.parentBundleId === productId
      )
      
      // Remove all related items
      for (const item of itemsToRemove) {
        await removeFromCartDB(item.id)
      }
      
      dispatch({ type: 'REMOVE_FROM_CART_SUCCESS', payload: { productId } })
      await refreshCart()
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const item = state.items.find(item => item.productId === productId)
      if (item) {
        if (quantity <= 0) {
          await removeFromCart(productId)
        } else {
          // Update the main product quantity
          await updateCartItemQuantityDB(item.id, quantity)
          
          // If it's a bundle, update child product quantities proportionally
          if (item.product.isBundle) {
            const bundleChildren = await getBundleProducts(productId)
            const currentQuantity = item.quantity
            const quantityRatio = quantity / currentQuantity
            
            // Find and update all child items
            for (const child of bundleChildren) {
              const childItem = state.items.find(cartItem => 
                cartItem.productId === child.child_product_id && 
                cartItem.parentBundleId === productId
              )
              
              if (childItem) {
                const newChildQuantity = Math.round(childItem.quantity * quantityRatio)
                await updateCartItemQuantityDB(childItem.id, newChildQuantity)
              }
            }
          }
          
          dispatch({ type: 'UPDATE_QUANTITY_SUCCESS', payload: { productId, quantity } })
          await refreshCart()
        }
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const clearCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      await clearCartDB()
      dispatch({ type: 'CLEAR_CART_SUCCESS' })
      await refreshCart()
    } catch (error) {
      console.error('Failed to clear cart:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const setIsOpen = (open: boolean) => {
    dispatch({ type: 'SET_OPEN', payload: open })
  }

  const value: CartContextType = {
    cart: {
      items: state.items,
      total: state.total,
      itemCount: state.itemCount,
    },
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isOpen: state.isOpen,
    setIsOpen,
    isLoading: state.isLoading,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
