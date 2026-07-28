import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  addProductToDB,
  updateProductInDB,
  deleteProductFromDB,
  fetchCategoriesFromDB,
  addCategoryToDB,
  deleteCategoryFromDB,
  updateOrderStatusInDB,
  fetchCustomersFromDB,
  fetchCouponsFromDB,
  addCouponToDB,
  deleteCouponFromDB,
  signInWithSupabase,
  uploadMultipleProductImagesToSupabase,
  deleteProductImageFromSupabaseStorage,
  fetchContactMessagesFromSupabase,
} from '../lib/supabase';
import { Product, Category, Order, UserProfile, Coupon, PaymentMethod } from '../types';
import { getTranslation } from '../translations';
import {
  ShieldCheck,
  Plus,
  Package,
  ShoppingBag,
  X,
  Check,
  Database,
  Users,
  BarChart3,
  Ticket,
  Settings,
  Search,
  Edit,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  FileText,
  Eye,
  LogOut,
  Lock,
  Layers,
  ChevronRight,
  Download,
  AlertCircle,
  Tag,
  DollarSign,
  Percent,
  Upload,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Sparkles,
  Github,
  Globe,
  Copy,
  ExternalLink,
  Code,
  ServerOff,
  Zap,
  Smartphone,
  MessageSquare,
} from 'lucide-react';
import { SUPABASE_RLS_SQL_SCRIPT } from '../lib/supabase-rls-script';

export const AdminModal: React.FC = () => {
  const {
    language,
    activeModal,
    setActiveModal,
    products,
    categories,
    orders,
    refreshProducts,
    addToast,
    user,
    setUser,
    isSupabaseConnected,
  } = useApp();

  // Admin Auth State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'inventory' | 'reports' | 'coupons' | 'messages' | 'githubGuide' | 'settings'
  >('dashboard');

  const [contactMessages, setContactMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchContactMessagesFromSupabase().then((msgs) => setContactMessages(msgs));
  }, [activeTab]);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    addToast('Copied to Clipboard', `${label} copied successfully!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Product CRUD states
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Form states for Product Add/Edit
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodNameNe, setProdNameNe] = useState('');
  const [prodCategorySlug, setProdCategorySlug] = useState('rice-grains');
  const [prodPrice, setProdPrice] = useState<number>(500);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number>(600);
  const [prodUnit, setProdUnit] = useState('1 kg');
  const [prodImage, setProdImage] = useState(
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
  );
  const [prodImages, setProdImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  ]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [previewingImageUrl, setPreviewingImageUrl] = useState<string | null>(null);
  const [prodOriginEn, setProdOriginEn] = useState('Kathmandu, Nepal');
  const [prodOriginNe, setProdOriginNe] = useState('काठमाडौँ, नेपाल');
  const [prodDescEn, setProdDescEn] = useState('Fresh high quality Nepalese organic grocery item.');
  const [prodDescNe, setProdDescNe] = useState('उच्च गुणस्तरीय ताजा नेपाली खाद्यान्न सामान।');
  const [prodInStock, setProdInStock] = useState(true);
  const [prodIsPopular, setProdIsPopular] = useState(false);
  const [prodIsFlashSale, setProdIsFlashSale] = useState(false);
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);

  // Category CRUD states
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories);
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameNe, setCatNameNe] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catIcon, setCatIcon] = useState('🌾');
  const [catImage, setCatImage] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Order Search & Status Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Customer List state
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState<'percent' | 'flat' | 'free_shipping'>('percent');
  const [couponValue, setCouponValue] = useState<number>(10);
  const [couponMinSpend, setCouponMinSpend] = useState<number>(500);
  const [couponDescEn, setCouponDescEn] = useState('10% off on all organic items');
  const [couponDescNe, setCouponDescNe] = useState('सबै खाद्यान्नमा १०% छुट');
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);

  // Load Categories, Customers, and Coupons on activeModal or tab change
  useEffect(() => {
    if (activeModal === 'admin' || activeModal === 'githubGuide') {
      if (activeModal === 'githubGuide') {
        setActiveTab('githubGuide');
      }
      loadCategories();
      loadCustomers();
      loadCoupons();
    }
  }, [activeModal]);

  const loadCategories = async () => {
    const data = await fetchCategoriesFromDB();
    setCategoriesList(data);
  };

  const loadCustomers = async () => {
    const data = await fetchCustomersFromDB();
    setCustomers(data);
  };

  const loadCoupons = async () => {
    const data = await fetchCouponsFromDB();
    setCoupons(data);
  };

  if (activeModal !== 'admin' && activeModal !== 'githubGuide') return null;

  // Require explicit login for admin access
  const isAdmin = isAdminUnlocked && user?.role === 'admin';

  // Handle Admin Auth Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      const cleanEmail = adminEmail.trim().toLowerCase();
      // Allow login with demo admin email or configured email
      if (
        (cleanEmail === 'admin@manastraders.com' || cleanEmail === 'bhandaribinodtkp@gmail.com') &&
        adminPassword === '9956432661@GbYa'
      ) {
        const adminUser: UserProfile = {
          id: 'admin-usr-binod',
          email: 'admin@manastraders.com',
          fullName: 'Binod Bhandari (Admin)',
          phone: '9848500665',
          district: 'Kailali',
          address: 'Tikapur, Kailali',
          role: 'admin',
        };
        setUser(adminUser);
        setIsAdminUnlocked(true);
        localStorage.setItem('manas_traders_user', JSON.stringify(adminUser));
        addToast('Admin Authenticated', `Welcome back, ${adminUser.fullName}`, 'success');
        setIsLoggingIn(false);
        return;
      }

      const { userProfile, error } = await signInWithSupabase(adminEmail, adminPassword);
      if (error) {
        setAuthError(error);
      } else if (userProfile && (userProfile.role === 'admin' || userProfile.email === 'bhandaribinodtkp@gmail.com')) {
        const updatedAdmin: UserProfile = { ...userProfile, role: 'admin' };
        setUser(updatedAdmin);
        setIsAdminUnlocked(true);
        localStorage.setItem('manas_traders_user', JSON.stringify(updatedAdmin));
        addToast('Admin Authenticated', `Welcome back, ${updatedAdmin.fullName}`, 'success');
      } else {
        setAuthError('Access denied. Incorrect Admin Email or Password.');
      }
    } catch (err: any) {
      setAuthError('Authentication failed. Please check credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Multiple Product Image Upload handler to Supabase Storage
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList = e.target.files;
    setIsUploadingImages(true);
    setUploadProgress(`Uploading ${fileList.length} image(s) to Supabase Storage...`);

    try {
      const uploadedUrls = await uploadMultipleProductImagesToSupabase(fileList);
      setProdImages((prev) => {
        const combined = [...prev, ...uploadedUrls];
        if (!prodImage || prodImage === 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80') {
          setProdImage(combined[0]);
        }
        return combined;
      });
      addToast('Images Uploaded', `Successfully uploaded ${uploadedUrls.length} image(s) to Supabase Storage`, 'success');
    } catch (err) {
      addToast('Upload Failed', 'Failed to upload image(s) to Supabase Storage', 'error');
    } finally {
      setIsUploadingImages(false);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  // Delete product image from list & Supabase Storage
  const handleDeleteProductImage = async (urlToDelete: string) => {
    if (prodImages.length <= 1) {
      addToast('Notice', 'At least one product image is required', 'info');
      return;
    }
    await deleteProductImageFromSupabaseStorage(urlToDelete);
    const updated = prodImages.filter((img) => img !== urlToDelete);
    setProdImages(updated);
    if (prodImage === urlToDelete) {
      setProdImage(updated[0]);
    }
    addToast('Image Removed', 'Deleted image from product photo gallery', 'info');
  };

  // Set primary cover photo
  const handleSetAsCoverImage = (imgUrl: string) => {
    setProdImage(imgUrl);
    addToast('Cover Photo Set', 'Primary product cover image updated', 'info');
  };

  // Open Product Add / Edit Modal
  const handleOpenProductForm = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProdNameEn(prod.nameEn);
      setProdNameNe(prod.nameNe);
      setProdCategorySlug(prod.categorySlug);
      setProdPrice(prod.price);
      setProdOriginalPrice(prod.originalPrice || prod.price);
      setProdUnit(prod.unit);
      setProdImage(prod.image);
      setProdImages(prod.images && prod.images.length > 0 ? prod.images : [prod.image]);
      setProdOriginEn(prod.originEn || 'Kathmandu, Nepal');
      setProdOriginNe(prod.originNe || 'काठमाडौँ, नेपाल');
      setProdDescEn(prod.descriptionEn || '');
      setProdDescNe(prod.descriptionNe || '');
      setProdInStock(prod.inStock);
      setProdIsPopular(!!prod.isPopular);
      setProdIsFlashSale(!!prod.isFlashSale);
    } else {
      setEditingProduct(null);
      setProdNameEn('');
      setProdNameNe('');
      setProdCategorySlug('rice-grains');
      setProdPrice(500);
      setProdOriginalPrice(600);
      setProdUnit('1 kg');
      const defaultImg = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80';
      setProdImage(defaultImg);
      setProdImages([defaultImg]);
      setProdOriginEn('Kathmandu, Nepal');
      setProdOriginNe('काठमाडौँ, नेपाल');
      setProdDescEn('Fresh high quality Nepalese organic grocery item.');
      setProdDescNe('उच्च गुणस्तरीय ताजा नेपाली खाद्यान्न सामान।');
      setProdInStock(true);
      setProdIsPopular(false);
      setProdIsFlashSale(false);
    }
    setIsProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNameEn || !prodNameNe || !prodPrice) {
      alert('Please fill in required product names and price.');
      return;
    }

    setIsSubmittingProd(true);
    try {
      const prodPayload = {
        nameEn: prodNameEn,
        nameNe: prodNameNe,
        categorySlug: prodCategorySlug,
        price: prodPrice,
        originalPrice: prodOriginalPrice > prodPrice ? prodOriginalPrice : undefined,
        unit: prodUnit,
        availableUnits: [prodUnit],
        image: prodImage || prodImages[0],
        images: prodImages.length > 0 ? prodImages : [prodImage],
        rating: editingProduct ? editingProduct.rating : 5.0,
        reviewsCount: editingProduct ? editingProduct.reviewsCount : 1,
        inStock: prodInStock,
        isPopular: prodIsPopular,
        isFlashSale: prodIsFlashSale,
        originEn: prodOriginEn,
        originNe: prodOriginNe,
        descriptionEn: prodDescEn,
        descriptionNe: prodDescNe,
      };

      if (editingProduct) {
        await updateProductInDB({ ...prodPayload, id: editingProduct.id });
        addToast('Product Updated', `${prodNameEn} updated successfully in Supabase`, 'success');
      } else {
        await addProductToDB(prodPayload);
        addToast('Product Added', `${prodNameEn} added to Supabase DB`, 'success');
      }

      await refreshProducts();
      setIsProductModalOpen(false);
    } catch (err) {
      alert('Failed to save product.');
    } finally {
      setIsSubmittingProd(false);
    }
  };

  // Toggle Stock Status
  const handleToggleStock = async (prod: Product) => {
    const updated = { ...prod, inStock: !prod.inStock };
    await updateProductInDB(updated);
    await refreshProducts();
    addToast('Stock Status Changed', `${prod.nameEn} is now ${updated.inStock ? 'In Stock' : 'Out of Stock'}`, 'info');
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from Supabase database?`)) {
      await deleteProductFromDB(id);
      await refreshProducts();
      addToast('Product Deleted', `Deleted "${name}"`, 'warning');
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameEn || !catNameNe) return;
    setIsSubmittingCat(true);
    try {
      const slugToUse = catSlug.trim() || catNameEn.toLowerCase().replace(/\s+/g, '-');
      await addCategoryToDB({
        slug: slugToUse,
        nameEn: catNameEn,
        nameNe: catNameNe,
        icon: catIcon || '🛍️',
        image: catImage,
        itemCount: 0,
      });
      await loadCategories();
      setCatNameEn('');
      setCatNameNe('');
      setCatSlug('');
      addToast('Category Added', `Added category ${catNameEn}`, 'success');
    } catch (e) {
      alert('Error adding category.');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Delete category "${name}"?`)) {
      await deleteCategoryFromDB(id);
      await loadCategories();
      addToast('Category Removed', `Deleted category ${name}`, 'warning');
    }
  };

  // Update Order Status in Supabase
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatusInDB(orderId, newStatus);
    addToast('Order Status Updated', `Order #${orderId} marked as ${newStatus}`, 'success');
    window.location.reload(); // Refresh local state
  };

  // Add Coupon
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsSubmittingCoupon(true);
    try {
      await addCouponToDB({
        code: couponCode.trim().toUpperCase(),
        discountType: couponDiscountType,
        discountValue: couponValue,
        minOrderValue: couponMinSpend > 0 ? couponMinSpend : undefined,
        descriptionEn: couponDescEn,
        descriptionNe: couponDescNe,
      });
      await loadCoupons();
      setCouponCode('');
      addToast('Coupon Created', `Created promo code ${couponCode.toUpperCase()}`, 'success');
    } catch (e) {
      alert('Failed to create coupon.');
    } finally {
      setIsSubmittingCoupon(false);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (code: string) => {
    if (confirm(`Delete coupon code ${code}?`)) {
      await deleteCouponFromDB(code);
      await loadCoupons();
      addToast('Coupon Deleted', `Deleted promo code ${code}`, 'info');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nameEn.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.nameNe.includes(productSearch) ||
      p.id.includes(productSearch);
    const matchesCat = selectedCategoryFilter === 'all' || p.categorySlug === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch) ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Analytics Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const outOfStockCount = products.filter((p) => !p.inStock).length;
  const popularCount = products.filter((p) => p.isPopular).length;

  // Export Sales Report CSV
  const exportSalesReportCSV = () => {
    const headers = 'Order ID,Customer Name,Phone,District,Items Count,Total Amount (NPR),Payment Method,Status,Date\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.id}","${o.customerName}","${o.phone}","${o.district}",${o.items.length},${o.total},"${o.paymentMethod}","${o.status}","${new Date(
            o.createdAt
          ).toLocaleDateString()}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manas_Traders_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 my-4"
      >
        {/* Header Bar */}
        <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Manas Traders Admin Control Center
                </h3>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                    isSupabaseConnected
                      ? 'bg-emerald-800 text-emerald-200 border-emerald-600'
                      : 'bg-amber-800 text-amber-200 border-amber-600'
                  }`}
                >
                  {isSupabaseConnected ? '⚡ Supabase Live' : '💾 Local Engine'}
                </span>
              </div>
              <p className="text-xs text-emerald-300">
                Full-Stack Inventory, Sales Analytics, Orders & Store Manager
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ADMIN AUTH GUARD */}
        {!isAdmin ? (
          <div className="p-8 max-w-md mx-auto text-center space-y-5 my-auto">
            <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900">Admin Authentication Required</h3>
              <p className="text-xs text-gray-500 mt-1">
                Please sign in with your Admin account credentials to access store controls.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Admin Email / Username</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@manastraders.com"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                {isLoggingIn ? 'Authenticating...' : 'Sign In as Admin'}
              </button>
            </form>
          </div>
        ) : (
          /* MAIN ADMIN DASHBOARD BODY */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="bg-gray-900 text-gray-300 w-full md:w-56 shrink-0 p-3 border-r border-gray-800 flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'products', label: 'Products', icon: Package, badge: products.length },
                { id: 'categories', label: 'Categories', icon: Layers, badge: categoriesList.length },
                { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.length },
                { id: 'customers', label: 'Customers', icon: Users, badge: customers.length },
                { id: 'inventory', label: 'Inventory', icon: Tag, badge: outOfStockCount ? `${outOfStockCount} Low` : undefined },
                { id: 'reports', label: 'Reports', icon: TrendingUp },
                { id: 'coupons', label: 'Coupons', icon: Ticket, badge: coupons.length },
                { id: 'messages', label: 'Inquiries', icon: MessageSquare, badge: contactMessages.length || undefined },
                { id: 'githubGuide', label: 'GitHub Guide', icon: Github },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-md'
                        : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                          isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="mt-auto pt-4 border-t border-gray-800 hidden md:block">
                <div className="px-3 py-2 bg-gray-800/80 rounded-xl text-[11px] mb-2">
                  <span className="block text-gray-400 text-[10px]">Logged Admin:</span>
                  <span className="font-bold text-white block line-clamp-1">{user?.fullName}</span>
                </div>
                <button
                  onClick={() => {
                    setIsAdminUnlocked(false);
                    setUser(null);
                  }}
                  className="w-full bg-gray-800 hover:bg-red-900/60 text-gray-300 hover:text-red-200 p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Admin</span>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50/50">
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Store Performance Overview</h3>
                    <p className="text-xs text-gray-500">
                      Real-time revenue metrics, order statuses, and product catalog insights
                    </p>
                  </div>

                  {/* Stat Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
                      <span className="text-lg font-black text-emerald-900 mt-1 block">
                        Rs. {totalRevenue.toLocaleString('ne-NP')}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" /> From {orders.length} orders
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">{orders.length}</span>
                      <span className="text-[10px] text-gray-500 mt-1 block">Logged in Supabase</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Products</span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">{products.length}</span>
                      <span className="text-[10px] text-emerald-700 mt-1 block">{products.length - outOfStockCount} in stock</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Categories</span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">{categoriesList.length}</span>
                      <span className="text-[10px] text-gray-500 mt-1 block">Active sections</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Customers</span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">{customers.length}</span>
                      <span className="text-[10px] text-blue-700 mt-1 block">Registered Users</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Stock Alerts</span>
                      <span className="text-lg font-black text-red-600 mt-1 block">{outOfStockCount}</span>
                      <span className="text-[10px] text-red-500 mt-1 block">Requires re-stock</span>
                    </div>
                  </div>

                  {/* Action Shortcuts */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenProductForm()}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>

                    <button
                      onClick={exportSalesReportCSV}
                      className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-700" />
                      <span>Export Sales CSV Report</span>
                    </button>
                  </div>

                  {/* Recent Orders Preview */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h4 className="font-extrabold text-sm text-gray-900">Recent Customer Orders</h4>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All Orders</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-6">No customer orders logged yet.</p>
                    ) : (
                      <div className="space-y-2 text-xs">
                        {orders.slice(0, 4).map((ord) => (
                          <div
                            key={ord.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                          >
                            <div>
                              <span className="font-mono font-bold text-emerald-900">{ord.id}</span>
                              <span className="text-gray-800 font-bold ml-2">{ord.customerName}</span>
                              <span className="text-gray-400 text-[11px] block">{ord.district} • {ord.items.length} items</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-gray-900 block">Rs. {ord.total.toLocaleString('ne-NP')}</span>
                              <span className="text-[10px] font-bold text-emerald-800 uppercase">{ord.paymentMethod}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS CRUD */}
              {activeTab === 'products' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Products Catalog ({filteredProducts.length})</h3>
                      <p className="text-xs text-gray-500">Manage grocery items, prices, and stock</p>
                    </div>
                    <button
                      onClick={() => handleOpenProductForm()}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Item</span>
                    </button>
                  </div>

                  {/* Filters Bar */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products by English or Nepali name..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl"
                      />
                    </div>

                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-xl"
                    >
                      <option value="all">All Categories ({products.length})</option>
                      {categoriesList.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100/80 text-gray-700 font-extrabold uppercase text-[10px] border-b border-gray-200">
                          <tr>
                            <th className="p-3">Product</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price (NPR)</th>
                            <th className="p-3">Unit</th>
                            <th className="p-3">Stock Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                          {filteredProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={p.image}
                                    alt={p.nameEn}
                                    className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                                  />
                                  <div>
                                    <span className="font-bold text-gray-900 block line-clamp-1">{p.nameEn}</span>
                                    <span className="text-[10px] text-gray-500 block">{p.nameNe}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                                  {p.categorySlug}
                                </span>
                              </td>
                              <td className="p-3 font-extrabold text-emerald-800">
                                Rs. {p.price}
                                {p.originalPrice && (
                                  <span className="text-[10px] text-gray-400 line-through ml-1 font-normal">
                                    Rs. {p.originalPrice}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-gray-600">{p.unit}</td>
                              <td className="p-3">
                                <button
                                  onClick={() => handleToggleStock(p)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                    p.inStock
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-red-100 text-red-800 border border-red-300'
                                  }`}
                                >
                                  {p.inStock ? 'In Stock ✓' : 'Out of Stock ✗'}
                                </button>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleOpenProductForm(p)}
                                    className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id, p.nameEn)}
                                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CATEGORIES CRUD */}
              {activeTab === 'categories' && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Categories Management</h3>
                    <p className="text-xs text-gray-500">Add, edit, and organize grocery sections</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Add Category Form */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-900">Add New Category</h4>
                      <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Name (English)</label>
                          <input
                            type="text"
                            required
                            value={catNameEn}
                            onChange={(e) => setCatNameEn(e.target.value)}
                            placeholder="e.g. Dairy & Ghee"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Name (Nepali)</label>
                          <input
                            type="text"
                            required
                            value={catNameNe}
                            onChange={(e) => setCatNameNe(e.target.value)}
                            placeholder="e.g. दुग्ध र घिउ"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Emoji / Icon</label>
                          <input
                            type="text"
                            value={catIcon}
                            onChange={(e) => setCatIcon(e.target.value)}
                            placeholder="🧈"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingCat}
                          className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          {isSubmittingCat ? 'Adding...' : 'Save Category'}
                        </button>
                      </form>
                    </div>

                    {/* Categories List Table */}
                    <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                      <div className="p-3 bg-gray-100 border-b border-gray-200 font-extrabold text-xs text-gray-800">
                        Existing Categories ({categoriesList.length})
                      </div>
                      <div className="divide-y divide-gray-100">
                        {categoriesList.map((cat) => (
                          <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-gray-50 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="text-xl p-2 bg-gray-100 rounded-xl">{cat.icon}</span>
                              <div>
                                <span className="font-bold text-gray-900 block">{cat.nameEn}</span>
                                <span className="text-gray-500 text-[10px]">{cat.nameNe} • slug: {cat.slug}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.nameEn)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Customer Orders ({filteredOrders.length})</h3>
                      <p className="text-xs text-gray-500">Track delivery statuses and update orders</p>
                    </div>

                    <button
                      onClick={exportSalesReportCSV}
                      className="bg-white border border-gray-300 text-gray-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Export CSV</span>
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search by customer name, phone, or order ID..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl"
                    />

                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-xl"
                    >
                      <option value="all">All Order Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100/80 text-gray-700 font-extrabold uppercase text-[10px] border-b border-gray-200">
                          <tr>
                            <th className="p-3">Order ID & Date</th>
                            <th className="p-3">Customer Details</th>
                            <th className="p-3">Location</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3">Total (NPR)</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-gray-500">
                                No orders matching the selected filter.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="p-3 font-mono font-bold text-emerald-900">
                                  {ord.id}
                                  <span className="block text-[10px] text-gray-400 font-normal">
                                    {new Date(ord.createdAt).toLocaleDateString()}
                                  </span>
                                </td>

                                <td className="p-3">
                                  <span className="font-bold text-gray-900 block">{ord.customerName}</span>
                                  <span className="text-[11px] text-gray-500 block">{ord.phone}</span>
                                </td>

                                <td className="p-3 text-gray-700 text-[11px]">
                                  {ord.district}
                                  <span className="block text-[10px] text-gray-400 line-clamp-1">{ord.address}</span>
                                </td>

                                <td className="p-3">
                                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                                    {ord.paymentMethod}
                                  </span>
                                </td>

                                <td className="p-3 font-black text-emerald-900">
                                  Rs. {ord.total.toLocaleString('ne-NP')}
                                </td>

                                <td className="p-3">
                                  <select
                                    value={ord.status}
                                    onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border focus:outline-none cursor-pointer ${
                                      ord.status === 'delivered'
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : ord.status === 'processing'
                                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                                        : ord.status === 'cancelled'
                                        ? 'bg-red-100 text-red-800 border-red-300'
                                        : 'bg-amber-100 text-amber-800 border-amber-300'
                                    }`}
                                  >
                                    <option value="pending">⏳ Pending</option>
                                    <option value="processing">⚙️ Processing</option>
                                    <option value="delivered">✅ Delivered</option>
                                    <option value="cancelled">❌ Cancelled</option>
                                  </select>
                                </td>

                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => setSelectedOrderDetails(ord)}
                                    className="p-1.5 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors cursor-pointer"
                                    title="View Full Receipt"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Registered Customers ({customers.length})</h3>
                    <p className="text-xs text-gray-500">Customer directory synced with auth profiles</p>
                  </div>

                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by customer name or email..."
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl"
                  />

                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                    <div className="divide-y divide-gray-100">
                      {customers
                        .filter(
                          (c) =>
                            c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            c.email.toLowerCase().includes(customerSearch.toLowerCase())
                        )
                        .map((cust) => (
                          <div key={cust.id} className="p-3.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center">
                                {cust.fullName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 block">{cust.fullName}</span>
                                <span className="text-[11px] text-gray-500">{cust.email} • {cust.phone}</span>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                                cust.role === 'admin'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              }`}
                            >
                              {cust.role}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: INVENTORY */}
              {activeTab === 'inventory' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Inventory & Stock Controls</h3>
                    <p className="text-xs text-gray-500">Monitor product stock levels and toggle availability</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-white rounded-2xl border border-gray-200 flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <img src={p.image} className="w-10 h-10 object-cover rounded-lg" />
                          <div>
                            <span className="font-bold text-gray-900 block line-clamp-1">{p.nameEn}</span>
                            <span className="text-emerald-800 font-extrabold text-[11px]">Rs. {p.price}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleStock(p)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-colors ${
                            p.inStock
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: REPORTS */}
              {activeTab === 'reports' && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Financial Reports & Analytics</h3>
                    <p className="text-xs text-gray-500">Detailed breakdown of store sales, delivery fees, and order payments</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-900">Payment Methods Breakdown</h4>
                      <div className="space-y-2 text-xs">
                        {['cod', 'esewa', 'khalti', 'bank_transfer'].map((pm) => {
                          const count = orders.filter((o) => o.paymentMethod === pm).length;
                          const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                          return (
                            <div key={pm} className="space-y-1">
                              <div className="flex justify-between font-semibold text-gray-700 text-[11px]">
                                <span className="uppercase">{pm === 'cod' ? 'Cash on Delivery' : pm}</span>
                                <span>{count} orders ({pct}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-emerald-800 h-2 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-900">Quick Actions</h4>
                      <button
                        onClick={exportSalesReportCSV}
                        className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Store Sales Report (.CSV)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: COUPONS */}
              {activeTab === 'coupons' && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Promo Coupons Management</h3>
                    <p className="text-xs text-gray-500">Create and manage discount codes for customers</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Add Coupon Form */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-900">Create New Coupon</h4>
                      <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Coupon Code *</label>
                          <input
                            type="text"
                            required
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="e.g. TEEJ20"
                            className="w-full uppercase font-mono px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Discount Type</label>
                          <select
                            value={couponDiscountType}
                            onChange={(e) => setCouponDiscountType(e.target.value as any)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                          >
                            <option value="percent">Percentage (%) Off</option>
                            <option value="flat">Flat Amount (NPR) Off</option>
                            <option value="free_shipping">Free Shipping</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Discount Value</label>
                          <input
                            type="number"
                            value={couponValue}
                            onChange={(e) => setCouponValue(Number(e.target.value))}
                            placeholder="10"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Description (English)</label>
                          <input
                            type="text"
                            value={couponDescEn}
                            onChange={(e) => setCouponDescEn(e.target.value)}
                            placeholder="10% off"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingCoupon}
                          className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          {isSubmittingCoupon ? 'Saving...' : 'Save Coupon'}
                        </button>
                      </form>
                    </div>

                    {/* Coupons List */}
                    <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                      <div className="p-3 bg-gray-100 border-b border-gray-200 font-extrabold text-xs text-gray-800">
                        Active Store Coupons ({coupons.length})
                      </div>
                      <div className="divide-y divide-gray-100">
                        {coupons.map((c) => (
                          <div key={c.code} className="p-3.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-xl">
                                {c.code}
                              </span>
                              <div>
                                <span className="font-bold text-gray-900 block">{c.descriptionEn}</span>
                                <span className="text-gray-500 text-[10px]">{c.descriptionNe}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteCoupon(c.code)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: GITHUB PAGES DEPLOYMENT GUIDE */}
              {activeTab === 'githubGuide' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Github className="w-5 h-5 text-emerald-800" />
                        <span>GitHub Pages Deployment & Security Guide</span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        नेपाली गाइड: वेबसाईटलाई GitHub Pages मा निःशुल्क लाईभ गर्ने र Supabase Database सुरक्षित गर्ने चरणहरू
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="bg-emerald-100 text-emerald-900 font-bold text-[11px] px-3 py-1 rounded-full border border-emerald-300">
                        🌐 manastraders.com.np
                      </span>
                    </div>
                  </div>

                  {/* Section 1: Nepali Explanation & Commands */}
                  <div className="bg-emerald-950 text-white p-4 sm:p-5 rounded-2xl space-y-2 border border-emerald-900">
                    <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>नेपालीमा सजिलो deployment गाइड:</span>
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed">
                      तपाईंको कम्प्युटरमा Visual Studio Code terminal मा तलका कमाण्डहरू पालैपालो चलाउनुहोस्। यो कमाण्डहरू चलाएपछि तपाईंको वेवसाईट GitHub Pages मा अटोमेटिक अपलोड भई मानस ट्रेडर्स लाईभ हुनेछ।
                    </p>
                  </div>

                  {/* Commands Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Step 1 */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-emerald-900 flex items-center gap-2">
                          <span className="w-5 h-5 bg-emerald-800 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                          चरण १: Project Build गर्ने
                        </span>
                        <button
                          onClick={() => handleCopyCode('npm run build', 'Build Command')}
                          className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCode === 'Build Command' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode === 'Build Command' ? 'कपी भयो!' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-600">VS Code Terminal मा यो कमाण्ड टाइप गरेर Enter थिच्नुहोस्:</p>
                      <pre className="p-2.5 bg-gray-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                        npm run build
                      </pre>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-emerald-900 flex items-center gap-2">
                          <span className="w-5 h-5 bg-emerald-800 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                          चरण २: GitHub Pages मा Publish गर्ने
                        </span>
                        <button
                          onClick={() => handleCopyCode('npx gh-pages -d dist', 'Deploy Command')}
                          className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCode === 'Deploy Command' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode === 'Deploy Command' ? 'कपी भयो!' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-600">Build सम्पन्न भएपछि यो कमाण्ड टाइप गरेर Enter थिच्नुहोस्:</p>
                      <pre className="p-2.5 bg-gray-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                        npx gh-pages -d dist
                      </pre>
                    </div>
                  </div>

                  {/* Section 2: Supabase RLS SQL Script */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-xs uppercase text-emerald-900 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          Supabase Row Level Security (RLS) SQL Script
                        </h4>
                        <p className="text-[11px] text-gray-500">Supabase Dashboard - SQL Editor मा यो कोड पेस्ट गरेर Run गर्नुहोस्।</p>
                      </div>
                      <button
                        onClick={() => handleCopyCode(SUPABASE_RLS_SQL_SCRIPT, 'Supabase RLS Script')}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                      >
                        {copiedCode === 'Supabase RLS Script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode === 'Supabase RLS Script' ? 'SQL Copied!' : 'Copy SQL Script'}</span>
                      </button>
                    </div>

                    <pre className="p-3 bg-gray-900 text-emerald-300 rounded-xl font-mono text-[10.5px] max-h-52 overflow-y-auto leading-relaxed border border-gray-800">
                      {SUPABASE_RLS_SQL_SCRIPT}
                    </pre>
                  </div>

                  {/* Section 3: Domain & DNS Configuration */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2 text-xs">
                    <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-700" />
                      Custom Domain setup (manastraders.com.np)
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-[11px]">
                      <li>
                        <code className="bg-gray-100 font-mono text-gray-900 px-1 py-0.5 rounded">public/CNAME</code> फाइल भित्र <code className="font-bold text-emerald-800">manastraders.com.np</code> पहिले नै सेट छ।
                      </li>
                      <li>
                        Mercantile (.np domain manager) मा गएर DNS CNAME record मा <code className="font-mono text-gray-900">yourusername.github.io</code> राख्नुहोस्।
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 9: CONTACT INQUIRIES & MESSAGES */}
              {activeTab === 'messages' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">
                        Customer Inquiries & Contact Form Submissions
                      </h3>
                      <p className="text-xs text-gray-500">
                        Messages sent via the Contact Form and saved in Supabase database
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        const msgs = await fetchContactMessagesFromSupabase();
                        setContactMessages(msgs);
                        addToast('Refreshed', 'Inquiries list updated', 'info');
                      }}
                      className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Messages</span>
                    </button>
                  </div>

                  {contactMessages.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-2">
                      <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
                      <h4 className="font-bold text-sm text-gray-700">No Messages Yet</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        Inquiries submitted through the Contact Page will be logged here and stored in Supabase.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contactMessages.map((msg: any) => (
                        <div
                          key={msg.id}
                          className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2 hover:border-emerald-300 transition-all"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-gray-900">
                                {msg.fullName}
                              </span>
                              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                {msg.subject}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Recently'}
                            </span>
                          </div>

                          <div className="text-xs text-gray-600 space-y-1">
                            <p className="font-semibold text-emerald-800">
                              Contact: <a href={`tel:${msg.emailOrPhone}`} className="underline">{msg.emailOrPhone}</a>
                            </p>
                            <p className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-800 text-xs leading-relaxed whitespace-pre-wrap font-sans mt-2">
                              "{msg.message}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 10: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Store Settings & Supabase Info</h3>
                    <p className="text-xs text-gray-500">Configure store metadata and verify database status</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4 shadow-2xs text-xs">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <span className="font-bold text-gray-900 block">Supabase Connection Status</span>
                        <span className="text-gray-500">
                          {isSupabaseConnected ? 'Connected to Supabase PostgreSQL' : 'Operating in offline local storage mode'}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveModal('supabaseConfig')}
                        className="bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl font-bold cursor-pointer hover:bg-emerald-900"
                      >
                        Configure Supabase Keys
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <span className="font-bold text-gray-900 block">GitHub Pages Deployment Guide</span>
                        <span className="text-gray-500">
                          View step-by-step deployment instructions and SQL security scripts
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab('githubGuide')}
                        className="bg-gray-800 hover:bg-gray-900 text-white px-3.5 py-1.5 rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
                      >
                        <Github className="w-4 h-4 text-amber-400" />
                        <span>Open GitHub Guide</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-gray-800 block">Store Info</span>
                      <p className="text-gray-600">Store Name: Manas Traders Pvt. Ltd.</p>
                      <p className="text-gray-600">Location: Tikapur-1, Kailali, Nepal</p>
                      <p className="text-gray-600">Support Contact: +977 9848500665</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal for Adding / Editing Product */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-4 border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h4 className="font-black text-base text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Grocery Product'}
                </h4>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Product Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={prodNameEn}
                      onChange={(e) => setProdNameEn(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Product Name (Nepali) *</label>
                    <input
                      type="text"
                      required
                      value={prodNameNe}
                      onChange={(e) => setProdNameNe(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Category</label>
                    <select
                      value={prodCategorySlug}
                      onChange={(e) => setProdCategorySlug(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                    >
                      {categoriesList.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Price (NPR) *</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Unit Label</label>
                    <input
                      type="text"
                      value={prodUnit}
                      onChange={(e) => setProdUnit(e.target.value)}
                      placeholder="1 kg"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Supabase Storage Multi-Image Upload & Preview Gallery */}
                <div className="space-y-2 border border-emerald-100 bg-emerald-50/40 p-3.5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
                      <Upload className="w-4 h-4 text-emerald-800" />
                      <span>Supabase Storage - Product Images Gallery</span>
                    </label>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      {prodImages.length} Image(s)
                    </span>
                  </div>

                  {/* Multiple File Upload Dropzone */}
                  <div className="relative border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white rounded-xl p-3 text-center transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleImageUpload}
                      disabled={isUploadingImages}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1">
                      {isUploadingImages ? (
                        <div className="flex items-center gap-2 text-emerald-800 font-bold py-1">
                          <Loader2 className="w-5 h-5 animate-spin text-emerald-800" />
                          <span>{uploadProgress || 'Uploading to Supabase Storage...'}</span>
                        </div>
                      ) : (
                        <>
                          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-full">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-gray-800">
                            Click or drag multiple product photos here
                          </p>
                          <p className="text-[10px] text-gray-500">
                            JPG, PNG, WEBP, GIF up to 10MB (Stores image URLs in database)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Image Gallery Grid & Preview Thumbnails */}
                  {prodImages.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-gray-700 block">
                        Uploaded Product Photos (Click preview to zoom or set cover image):
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {prodImages.map((imgUrl, index) => {
                          const isCover = imgUrl === prodImage;
                          return (
                            <div
                              key={index}
                              className={`group relative rounded-xl overflow-hidden border-2 bg-gray-100 aspect-square shadow-2xs transition-all ${
                                isCover ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-gray-200 hover:border-emerald-400'
                              }`}
                            >
                              <img
                                src={imgUrl}
                                alt={`Product preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {/* Cover Badge */}
                              {isCover && (
                                <span className="absolute top-1 left-1 bg-emerald-800 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-md flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Cover
                                </span>
                              )}

                              {/* Hover Action Overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                <button
                                  type="button"
                                  onClick={() => setPreviewingImageUrl(imgUrl)}
                                  className="p-1 bg-white text-gray-800 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                                  title="Zoom Preview"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetAsCoverImage(imgUrl)}
                                    className="p-1 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
                                    title="Set as Main Cover Photo"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProductImage(imgUrl)}
                                  className="p-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                                  title="Delete Image from Storage"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Manual Main Image URL Input */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Primary Cover Photo URL
                    </label>
                    <input
                      type="url"
                      value={prodImage}
                      onChange={(e) => {
                        setProdImage(e.target.value);
                        if (!prodImages.includes(e.target.value)) {
                          setProdImages((prev) => [e.target.value, ...prev]);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl font-mono text-[11px]"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodInStock}
                      onChange={(e) => setProdInStock(e.target.checked)}
                      className="rounded text-emerald-800"
                    />
                    <span>In Stock</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsPopular}
                      onChange={(e) => setProdIsPopular(e.target.checked)}
                      className="rounded text-emerald-800"
                    />
                    <span>Popular Tag</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingProd}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-xl shadow-md transition-all cursor-pointer mt-2"
                >
                  {isSubmittingProd ? 'Saving to Supabase...' : 'Save Product'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Order Details / Receipt */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h4 className="font-black text-base text-gray-900">
                  Order Details #{selectedOrderDetails.id}
                </h4>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <p><strong>Customer:</strong> {selectedOrderDetails.customerName} ({selectedOrderDetails.phone})</p>
                <p><strong>Province & District:</strong> {selectedOrderDetails.province} - {selectedOrderDetails.district}</p>
                <p><strong>Municipality:</strong> {selectedOrderDetails.municipality}</p>
                <p><strong>Address:</strong> {selectedOrderDetails.address}</p>
                <p><strong>Payment Method:</strong> {selectedOrderDetails.paymentMethod.toUpperCase()}</p>
                <p><strong>Order Total:</strong> <strong className="text-emerald-900 text-sm">Rs. {selectedOrderDetails.total.toLocaleString('ne-NP')}</strong></p>

                <div className="pt-2 border-t border-gray-200">
                  <span className="font-bold block mb-1">Items ({selectedOrderDetails.items.length}):</span>
                  {selectedOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] py-1 border-b border-gray-100">
                      <span>{item.quantity}x {item.nameEn} ({item.unit})</span>
                      <span className="font-bold">Rs. {(item.price * item.quantity).toLocaleString('ne-NP')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="w-full bg-emerald-800 text-white font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
        {/* Modal for Image Zoom Preview */}
        {previewingImageUrl && (
          <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl p-4 max-w-2xl w-full flex flex-col items-center gap-3 border border-gray-100 shadow-2xl">
              <button
                onClick={() => setPreviewingImageUrl(null)}
                className="absolute top-3 right-3 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full font-bold text-gray-800 text-sm border-b border-gray-100 pb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-800" />
                <span>Supabase Storage - Image Preview</span>
              </div>

              <div className="max-h-[70vh] w-full overflow-hidden rounded-2xl bg-gray-900 flex items-center justify-center">
                <img
                  src={previewingImageUrl}
                  alt="High resolution product preview"
                  className="max-h-[68vh] w-auto object-contain"
                />
              </div>

              <div className="w-full flex items-center justify-between text-xs text-gray-600 pt-1">
                <span className="font-mono text-[10px] truncate max-w-[300px]">{previewingImageUrl}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleSetAsCoverImage(previewingImageUrl);
                      setPreviewingImageUrl(null);
                    }}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Set as Cover Photo
                  </button>
                  <button
                    onClick={() => setPreviewingImageUrl(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
