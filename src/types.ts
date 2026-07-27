/**
 * Manas Traders - Grocery eCommerce Types
 * Types for products, categories, cart, orders, translations, and Supabase config.
 */

export type Language = 'en' | 'ne';

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameNe: string;
  icon: string;
  image: string;
  itemCount: number;
}

export interface Product {
  id: string;
  nameEn: string;
  nameNe: string;
  categorySlug: string;
  price: number; // In NPR (Rs.)
  originalPrice?: number;
  unit: string; // e.g. "1 kg", "5 kg bag", "500 ml", "1 pkt"
  availableUnits?: string[];
  image: string;
  images?: string[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  isPopular?: boolean;
  isFlashSale?: boolean;
  originEn?: string; // e.g., "Mustang, Nepal", "Ilam, Nepal"
  originNe?: string;
  descriptionEn: string;
  descriptionNe: string;
  discountBadge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedUnit?: string;
}

export interface District {
  id: string;
  nameEn: string;
  nameNe: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

export type PaymentMethod = 'esewa' | 'khalti' | 'fonepay' | 'cod' | 'bank_transfer';

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  province?: string;
  district: string;
  municipality?: string;
  address: string;
  paymentMethod: PaymentMethod;
  items: {
    productId: string;
    nameEn: string;
    nameNe: string;
    quantity: number;
    price: number;
    unit: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
}

export interface SavedAddress {
  id: string;
  label: string; // e.g., 'Home', 'Office', 'Store', 'Family'
  fullName: string;
  phone: string;
  district: string;
  municipality?: string;
  address: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  province?: string;
  district: string;
  municipality?: string;
  address: string;
  role: 'customer' | 'admin';
  avatarUrl?: string;
  emailVerified?: boolean;
  savedAddresses?: SavedAddress[];
}

export interface Coupon {
  code: string;
  discountType: 'percent' | 'flat' | 'free_shipping';
  discountValue: number; // e.g. 10 for 10%, 50 for Rs. 50
  minOrderValue?: number;
  descriptionEn: string;
  descriptionNe: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
