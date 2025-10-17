import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/admin-auth'
import { calculateBundleStock } from '@/lib/database'

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id } = await params
    
    // Verify admin authentication
    const token = request.headers.get('Cookie')?.split('; ').find(row => row.startsWith('admin-token='))?.split('=')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const result = verifyToken(token)
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const productData = await request.json()

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image_url: productData.imageUrl,
        is_bundle: productData.isBundle || false,
        details: productData.details,
        features: productData.features || [],
        in_stock: productData.inStock !== false,
        stock_count: productData.stockCount || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }

    // Map database fields to frontend interface and calculate bundle stock
    let stockCount = product.stock_count
    
    // For bundles, calculate stock based on child products
    if (product.is_bundle) {
      stockCount = await calculateBundleStock(product.id)
    }
    
    const mappedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.image_url,
      isBundle: product.is_bundle,
      details: product.details,
      features: product.features,
      inStock: product.in_stock,
      stockCount: stockCount,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at)
    }

    return NextResponse.json({ success: true, product: mappedProduct }, { status: 200 })
  } catch (error) {
    console.error('Update product API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id } = await params
    
    // Verify admin authentication
    const token = request.headers.get('Cookie')?.split('; ').find(row => row.startsWith('admin-token='))?.split('=')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const result = verifyToken(token)
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if we have the service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured!')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // First, delete any bundle relationships using admin client
    await supabaseAdmin
      .from('bundle_products')
      .delete()
      .or(`bundle_id.eq.${id},child_product_id.eq.${id}`)
    
    // Then delete the product using admin client
    const { data: deleteData, error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }

    if (!deleteData || deleteData.length === 0) {
      return NextResponse.json({ error: 'Product not found or already deleted' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Delete product API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
