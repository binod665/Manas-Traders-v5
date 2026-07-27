import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { defaultSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../config';
import { Product, Category, Order, UserProfile, CartItem, Coupon } from '../types';
import { initialProducts, initialCategories } from '../data/products';

let supabaseInstance: SupabaseClient | null = null;
let isConnected = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = localStorage.getItem('manas_traders_supabase_config_url') || defaultSupabaseConfig.url;
  const anonKey = localStorage.getItem('manas_traders_supabase_config_key') || defaultSupabaseConfig.anonKey;

  if (url && anonKey && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, anonKey);
      isConnected = true;
      return supabaseInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      isConnected = false;
    }
  }

  return null;
}

export function isSupabaseConnected(): boolean {
  return isConnected && !!getSupabaseClient();
}

/**
 * Fetch products from Supabase DB or fallback to initial dataset
 */
export async function fetchProducts(): Promise<Product[]> {
  const client = getSupabaseClient();
  if (!client) {
    // Check localStorage cache or fallback
    const saved = localStorage.getItem('manas_traders_local_products');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialProducts;
  }

  try {
    const { data, error } = await client.from('products').select('*');
    if (error || !data || data.length === 0) {
      return initialProducts;
    }
    return data.map((item: any) => ({
      id: item.id,
      nameEn: item.name_en,
      nameNe: item.name_ne,
      categorySlug: item.category_slug,
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      unit: item.unit || 'kg',
      availableUnits: item.available_units || ['1kg', '5kg', '25kg'],
      image: item.image || item.featured_image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
      images: Array.isArray(item.images)
        ? item.images
        : typeof item.images === 'string'
        ? JSON.parse(item.images || '[]')
        : [item.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800'],
      rating: Number(item.rating || 5),
      reviewsCount: Number(item.reviews_count || 0),
      inStock: item.in_stock !== false,
      isPopular: !!item.is_popular,
      isFlashSale: !!item.is_flash_sale,
      originEn: item.origin_en,
      originNe: item.origin_ne,
      descriptionEn: item.description_en,
      descriptionNe: item.description_ne,
      discountBadge: item.discount_badge,
    }));
  } catch (err) {
    console.warn('Error fetching products from Supabase, using local fallback:', err);
    return initialProducts;
  }
}

/**
 * Fetch user's wishlist product IDs from Supabase
 */
export async function fetchWishlistFromSupabase(userId: string): Promise<string[]> {
  const client = getSupabaseClient();
  if (!client || !userId) return [];
  try {
    const { data, error } = await client
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId);
    if (error || !data) return [];
    return data.map((row: any) => row.product_id);
  } catch (e) {
    console.warn('Error fetching wishlist from Supabase:', e);
    return [];
  }
}

/**
 * Fetch user's cart from Supabase
 */
export async function fetchCartFromSupabase(userId: string): Promise<CartItem[] | null> {
  const client = getSupabaseClient();
  if (!client || !userId) return null;
  try {
    const { data, error } = await client
      .from('user_carts')
      .select('cart_data')
      .eq('user_id', userId)
      .single();

    if (!error && data?.cart_data) {
      return data.cart_data as CartItem[];
    }
  } catch (e) {
    /* fallback to metadata */
  }

  try {
    const { data: userData } = await client.auth.getUser();
    if (userData?.user?.user_metadata?.cart) {
      return userData.user.user_metadata.cart as CartItem[];
    }
  } catch (err) {}

  return null;
}

/**
 * Sync cart array to Supabase
 */
export async function syncCartToSupabase(userId: string, cart: CartItem[]): Promise<void> {
  const client = getSupabaseClient();
  if (!client || !userId) return;
  try {
    await client.from('user_carts').upsert([
      {
        user_id: userId,
        cart_data: cart,
        updated_at: new Date().toISOString(),
      },
    ]);
  } catch (e) {
    try {
      await client.auth.updateUser({
        data: { cart },
      });
    } catch (err) {
      console.warn('Cart sync warning:', err);
    }
  }
}

/**
 * Sync wishlist addition/removal to Supabase
 */
export async function syncWishlistToSupabase(userId: string, productId: string, isAdding: boolean): Promise<void> {
  const client = getSupabaseClient();
  if (!client || !userId) return;
  try {
    if (isAdding) {
      await client.from('wishlists').insert([{ user_id: userId, product_id: productId }]);
    } else {
      await client.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId);
    }
  } catch (e) {
    console.warn('Error syncing wishlist to Supabase:', e);
  }
}

/**
 * Save new order to Supabase or LocalStorage
 */
export async function createOrderInDB(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const newOrder: Order = {
    ...orderData,
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString(),
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('orders').insert([{
        customer_name: orderData.customerName,
        phone: orderData.phone,
        province: orderData.province || '',
        district: orderData.district,
        municipality: orderData.municipality || '',
        address: orderData.address,
        payment_method: orderData.paymentMethod,
        items: orderData.items,
        subtotal: orderData.subtotal,
        delivery_fee: orderData.deliveryFee,
        total: orderData.total,
        status: orderData.status,
        payment_status: orderData.paymentStatus,
      }]).select().single();

      if (!error && data) {
        newOrder.id = data.id;
      }
    } catch (e) {
      console.warn('Could not sync order to Supabase, saved locally instead:', e);
    }
  }

  // Save to local orders list in localStorage
  const existingOrdersStr = localStorage.getItem('manas_traders_orders');
  const existingOrders: Order[] = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
  existingOrders.unshift(newOrder);
  localStorage.setItem('manas_traders_orders', JSON.stringify(existingOrders));

  return newOrder;
}

/**
 * Add product to Supabase / Local database
 */
export async function addProductToDB(product: Omit<Product, 'id'>): Promise<Product> {
  const newProd: Product = {
    ...product,
    id: 'p-' + Date.now(),
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('products').insert([{
        name_en: product.nameEn,
        name_ne: product.nameNe,
        category_slug: product.categorySlug,
        price: product.price,
        original_price: product.originalPrice,
        unit: product.unit,
        image: product.image,
        images: product.images || [product.image],
        rating: product.rating,
        reviews_count: product.reviewsCount,
        in_stock: product.inStock,
        is_popular: product.isPopular,
        is_flash_sale: product.isFlashSale,
        origin_en: product.originEn,
        origin_ne: product.originNe,
        description_en: product.descriptionEn,
        description_ne: product.descriptionNe,
        discount_badge: product.discountBadge,
      }]).select().single();

      if (!error && data) {
        newProd.id = data.id;
      }
    } catch (e) {
      console.warn('Error adding product to Supabase:', e);
    }
  }

  // Update local storage
  const saved = localStorage.getItem('manas_traders_local_products');
  const currentProds: Product[] = saved ? JSON.parse(saved) : initialProducts;
  currentProds.unshift(newProd);
  localStorage.setItem('manas_traders_local_products', JSON.stringify(currentProds));

  return newProd;
}

/**
 * Supabase Auth: Register new user
 */
export async function signUpWithSupabase(
  email: string,
  password: string,
  fullName: string,
  phone: string = '',
  district: string = 'Kathmandu',
  address: string = ''
): Promise<{ userProfile: UserProfile | null; error: string | null; needsEmailVerification: boolean }> {
  const client = getSupabaseClient();
  
  if (!client) {
    // Offline / Local fallback simulation
    const localUser: UserProfile = {
      id: 'local-usr-' + Date.now(),
      email,
      fullName,
      phone,
      district,
      address,
      role: email.includes('admin') ? 'admin' : 'customer',
    };
    localStorage.setItem('manas_traders_user', JSON.stringify(localUser));
    return { userProfile: localUser, error: null, needsEmailVerification: false };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          district,
          address,
          role: email.includes('admin') ? 'admin' : 'customer',
        },
      },
    });

    if (error) {
      return { userProfile: null, error: error.message, needsEmailVerification: false };
    }

    if (data.user) {
      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: fullName || data.user.user_metadata?.full_name || 'Customer',
        phone: phone || data.user.user_metadata?.phone || '',
        district: district || data.user.user_metadata?.district || 'Kathmandu',
        address: address || data.user.user_metadata?.address || '',
        role: (data.user.user_metadata?.role as 'admin' | 'customer') || 'customer',
      };

      // Try inserting into users table in Supabase
      try {
        await client.from('users').upsert([
          {
            id: data.user.id,
            email: userProfile.email,
            full_name: userProfile.fullName,
            phone: userProfile.phone,
            role: userProfile.role,
          },
        ]);
      } catch (dbErr) {
        console.warn('User profile sync to public.users table skipped/failed:', dbErr);
      }

      localStorage.setItem('manas_traders_user', JSON.stringify(userProfile));

      // Check if email confirmation is required by Supabase auth settings
      const needsVerification = !data.session && !data.user.email_confirmed_at;
      return { userProfile, error: null, needsEmailVerification: needsVerification };
    }

    return { userProfile: null, error: 'Registration failed. Please try again.', needsEmailVerification: false };
  } catch (err: any) {
    return { userProfile: null, error: err.message || 'Registration error occurred.', needsEmailVerification: false };
  }
}

/**
 * Supabase Auth: Login user with Email & Password
 */
export async function signInWithSupabase(
  email: string,
  password: string
): Promise<{ userProfile: UserProfile | null; error: string | null }> {
  const client = getSupabaseClient();

  if (!client) {
    // Local fallback login
    const savedUserStr = localStorage.getItem('manas_traders_user');
    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      if (savedUser.email === email) {
        return { userProfile: savedUser, error: null };
      }
    }
    // Create local demo session
    const demoUser: UserProfile = {
      id: 'local-usr-' + Date.now(),
      email,
      fullName: email.split('@')[0],
      phone: '+977 9801234567',
      district: 'Kathmandu',
      address: 'New Road, Kathmandu',
      role: email.includes('admin') ? 'admin' : 'customer',
    };
    localStorage.setItem('manas_traders_user', JSON.stringify(demoUser));
    return { userProfile: demoUser, error: null };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { userProfile: null, error: error.message };
    }

    if (data.user) {
      // Try fetching profile metadata
      const meta = data.user.user_metadata || {};
      let userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: meta.full_name || email.split('@')[0],
        phone: meta.phone || '',
        district: meta.district || 'Kathmandu',
        address: meta.address || '',
        role: (meta.role as 'admin' | 'customer') || 'customer',
      };

      // Check if user record exists in 'users' or 'profiles' table
      try {
        const { data: dbUser } = await client.from('users').select('*').eq('id', data.user.id).single();
        if (dbUser) {
          userProfile = {
            ...userProfile,
            fullName: dbUser.full_name || userProfile.fullName,
            phone: dbUser.phone || userProfile.phone,
            role: dbUser.role || userProfile.role,
          };
        }
      } catch (e) {
        /* ignore fallback */
      }

      localStorage.setItem('manas_traders_user', JSON.stringify(userProfile));
      return { userProfile, error: null };
    }

    return { userProfile: null, error: 'Login failed' };
  } catch (err: any) {
    return { userProfile: null, error: err.message || 'Login error occurred.' };
  }
}

/**
 * Supabase Auth: Sign Out
 */
export async function signOutWithSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    }
  }
  localStorage.removeItem('manas_traders_user');
}

/**
 * Supabase Auth: Send Password Reset Email
 */
export async function resetPasswordWithSupabase(email: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: true, error: null };
  }

  try {
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send reset link.' };
  }
}

/**
 * Update user profile in Supabase & LocalStorage
 */
export async function updateUserProfileInDB(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ userProfile: UserProfile | null; error: string | null }> {
  const savedUserStr = localStorage.getItem('manas_traders_user');
  let current: UserProfile = savedUserStr
    ? JSON.parse(savedUserStr)
    : { id: userId, email: '', fullName: '', phone: '', district: 'Kathmandu', address: '', role: 'customer' };

  const updatedProfile: UserProfile = { ...current, ...updates };

  const client = getSupabaseClient();
  if (client) {
    try {
      // Update auth user metadata
      await client.auth.updateUser({
        data: {
          full_name: updatedProfile.fullName,
          phone: updatedProfile.phone,
          district: updatedProfile.district,
          address: updatedProfile.address,
        },
      });

      // Update users table
      await client.from('users').upsert([
        {
          id: userId,
          full_name: updatedProfile.fullName,
          phone: updatedProfile.phone,
          district: updatedProfile.district,
          address: updatedProfile.address,
        },
      ]);
    } catch (e) {
      console.warn('Error updating Supabase user profile DB:', e);
    }
  }

  localStorage.setItem('manas_traders_user', JSON.stringify(updatedProfile));
  return { userProfile: updatedProfile, error: null };
}

/**
 * Update an existing Product in Supabase / Local database
 */
export async function updateProductInDB(product: Product): Promise<Product> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('products').update({
        name_en: product.nameEn,
        name_ne: product.nameNe,
        category_slug: product.categorySlug,
        price: product.price,
        original_price: product.originalPrice,
        unit: product.unit,
        image: product.image,
        images: product.images || [product.image],
        rating: product.rating,
        reviews_count: product.reviewsCount,
        in_stock: product.inStock,
        is_popular: product.isPopular,
        is_flash_sale: product.isFlashSale,
        origin_en: product.originEn,
        origin_ne: product.originNe,
        description_en: product.descriptionEn,
        description_ne: product.descriptionNe,
        discount_badge: product.discountBadge,
      }).eq('id', product.id);
    } catch (e) {
      console.warn('Error updating product in Supabase:', e);
    }
  }

  // Update local storage
  const saved = localStorage.getItem('manas_traders_local_products');
  const currentProds: Product[] = saved ? JSON.parse(saved) : initialProducts;
  const index = currentProds.findIndex((p) => p.id === product.id);
  if (index > -1) {
    currentProds[index] = product;
  } else {
    currentProds.unshift(product);
  }
  localStorage.setItem('manas_traders_local_products', JSON.stringify(currentProds));
  return product;
}

/**
 * Delete a Product from Supabase / Local database
 */
export async function deleteProductFromDB(productId: string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('products').delete().eq('id', productId);
    } catch (e) {
      console.warn('Error deleting product from Supabase:', e);
    }
  }

  // Update local storage
  const saved = localStorage.getItem('manas_traders_local_products');
  if (saved) {
    const currentProds: Product[] = JSON.parse(saved);
    const updated = currentProds.filter((p) => p.id !== productId);
    localStorage.setItem('manas_traders_local_products', JSON.stringify(updated));
  }
}

/**
 * Fetch categories from Supabase or fallback
 */
export async function fetchCategoriesFromDB(): Promise<Category[]> {
  const client = getSupabaseClient();
  if (!client) {
    const saved = localStorage.getItem('manas_traders_local_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  }

  try {
    const { data, error } = await client.from('categories').select('*');
    if (error || !data || data.length === 0) {
      return initialCategories;
    }
    return data.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      nameEn: c.name_en || c.nameEn,
      nameNe: c.name_ne || c.nameNe,
      icon: c.icon || '🛍️',
      image: c.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      itemCount: c.item_count || c.itemCount || 0,
    }));
  } catch (err) {
    return initialCategories;
  }
}

/**
 * Add a Category to Supabase / Local store
 */
export async function addCategoryToDB(cat: Omit<Category, 'id'>): Promise<Category> {
  const newCat: Category = { ...cat, id: 'cat-' + Date.now() };
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data } = await client.from('categories').insert([{
        slug: cat.slug,
        name_en: cat.nameEn,
        name_ne: cat.nameNe,
        icon: cat.icon,
        image: cat.image,
        item_count: cat.itemCount,
      }]).select().single();
      if (data) newCat.id = data.id;
    } catch (e) {
      console.warn('Error adding category to Supabase:', e);
    }
  }

  const saved = localStorage.getItem('manas_traders_local_categories');
  const current: Category[] = saved ? JSON.parse(saved) : initialCategories;
  current.push(newCat);
  localStorage.setItem('manas_traders_local_categories', JSON.stringify(current));
  return newCat;
}

/**
 * Delete a Category from Supabase / Local store
 */
export async function deleteCategoryFromDB(categoryId: string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('categories').delete().eq('id', categoryId);
    } catch (e) {
      console.warn('Error deleting category from Supabase:', e);
    }
  }

  const saved = localStorage.getItem('manas_traders_local_categories');
  const current: Category[] = saved ? JSON.parse(saved) : initialCategories;
  const updated = current.filter((c) => c.id !== categoryId);
  localStorage.setItem('manas_traders_local_categories', JSON.stringify(updated));
}

/**
 * Update order status in Supabase / Local store
 */
export async function updateOrderStatusInDB(
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('orders').update({
        status,
        payment_status: paymentStatus,
      }).eq('id', orderId);
    } catch (e) {
      console.warn('Error updating order status in Supabase:', e);
    }
  }

  // Update local storage
  const saved = localStorage.getItem('manas_traders_orders');
  if (saved) {
    const currentOrders: Order[] = JSON.parse(saved);
    const updated = currentOrders.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status,
          paymentStatus: paymentStatus || ord.paymentStatus,
        };
      }
      return ord;
    });
    localStorage.setItem('manas_traders_orders', JSON.stringify(updated));
  }
}

/**
 * Fetch customers / registered users list from Supabase or Local
 */
export async function fetchCustomersFromDB(): Promise<UserProfile[]> {
  const client = getSupabaseClient();
  if (!client) {
    const savedUserStr = localStorage.getItem('manas_traders_user');
    const demoUser: UserProfile = savedUserStr
      ? JSON.parse(savedUserStr)
      : {
          id: 'usr-1',
          email: 'admin@manastraders.com',
          fullName: 'Binod Bhandari (Admin)',
          phone: '9801234567',
          district: 'Kathmandu',
          address: 'New Road, Kathmandu',
          role: 'admin',
        };
    return [
      demoUser,
      {
        id: 'usr-2',
        email: 'sita.shrestha@gmail.com',
        fullName: 'Sita Shrestha',
        phone: '9841234567',
        district: 'Lalitpur',
        address: 'Patan Durbar Square, Lalitpur',
        role: 'customer',
      },
      {
        id: 'usr-3',
        email: 'ram.gurung@yahoo.com',
        fullName: 'Ram Gurung',
        phone: '9851098765',
        district: 'Pokhara Valley',
        address: 'Lakeside, Pokhara',
        role: 'customer',
      },
    ];
  }

  try {
    const { data, error } = await client.from('users').select('*');
    if (error || !data || data.length === 0) {
      // Fallback to local
      const savedUserStr = localStorage.getItem('manas_traders_user');
      if (savedUserStr) return [JSON.parse(savedUserStr)];
      return [];
    }
    return data.map((u: any) => ({
      id: u.id,
      email: u.email || 'customer@manastraders.com',
      fullName: u.full_name || 'Customer',
      phone: u.phone || 'N/A',
      district: u.district || 'Kathmandu',
      address: u.address || 'Nepal',
      role: u.role || 'customer',
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Fetch Coupons list from Supabase / Local
 */
export async function fetchCouponsFromDB(): Promise<Coupon[]> {
  const defaultCoupons: Coupon[] = [
    {
      code: 'MANAS10',
      discountType: 'percent',
      discountValue: 10,
      descriptionEn: '10% discount on fresh organic groceries',
      descriptionNe: 'ताजा खाद्यान्नमा १०% छुट',
    },
    {
      code: 'WELCOME50',
      discountType: 'flat',
      discountValue: 50,
      minOrderValue: 300,
      descriptionEn: 'Flat Rs. 50 off on orders above Rs. 300',
      descriptionNe: 'रु. ३०० भन्दा माथिको अर्डरमा रु. ५० छुट',
    },
    {
      code: 'FREESHIP',
      discountType: 'free_shipping',
      discountValue: 0,
      descriptionEn: 'Free delivery on all Nepal orders',
      descriptionNe: 'सबै अर्डरमा नि:शुल्क होम डेलिभरी',
    },
    {
      code: 'SUPERNEPAL',
      discountType: 'percent',
      discountValue: 15,
      minOrderValue: 1000,
      descriptionEn: '15% discount for orders above Rs. 1,000',
      descriptionNe: 'रु. १,००० माथिको अर्डरमा १५% छुट',
    },
  ];

  const client = getSupabaseClient();
  if (!client) {
    const saved = localStorage.getItem('manas_traders_local_coupons');
    return saved ? JSON.parse(saved) : defaultCoupons;
  }

  try {
    const { data, error } = await client.from('coupons').select('*');
    if (error || !data || data.length === 0) {
      return defaultCoupons;
    }
    return data.map((c: any) => ({
      code: c.code,
      discountType: c.discount_type || c.discountType,
      discountValue: Number(c.discount_value || c.discountValue || 0),
      minOrderValue: c.min_order_value ? Number(c.min_order_value) : undefined,
      descriptionEn: c.description_en || c.descriptionEn,
      descriptionNe: c.description_ne || c.descriptionNe,
    }));
  } catch (err) {
    return defaultCoupons;
  }
}

/**
 * Add a Coupon to Supabase / Local
 */
export async function addCouponToDB(coupon: Coupon): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('coupons').insert([{
        code: coupon.code,
        discount_type: coupon.discountType,
        discount_value: coupon.discountValue,
        min_order_value: coupon.minOrderValue,
        description_en: coupon.descriptionEn,
        description_ne: coupon.descriptionNe,
      }]);
    } catch (e) {
      console.warn('Error saving coupon to Supabase:', e);
    }
  }

  const current = await fetchCouponsFromDB();
  current.unshift(coupon);
  localStorage.setItem('manas_traders_local_coupons', JSON.stringify(current));
}

/**
 * Delete a Coupon from Supabase / Local
 */
export async function deleteCouponFromDB(code: string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('coupons').delete().eq('code', code);
    } catch (e) {
      console.warn('Error deleting coupon from Supabase:', e);
    }
  }

  const current = await fetchCouponsFromDB();
  const updated = current.filter((c) => c.code !== code);
  localStorage.setItem('manas_traders_local_coupons', JSON.stringify(updated));
}

/**
 * Upload a single product image to Supabase Storage bucket 'product-images'
 * Fallback to Base64 Data URL if Supabase bucket isn't initialized or client is offline.
 */
export async function uploadProductImageToSupabaseStorage(file: File): Promise<string> {
  const client = getSupabaseClient();
  const sanitizedFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  if (client) {
    try {
      const { data, error } = await client.storage
        .from('product-images')
        .upload(sanitizedFileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = client.storage
          .from('product-images')
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn('Supabase storage upload attempt error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload error, using Data URL fallback:', err);
    }
  }

  // Fallback: Convert to Base64 Data URL or local Object URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      resolve(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload multiple product images to Supabase Storage
 */
export async function uploadMultipleProductImagesToSupabase(files: File[] | FileList): Promise<string[]> {
  const fileArray = Array.from(files);
  const uploadPromises = fileArray.map((file) => uploadProductImageToSupabaseStorage(file));
  return Promise.all(uploadPromises);
}

/**
 * Delete a product image from Supabase Storage bucket
 */
export async function deleteProductImageFromSupabaseStorage(imageUrl: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client || !imageUrl) return;

  // Extract storage file path if it's a Supabase storage URL
  if (imageUrl.includes('product-images')) {
    try {
      const urlParts = imageUrl.split('/product-images/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1].split('?')[0];
        await client.storage.from('product-images').remove([filePath]);
      }
    } catch (err) {
      console.warn('Error deleting file from Supabase storage bucket:', err);
    }
  }
}


