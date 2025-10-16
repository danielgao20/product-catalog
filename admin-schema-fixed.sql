-- Admin users table for simple authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users are viewable by admins only" ON admin_users;

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create a more permissive policy for admin authentication
CREATE POLICY "Allow admin authentication" ON admin_users
  FOR SELECT USING (true);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Create function to update updated_at timestamp for admin_users (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at (if it doesn't exist)
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Wiley's admin user (password: wiley123)
-- First, delete if exists to avoid conflicts
DELETE FROM admin_users WHERE email = 'wiley@gmail.com';

INSERT INTO admin_users (email, password_hash, name, role) VALUES
('wiley@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Wiley', 'admin');
