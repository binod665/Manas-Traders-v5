-- ============================================================
-- MANA TRADERS — Supabase schema
-- Supabase Dashboard -> SQL Editor मा यो सम्पूर्ण फाइल paste गरेर Run गर्नुहोस्।
-- ============================================================

create table if not exists categories (
  id          bigint generated always as identity primary key,
  slug        text unique not null,        -- e.g. 'grain', 'oil', 'spice', 'dairy', 'veg', 'snack'
  name_np     text not null,
  name_en     text
);

create table if not exists products (
  id           uuid primary key default gen_random_uuid(),
  category     text references categories(slug),
  name_np      text not null,
  name_en      text,
  price        numeric(10,2) not null,
  unit         text not null,              -- e.g. 'प्रति के.जी.', 'प्रति लिटर', 'प्रति थान'
  image_url    text,                       -- खाली छोड्दा category icon देखिन्छ
  in_stock     boolean default true,
  is_featured  boolean default false,      -- true भएका सामान "आजको भाउ" board मा र top मा देखिन्छ
  created_at   timestamptz default now()
);

-- ---- Row Level Security: सबैलाई पढ्न मात्र दिने (public catalog) ----
alter table categories enable row level security;
alter table products enable row level security;

create policy "categories are publicly readable"
  on categories for select
  using (true);

create policy "products are publicly readable"
  on products for select
  using (true);

-- लेख्ने/परिवर्तन गर्ने काम Supabase dashboard बाट (logged-in admin/service role) मात्र गर्नुहोस्।
-- यो साइटले लेख्दैन, पढ्छ मात्र — त्यसैले anon key public राख्दा पनि सुरक्षित छ।

-- ---- नमूना श्रेणी ----
insert into categories (slug, name_np, name_en) values
  ('grain', 'चामल तथा अनाज', 'Rice & Grains'),
  ('oil',   'तेल तथा घ्यू',   'Oil & Ghee'),
  ('spice', 'मसला',          'Spices'),
  ('dairy', 'दूध तथा दुग्ध पदार्थ', 'Dairy'),
  ('veg',   'तरकारी तथा फलफूल', 'Vegetables & Fruits'),
  ('snack', 'खाजा तथा पेय',   'Snacks & Beverages')
on conflict (slug) do nothing;

-- ---- नमूना सामान (चाहेमा मेटाउन/बदल्न सकिन्छ) ----
insert into products (category, name_np, name_en, price, unit, in_stock, is_featured) values
  ('grain', 'बासमती चामल', 'Basmati Rice', 165, 'प्रति के.जी.', true, true),
  ('grain', 'मुसुरो दाल', 'Red Lentils', 195, 'प्रति के.जी.', true, true),
  ('oil',   'तोरीको तेल', 'Mustard Oil', 320, 'प्रति लिटर', true, true),
  ('grain', 'चिनी', 'Sugar', 105, 'प्रति के.जी.', true, true),
  ('dairy', 'दूध', 'Fresh Milk', 85, 'प्रति लिटर', true, true),
  ('spice', 'जीरा मसला', 'Cumin Spice', 40, 'प्रति १०० ग्राम', true, false),
  ('veg',   'आलु', 'Potato', 55, 'प्रति के.जी.', true, false),
  ('snack', 'बिस्कुट प्याकेट', 'Biscuit Pack', 30, 'प्रति प्याकेट', false, false);
