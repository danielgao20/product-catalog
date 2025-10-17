import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from './supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  user?: AdminUser
  token?: string
  error?: string
}

// Verify admin credentials
export async function verifyAdminCredentials(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', credentials.email)
      .eq('is_active', true)
      .single()

    if (error || !adminUser) {
      return { success: false, error: 'Invalid credentials' }
    }

    const isValidPassword = await bcrypt.compare(credentials.password, adminUser.password_hash)
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Remove password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = adminUser

    return {
      success: true,
      user: userWithoutPassword as AdminUser,
      token
    }
  } catch (error) {
    console.error('Admin authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

// Verify JWT token
export function verifyToken(token: string): { valid: boolean; payload?: { id: string; email: string; name: string; role: string }; error?: string } {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string; role: string }
    return { valid: true, payload }
  } catch {
    return { valid: false, error: 'Invalid token' }
  }
}

// Hash password for new admin users
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Create new admin user
export async function createAdminUser(userData: {
  email: string
  password: string
  name: string
  role?: string
}): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const hashedPassword = await hashPassword(userData.password)
    
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: userData.email,
        password_hash: hashedPassword,
        name: userData.name,
        role: userData.role || 'admin'
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = data
    return { success: true, user: userWithoutPassword as AdminUser }
  } catch (error) {
    console.error('Create admin user error:', error)
    return { success: false, error: 'Failed to create admin user' }
  }
}
