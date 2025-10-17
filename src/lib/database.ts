import { supabase, getSessionId } from './supabase'
import { Product, CartItem } from './types'

// Products
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  // Map products and calculate bundle stock
  const products = await Promise.all(data.map(async (product) => {
    let stockCount = product.stock_count
    
    // For bundles, calculate stock based on child products
    if (product.is_bundle) {
      stockCount = await calculateBundleStock(product.id)
    }
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.image_url,
      isBundle: product.is_bundle,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
      details: product.details,
      features: product.features,
      inStock: product.in_stock,
      stockCount: stockCount,
    }
  }))

  return products
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  let stockCount = data.stock_count
  
  // For bundles, calculate stock based on child products
  if (data.is_bundle) {
    stockCount = await calculateBundleStock(data.id)
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.image_url,
    isBundle: data.is_bundle,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    details: data.details,
    features: data.features,
    inStock: data.in_stock,
    stockCount: stockCount,
  }
}

// Bundle products
export async function getBundleProducts(bundleId: string) {
  const { data, error } = await supabase
    .from('bundle_products')
    .select(`
      *,
      child_product:products!bundle_products_child_product_id_fkey(*)
    `)
    .eq('bundle_id', bundleId)

  if (error) {
    console.error('Error fetching bundle products:', error)
    return []
  }

  // Transform the data to match frontend expectations
  return data.map(item => ({
    ...item,
    child_product: item.child_product ? {
      id: item.child_product.id,
      name: item.child_product.name,
      description: item.child_product.description,
      price: item.child_product.price,
      imageUrl: item.child_product.image_url,
      isBundle: item.child_product.is_bundle,
      createdAt: new Date(item.child_product.created_at),
      updatedAt: new Date(item.child_product.updated_at),
      details: item.child_product.details,
      features: item.child_product.features,
      inStock: item.child_product.in_stock,
      stockCount: item.child_product.stock_count,
    } : null
  }))
}

// Calculate bundle stock based on minimum stock of child products
export async function calculateBundleStock(bundleId: string): Promise<number> {
  const bundleProducts = await getBundleProducts(bundleId)
  
  if (bundleProducts.length === 0) {
    return 0
  }

  // Calculate the minimum stock considering quantity ratios
  const minStock = Math.min(
    ...bundleProducts.map(bp => {
      const childStock = bp.child_product?.stockCount || 0
      const ratio = bp.quantity_ratio || 1
      return Math.floor(childStock / ratio)
    })
  )

  return Math.max(0, minStock)
}

// Cart items
export async function getCartItems(): Promise<CartItem[]> {
  const sessionId = getSessionId()
  if (!sessionId) return []

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products!cart_items_product_id_fkey(*)
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching cart items:', error)
    return []
  }

  return data.map(item => ({
    id: item.id,
    productId: item.product_id,
    quantity: item.quantity,
    isBundleItem: item.is_bundle_item,
    parentBundleId: item.parent_bundle_id,
    product: {
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      price: item.product.price,
      imageUrl: item.product.image_url,
      isBundle: item.product.is_bundle,
      createdAt: new Date(item.product.created_at),
      updatedAt: new Date(item.product.updated_at),
      details: item.product.details,
      features: item.product.features,
      inStock: item.product.in_stock,
      stockCount: item.product.stock_count,
    }
  }))
}

export async function addToCart(productId: string, quantity: number = 1, isBundleItem: boolean = false, parentBundleId?: string): Promise<boolean> {
  const sessionId = getSessionId()
  if (!sessionId) return false

  // First, check if this exact product already exists in the cart
  let query = supabase
    .from('cart_items')
    .select('*')
    .eq('session_id', sessionId)
    .eq('product_id', productId)
    .eq('is_bundle_item', isBundleItem)
  
  // Handle parent_bundle_id comparison properly
  if (parentBundleId) {
    query = query.eq('parent_bundle_id', parentBundleId)
  } else {
    query = query.is('parent_bundle_id', null)
  }
  
  const { data: existingItems, error: fetchError } = await query

  if (fetchError) {
    console.error('Error checking existing cart items:', fetchError)
    return false
  }

  if (existingItems && existingItems.length > 0) {
    // Product already exists, update the quantity
    const existingItem = existingItems[0]
    const newQuantity = existingItem.quantity + quantity
    
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', existingItem.id)

    if (updateError) {
      console.error('Error updating cart item quantity:', updateError)
      return false
    }
  } else {
    // Product doesn't exist, create a new cart item
    const { error: insertError } = await supabase
      .from('cart_items')
      .insert({
        user_id: null, // We're using session_id for guest users
        session_id: sessionId,
        product_id: productId,
        quantity,
        is_bundle_item: isBundleItem,
        parent_bundle_id: parentBundleId,
      })

    if (insertError) {
      console.error('Error adding to cart:', insertError)
      return false
    }
  }

  return true
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<boolean> {
  if (quantity <= 0) {
    return removeFromCart(cartItemId)
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)

  if (error) {
    console.error('Error updating cart item:', error)
    return false
  }

  return true
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)

  if (error) {
    console.error('Error removing from cart:', error)
    return false
  }

  return true
}

export async function clearCart(): Promise<boolean> {
  const sessionId = getSessionId()
  if (!sessionId) return false

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('session_id', sessionId)

  if (error) {
    console.error('Error clearing cart:', error)
    return false
  }

  return true
}
