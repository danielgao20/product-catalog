import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Helper function to get or create session ID for guest users
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = Math.random().toString(36).substr(2, 9)
    localStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

// Database types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_bundle: boolean
          details: string | null
          features: string[] | null
          in_stock: boolean
          stock_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_bundle?: boolean
          details?: string | null
          features?: string[] | null
          in_stock?: boolean
          stock_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_bundle?: boolean
          details?: string | null
          features?: string[] | null
          in_stock?: boolean
          stock_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      bundle_products: {
        Row: {
          id: string
          bundle_id: string
          child_product_id: string
          quantity_ratio: number
          created_at: string
        }
        Insert: {
          id?: string
          bundle_id: string
          child_product_id: string
          quantity_ratio?: number
          created_at?: string
        }
        Update: {
          id?: string
          bundle_id?: string
          child_product_id?: string
          quantity_ratio?: number
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          product_id: string
          quantity: number
          is_bundle_item: boolean
          parent_bundle_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id: string
          quantity?: number
          is_bundle_item?: boolean
          parent_bundle_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id?: string
          quantity?: number
          is_bundle_item?: boolean
          parent_bundle_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_session_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
