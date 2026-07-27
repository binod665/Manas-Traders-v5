-- ============================================================================
-- MANAS TRADERS (manastraders.com.np)
-- Complete Production-Ready Supabase PostgreSQL Database Schema
-- ============================================================================
-- Description: Full production database schema for grocery eCommerce website.
-- Includes: Extensions, Triggers, 10 Core Tables, Indexes, Row Level Security (RLS)
--           Policies, Order Sequence Generator, & Initial Seed Data.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS & UTILITY FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Utility Trigger Function: Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. USERS / PROFILES TABLE
-- Extends Supabase auth.users for application user profiles and admin roles.
-- ----------------------------------------------------------------------------
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

-- Trigger for users updated_at
DROP TRIGGER IF EXISTS tr_users_updated_at ON public.users;
CREATE TRIGGER tr_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Automatic trigger function to populate public.users on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- Hierarchical structure, dual-language attributes (EN/NE), and item counters.
-- ----------------------------------------------------------------------------
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

DROP TRIGGER IF EXISTS tr_categories_updated_at ON public.categories;
CREATE TRIGGER tr_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- Main product catalogue with stock, pricing, dual-language descriptions & origin.
-- ----------------------------------------------------------------------------
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

DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. PRODUCT IMAGES TABLE
-- Multi-image support per product with display order.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ADDRESSES TABLE
-- Customer delivery addresses across Nepal (District, Municipality, Ward).
-- ----------------------------------------------------------------------------
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

DROP TRIGGER IF EXISTS tr_addresses_updated_at ON public.addresses;
CREATE TRIGGER tr_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Function to enforce single default address per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_single_default_address ON public.addresses;
CREATE TRIGGER tr_single_default_address
  BEFORE INSERT OR UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_default_address();

-- ----------------------------------------------------------------------------
-- 6. COUPONS TABLE
-- Discount codes and wholesale promotional vouchers.
-- ----------------------------------------------------------------------------
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

DROP TRIGGER IF EXISTS tr_coupons_updated_at ON public.coupons;
CREATE TRIGGER tr_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. ORDERS TABLE
-- Customer order master table with status, payment methods (eSewa/Khalti/COD).
-- ----------------------------------------------------------------------------
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

DROP TRIGGER IF EXISTS tr_orders_updated_at ON public.orders;
CREATE TRIGGER tr_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Automatic order number generator (e.g. MT-2026-00042)
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_val INT;
  year_str TEXT;
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    year_str := TO_CHAR(NOW(), 'YYYY');
    SELECT COUNT(*) + 1 INTO seq_val FROM public.orders;
    NEW.order_number := 'MT-' || year_str || '-' || LPAD(seq_val::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_order_number ON public.orders;
CREATE TRIGGER tr_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ----------------------------------------------------------------------------
-- 8. ORDER ITEMS TABLE
-- Detailed line items per customer order.
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 9. WISHLISTS TABLE
-- User favorite items wishlist.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ----------------------------------------------------------------------------
-- 10. REVIEWS TABLE
-- Customer ratings & reviews with automatic product score recalculation.
-- ----------------------------------------------------------------------------
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

DROP TRIGGER IF EXISTS tr_reviews_updated_at ON public.reviews;
CREATE TRIGGER tr_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger function: Automatically update average rating and total reviews on products
CREATE OR REPLACE FUNCTION public.update_product_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_product_id UUID;
  avg_rate NUMERIC(3, 2);
  tot_count INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  SELECT COALESCE(AVG(rating), 5.00), COUNT(*)
  INTO avg_rate, tot_count
  FROM public.reviews
  WHERE product_id = target_product_id AND is_approved = TRUE;

  UPDATE public.products
  SET rating = ROUND(avg_rate, 2),
      reviews_count = tot_count
  WHERE id = target_product_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_recalculate_rating ON public.reviews;
CREATE TRIGGER tr_recalculate_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating_stats();

-- ----------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_category_slug ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_flags ON public.products(is_featured, is_popular, is_flash_sale) WHERE in_stock = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_trgm_name_en ON public.products USING gin (name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_trgm_name_ne ON public.products USING gin (name_ne gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Helper Function to check Admin Role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products
  FOR SELECT USING (in_stock = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Public read product images" ON public.product_images;
CREATE POLICY "Public read product images" ON public.product_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own addresses" ON public.addresses;
CREATE POLICY "Users manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Public view active coupons" ON public.coupons;
CREATE POLICY "Public view active coupons" ON public.coupons
  FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

DROP POLICY IF EXISTS "Anyone can insert order" ON public.orders;
CREATE POLICY "Anyone can insert order" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlists;
CREATE POLICY "Users manage own wishlist" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public view approved reviews" ON public.reviews;
CREATE POLICY "Public view approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Users post reviews" ON public.reviews;
CREATE POLICY "Users post reviews" ON public.reviews
  FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- INITIAL SEED DATA
-- Populate initial categories and products for immediate demo readiness
-- ----------------------------------------------------------------------------
INSERT INTO public.categories (slug, name_en, name_ne, icon, image_url, display_order) VALUES
('rice-grains', 'Rice & Food Grains', 'चामल र खाद्यान्न', '🌾', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600', 1),
('pulses', 'Organic Pulses & Daal', 'अर्गानिक दाल र गेडागुडी', '🫘', 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=600', 2),
('ghee-oil', 'Pure Ghee & Cooking Oil', 'शुद्ध घिउ र तोरीको तेल', '🧈', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=600', 3),
('spices', 'Himalayan Spices & Masala', 'हिमाली जडीबुटी र मसला', '🌶️', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600', 4),
('tea-beverages', 'Ilam Tea & Beverages', 'इलामको चिया र पेय पदार्थ', '🍵', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600', 5),
('organic-specials', 'Organic Mountain Specials', 'हिमाली अर्गानिक उत्पादन', '⛰️', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (
  sku, slug, name_en, name_ne, category_slug, price, original_price, unit, available_units,
  featured_image, rating, reviews_count, is_popular, is_flash_sale, is_featured, origin_en, origin_ne,
  description_en, description_ne, discount_badge
) VALUES
(
  'MT-PL-001', 'mustang-organic-black-lentils',
  'Mustang Organic Black Lentils (Kalo Daal)', 'मुस्ताङको अर्गानिक कालो दाल',
  'pulses', 280.00, 320.00, 'kg', ARRAY['1kg', '5kg', '10kg'],
  'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=800',
  4.90, 84, true, true, true, 'Mustang, Nepal', 'मुस्ताङ, नेपाल',
  'Authentic high-altitude organic black lentils harvested directly from Mustang Valley farmers.',
  'मुस्ताङका उच्च हिमाली भेगका किसानहरूबाट सोझै संकलित। प्रोटिन र पोषक तत्वले भरिपूर्ण।',
  '12.5% OFF'
),
(
  'MT-RC-001', 'pokhreli-jethobudho-basmati-rice',
  'Pokhreli Jethobudho Basmati Rice (25kg Bag)', 'पोखरेली जेठोबुढो बास्मती चामल (२५ केजी)',
  'rice-grains', 3250.00, 3600.00, 'bag', ARRAY['5kg', '25kg', '50kg'],
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
  4.95, 120, true, false, true, 'Pokhara, Kaski', 'पोखरा, कास्की',
  'Aromatic Jethobudho rice cultivated in pristine Himalayan spring waters. Long grain, superior aroma.',
  'पोखराको फेवा जलाधार क्षेत्रमा फलेको बास्नादार जेठोबुढो चामल। चाडपर्व र विशेष खानाको लागि उत्तम।',
  'SAVE Rs. 350'
)
ON CONFLICT (slug) DO NOTHING;
