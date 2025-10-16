-- Create storage bucket for product images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow image updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow image deletes" ON storage.objects;

-- Create policy to allow public access to product images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Create policy to allow all users to upload images (for admin uploads)
CREATE POLICY "Allow image uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Create policy to allow all users to update images (for admin updates)
CREATE POLICY "Allow image updates" ON storage.objects 
FOR UPDATE USING (bucket_id = 'product-images');

-- Create policy to allow all users to delete images (for admin deletes)
CREATE POLICY "Allow image deletes" ON storage.objects 
FOR DELETE USING (bucket_id = 'product-images');
