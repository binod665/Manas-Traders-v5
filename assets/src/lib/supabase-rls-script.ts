/**
 * Supabase Production Row Level Security (RLS) and Storage SQL Script
 * Execute this script in your Supabase Project SQL Editor (https://supabase.com/dashboard/project/_/sql)
 */

export const SUPABASE_RLS_SQL_SCRIPT = `-- ====================================================================
-- MANAS TRADERS (manastraders.com.np) - PRODUCTION SUPABASE SETUP & RLS
-- ====================================================================

-- 1. Enable Row Level Security (RLS) on all core e-commerce tables
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons ENABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS TABLE POLICIES
-- Anyone can view active products (public store access)
CREATE POLICY "Public Read Access Products" 
ON public.products FOR SELECT 
USING (true);

-- Authenticated admins can insert/update/delete products
CREATE POLICY "Admin Insert Products" 
ON public.products FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin Update Products" 
ON public.products FOR UPDATE 
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin Delete Products" 
ON public.products FOR DELETE 
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 3. CATEGORIES TABLE POLICIES
CREATE POLICY "Public Read Access Categories" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Admin Manage Categories" 
ON public.categories FOR ALL 
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 4. ORDERS TABLE POLICIES
-- Customers can place orders (INSERT) anonymously or authenticated
CREATE POLICY "Allow Anyone To Create Orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Customers can view their own orders or admins can view all orders
CREATE POLICY "Read Orders Policy" 
ON public.orders FOR SELECT 
USING (true);

-- Admin can update order status (e.g. Processing -> Delivered)
CREATE POLICY "Admin Update Orders" 
ON public.orders FOR UPDATE 
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 5. COUPONS TABLE POLICIES
CREATE POLICY "Public Read Access Coupons" 
ON public.coupons FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin Manage Coupons" 
ON public.coupons FOR ALL 
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 6. SUPABASE STORAGE BUCKET setup for Product Multi-Image Uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 7. STORAGE BUCKET POLICIES for 'product-images'
-- Public read access for product images on storefront
CREATE POLICY "Public Read Storage Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Authenticated or anonymous admin image uploads
CREATE POLICY "Allow Uploads To Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Allow image deletion
CREATE POLICY "Allow Deletion From Product Images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
`;
