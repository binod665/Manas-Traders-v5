import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, CartItem, Language, District, Order, UserProfile, ToastMessage } from '../types';
import { initialCategories, initialProducts, nepalDistricts } from '../data/products';
import {
  fetchProducts,
  createOrderInDB,
  isSupabaseConnected,
  syncWishlistToSupabase,
  fetchWishlistFromSupabase,
  fetchCartFromSupabase,
  syncCartToSupabase,
  getSupabaseClient,
  signOutWithSupabase,
} from '../lib/supabase';
import { getTranslation } from '../translations';
import { Coupon } from '../types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: string[]; // product IDs
  selectedDistrict: District;
  setSelectedDistrict: (district: District) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string; // slug or 'all'
  setSelectedCategory: (slug: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  orders: Order[];
  
  // Coupon System
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number, selectedUnit?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Wishlist Actions
  toggleWishlist: (productId: string) => void;
  
  // Modals
  activeModal: 'quickView' | 'checkout' | 'auth' | 'supabaseConfig' | 'admin' | 'githubGuide' | null;
  setActiveModal: (modal: 'quickView' | 'checkout' | 'auth' | 'supabaseConfig' | 'admin' | 'githubGuide' | null) => void;
  selectedProductForView: Product | null;
  setSelectedProductForView: (p: Product | null) => void;
  
  // Toast notifications
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  
  // Orders
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;
  
  // Product & Supabase Refetch
  refreshProducts: () => Promise<void>;
  isSupabaseConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('manas_traders_lang') as Language) || 'ne';
  });
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('manas_traders_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('manas_traders_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedDistrict, setSelectedDistrict] = useState<District>(nepalDistricts[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('manas_traders_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('manas_traders_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeModal, setActiveModal] = useState<'quickView' | 'checkout' | 'auth' | 'supabaseConfig' | 'admin' | 'githubGuide' | null>(null);
  const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const availableCoupons: Coupon[] = [
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

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = availableCoupons.find((c) => c.code === cleanCode);
    if (!found) {
      return { success: false, message: 'Invalid code. Try MANAS10, WELCOME50, FREESHIP, or SUPERNEPAL' };
    }

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    if (found.minOrderValue && subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `This coupon requires a minimum cart total of Rs. ${found.minOrderValue}.`,
      };
    }

    setAppliedCoupon(found);
    addToast('Coupon Applied!', `Coupon code ${found.code} applied successfully.`, 'success');
    return { success: true, message: `Coupon ${found.code} applied!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon Removed', 'Coupon code has been removed.', 'info');
  };

  // Persist language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('manas_traders_lang', lang);
  };

  // Persist cart to LocalStorage AND sync to Supabase if logged in
  useEffect(() => {
    localStorage.setItem('manas_traders_cart', JSON.stringify(cart));
    if (user?.id) {
      syncCartToSupabase(user.id, cart);
    }
  }, [cart, user?.id]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem('manas_traders_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Load products & listen to Supabase Auth state change on mount
  const refreshProducts = async () => {
    const prods = await fetchProducts();
    setProducts(prods);
  };

  useEffect(() => {
    refreshProducts();

    // Supabase Session Listener
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const usrProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: meta.full_name || session.user.email?.split('@')[0] || 'Customer',
            phone: meta.phone || '',
            district: meta.district || 'Kathmandu',
            address: meta.address || '',
            role: (meta.role as 'admin' | 'customer') || 'customer',
          };
          setUser(usrProfile);
          localStorage.setItem('manas_traders_user', JSON.stringify(usrProfile));

          // Fetch user wishlist from Supabase
          try {
            const remoteWishlist = await fetchWishlistFromSupabase(session.user.id);
            if (remoteWishlist && remoteWishlist.length > 0) {
              setWishlist((prev) => Array.from(new Set([...prev, ...remoteWishlist])));
            }
          } catch (e) {
            /* ignore wishlist fetch error */
          }

          // Fetch user cart from Supabase
          try {
            const remoteCart = await fetchCartFromSupabase(session.user.id);
            if (remoteCart && remoteCart.length > 0) {
              setCart((localCart) => {
                if (localCart.length === 0) return remoteCart;
                return localCart;
              });
            }
          } catch (e) {
            /* ignore cart fetch error */
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('manas_traders_user');
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const logout = async () => {
    await signOutWithSupabase();
    setUser(null);
    localStorage.removeItem('manas_traders_user');
    addToast('Signed Out', 'You have been logged out successfully', 'info');
  };

  // Toast handlers
  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1, selectedUnit?: string) => {
    const unitToUse = selectedUnit || product.unit;
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedUnit === unitToUse
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, selectedUnit: unitToUse }];
      }
    });

    const itemTitle = language === 'ne' ? product.nameNe : product.nameEn;
    const addedText = getTranslation(language, 'addedToCart');
    addToast(addedText, `${itemTitle} (${unitToUse}) x${quantity}`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist toggle
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (user?.id) {
        syncWishlistToSupabase(user.id, productId, !exists);
      }
      if (exists) {
        addToast('Wishlist', 'Item removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToast('Wishlist', 'Item added to wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  // Place Order
  const placeOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    const created = await createOrderInDB(orderData);
    setOrders((prev) => [created, ...prev]);
    clearCart();
    addToast(
      getTranslation(language, 'orderSuccessTitle'),
      getTranslation(language, 'orderSuccessMsg'),
      'success'
    );
    return created;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        products,
        categories,
        cart,
        wishlist,
        selectedDistrict,
        setSelectedDistrict,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        user,
        setUser,
        logout,
        orders,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        activeModal,
        setActiveModal,
        selectedProductForView,
        setSelectedProductForView,
        toasts,
        addToast,
        removeToast,
        placeOrder,
        refreshProducts,
        isSupabaseConnected: isSupabaseConnected(),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
