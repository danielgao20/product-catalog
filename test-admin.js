const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oyspjfbywihpibqhgadq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95c3BqZmJ5d2locGlicWhnYWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzA4NzUsImV4cCI6MjA3NjE0Njg3NX0.Bkc1Gf3PpdWqn5X9Xk_Rt0lHSOxysI_YfKqlc-If4SY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAdminUser() {
  try {
    console.log('Testing admin user lookup...')
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'wiley@gmail.com')
      .single()

    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Admin user found:', data)
    }
  } catch (err) {
    console.error('Exception:', err)
  }
}

testAdminUser()
