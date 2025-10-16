export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  isBundle: boolean
  createdAt: Date
  updatedAt: Date
  // Additional details for popup
  details?: string
  features?: string[]
  inStock?: boolean
  stockCount?: number
}

export interface BundleProduct {
  id: string
  bundleId: string
  childProductId: string
  quantityRatio: number
  childProduct: Product
}

export interface CartItem {
  id: string
  productId: string
  quantity: number
  isBundleItem: boolean
  parentBundleId?: string
  product: Product
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

export interface CartContextType {
  cart: Cart
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isLoading: boolean
  refreshCart: () => Promise<void>
}
