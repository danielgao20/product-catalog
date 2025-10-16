import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/admin-auth'
import { calculateBundleStock } from '@/lib/database'

// GET /api/admin/products - Get all products
export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const token = request.headers.get('Cookie')?.split('; ').find(row => row.startsWith('admin-token='))?.split('=')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const result = verifyToken(token)
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }


    // Map database fields to frontend interface and calculate bundle stock
    const mappedProducts = await Promise.all(products.map(async (product) => {
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
        details: product.details,
        features: product.features,
        inStock: product.in_stock,
        stockCount: stockCount,
        createdAt: new Date(product.created_at),
        updatedAt: new Date(product.updated_at)
      }
    }))

    return NextResponse.json({ success: true, products: mappedProducts }, { status: 200 })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: Request) {
  try {
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
      .insert([{
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image_url: productData.imageUrl,
        is_bundle: productData.isBundle || false,
        details: productData.details,
        features: productData.features || [],
        in_stock: productData.inStock !== false,
        stock_count: productData.stockCount || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }

    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (error) {
    console.error('Create product API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
