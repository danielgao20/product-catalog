-- Note: auth.users table is managed by Supabase Auth

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  is_bundle BOOLEAN DEFAULT FALSE,
  details TEXT,
  features TEXT[],
  in_stock BOOLEAN DEFAULT TRUE,
  stock_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bundle_products table
CREATE TABLE bundle_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID REFERENCES products(id) ON DELETE CASCADE,
  child_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity_ratio DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- For guest users
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_bundle_item BOOLEAN DEFAULT FALSE,
  parent_bundle_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_is_bundle ON products(is_bundle);
CREATE INDEX idx_bundle_products_bundle_id ON bundle_products(bundle_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_session_id ON cart_items(session_id);

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Products: Everyone can read
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Bundle products: Everyone can read
CREATE POLICY "Bundle products are viewable by everyone" ON bundle_products
  FOR SELECT USING (true);

-- Cart items: Allow all operations for now (we'll handle security in the app layer)
CREATE POLICY "Allow all cart operations" ON cart_items
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
