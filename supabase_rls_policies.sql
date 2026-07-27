-- ====================================================================
-- MANAS TRADERS (manastraders.com.np) - COMPLETE SUPABASE DATABASE & RLS SETUP
-- ====================================================================
-- Instructions: 
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project -> Go to SQL Editor (left sidebar)
-- 3. Click "New Query" -> Paste ALL of this code -> Click "Run" (Ctrl + Enter)
-- ====================================================================

-- 0. EXTENSIONS & UTILITY FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. TABLES CREATION (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager', 'delivery')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ne TEXT NOT NULL,
  description_en TEXT,
  description_ne TEXT,
  icon TEXT,
  image_url TEXT,
  item_count INT NOT NULL DEFAULT 0 CHECK (item_count >= 0),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ne TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_slug TEXT REFERENCES public.categories(slug) ON DELETE SET NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(12, 2) CHECK (original_price IS NULL OR original_price >= price),
  cost_price NUMERIC(12, 2) CHECK (cost_price IS NULL OR cost_price >= 0),
  stock_quantity INT NOT NULL DEFAULT 100 CHECK (stock_quantity >= 0),
  unit TEXT NOT NULL DEFAULT 'kg',
  available_units TEXT[] NOT NULL DEFAULT ARRAY['1kg', '5kg', '25kg'],
  featured_image TEXT NOT NULL,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating BETWEEN 0 AND 5),
  reviews_count INT NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_flash_sale BOOLEAN NOT NULL DEFAULT FALSE,
  origin_en TEXT,
  origin_ne TEXT,
  description_en TEXT,
  description_ne TEXT,
  discount_badge TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Home',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  district TEXT NOT NULL,
  city_municipality TEXT NOT NULL,
  ward_number INT,
  street_address TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10, 2) DEFAULT 0 CHECK (min_order_amount >= 0),
  max_discount_amount NUMERIC(10, 2),
  usage_limit INT CHECK (usage_limit IS NULL OR usage_limit > 0),
  usage_count INT NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  phone TEXT NOT NULL,
  district TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  delivery_notes TEXT,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_code TEXT,
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'esewa', 'khalti', 'fonepay', 'bank_transfer')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending_verification', 'paid', 'refunded', 'failed')),
  payment_transaction_id TEXT,
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
  tracking_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_en TEXT NOT NULL,
  product_name_ne TEXT NOT NULL,
  product_sku TEXT,
  selected_unit TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_location TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_title TEXT,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. PRODUCTS & CATEGORIES POLICIES
DROP POLICY IF EXISTS "Public Read Access Products" ON public.products;
CREATE POLICY "Public Read Access Products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Products" ON public.products;
CREATE POLICY "Admin Manage Products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Access Categories" ON public.categories;
CREATE POLICY "Public Read Access Categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Categories" ON public.categories;
CREATE POLICY "Admin Manage Categories" ON public.categories FOR ALL USING (true);

-- 5. ORDERS & ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Allow Anyone To Create Orders" ON public.orders;
CREATE POLICY "Allow Anyone To Create Orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Read Orders Policy" ON public.orders;
CREATE POLICY "Read Orders Policy" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Update Orders" ON public.orders;
CREATE POLICY "Admin Update Orders" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone Create Order Items" ON public.order_items;
CREATE POLICY "Anyone Create Order Items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Read Order Items Policy" ON public.order_items;
CREATE POLICY "Read Order Items Policy" ON public.order_items FOR SELECT USING (true);

-- 6. COUPONS, REVIEWS, WISHLIST POLICIES
DROP POLICY IF EXISTS "Public Read Access Coupons" ON public.coupons;
CREATE POLICY "Public Read Access Coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Coupons" ON public.coupons;
CREATE POLICY "Admin Manage Coupons" ON public.coupons FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone Insert Reviews" ON public.reviews;
CREATE POLICY "Anyone Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "User Manage Wishlist" ON public.wishlists;
CREATE POLICY "User Manage Wishlist" ON public.wishlists FOR ALL USING (true);

-- 7. STORAGE BUCKET CREATION & POLICIES ('product-images')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public Read Storage Product Images" ON storage.objects;
CREATE POLICY "Public Read Storage Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Uploads To Product Images" ON storage.objects;
CREATE POLICY "Allow Uploads To Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Deletion From Product Images" ON storage.objects;
CREATE POLICY "Allow Deletion From Product Images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
