import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBundleProducts } from '@/lib/database'

// POST /api/products/update-stock - Update product stock after purchase
export async function POST(request: Request) {
  try {
    const { items } = await request.json()
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items data' }, { status: 400 })
    }

    // Check if we have the service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured!')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const updateResults = []

    for (const item of items) {
      const { productId, quantity, isBundle } = item

      if (isBundle) {
        // For bundles, reduce stock of child products
        const bundleChildren = await getBundleProducts(productId)
        
        for (const child of bundleChildren) {
          const childQuantityToReduce = quantity * child.quantity_ratio
          
          // Get current stock
          const { data: currentProduct, error: fetchError } = await supabaseAdmin
            .from('products')
            .select('stock_count')
            .eq('id', child.child_product_id)
            .single()

          if (fetchError) {
            console.error(`Error fetching product ${child.child_product_id}:`, fetchError)
            continue
          }

          const newStock = Math.max(0, (currentProduct.stock_count || 0) - childQuantityToReduce)

          // Update child product stock
          const { error: updateError } = await supabaseAdmin
            .from('products')
            .update({ 
              stock_count: newStock,
              in_stock: newStock > 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', child.child_product_id)

          if (updateError) {
            console.error(`Error updating stock for product ${child.child_product_id}:`, updateError)
          } else {
            updateResults.push({
              productId: child.child_product_id,
              oldStock: currentProduct.stock_count || 0,
              newStock,
              quantityReduced: childQuantityToReduce
            })
          }
        }
      } else {
        // For individual products, reduce stock directly
        const { data: currentProduct, error: fetchError } = await supabaseAdmin
          .from('products')
          .select('stock_count')
          .eq('id', productId)
          .single()

        if (fetchError) {
          console.error(`Error fetching product ${productId}:`, fetchError)
          continue
        }

        const newStock = Math.max(0, (currentProduct.stock_count || 0) - quantity)

        // Update product stock
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ 
            stock_count: newStock,
            in_stock: newStock > 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', productId)

        if (updateError) {
          console.error(`Error updating stock for product ${productId}:`, updateError)
        } else {
          updateResults.push({
            productId,
            oldStock: currentProduct.stock_count || 0,
            newStock,
            quantityReduced: quantity
          })
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Stock updated successfully',
      updates: updateResults
    }, { status: 200 })

  } catch (error) {
    console.error('Update stock API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
