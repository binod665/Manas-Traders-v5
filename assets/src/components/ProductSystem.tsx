import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { getTranslation } from '../translations';
import {
  Search,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  SearchX,
  ChevronLeft,
  ChevronRight,
  Heart,
  RefreshCw,
  Database,
  Tag,
  CheckCircle2,
  DollarSign,
  X,
} from 'lucide-react';

export const ProductSystem: React.FC = () => {
  const {
    language,
    products,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    wishlist,
    refreshProducts,
    isSupabaseConnected,
  } = useApp();

  // Local state for Price Range filter, Wishlist Filter, and Pagination
  const [pricePreset, setPricePreset] = useState<'all' | 'under300' | '300to1000' | 'above1000' | 'custom'>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Popular search terms in Nepal
  const popularKeywords = [
    { labelEn: 'Basmati Rice', labelNe: 'बासमती चामल', query: 'rice' },
    { labelEn: 'Mustang Daal', labelNe: 'मुस्ताङ दाल', query: 'mustang' },
    { labelEn: 'Pure Ghee', labelNe: 'शुद्ध घिउ', query: 'ghee' },
    { labelEn: 'Ilam Tea', labelNe: 'इलाम चिया', query: 'tea' },
    { labelEn: 'Spices', labelNe: 'मसाला', query: 'spice' },
    { labelEn: 'Jumla Marshi', labelNe: 'जुम्ली मार्सी', query: 'marshi' },
  ];

  // Reset page when category, search, or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, pricePreset, minPrice, maxPrice, showWishlistOnly, sortBy]);

  // Price preset change handler
  const handlePricePresetChange = (preset: 'all' | 'under300' | '300to1000' | 'above1000' | 'custom') => {
    setPricePreset(preset);
    if (preset === 'all') {
      setMinPrice(0);
      setMaxPrice(5000);
    } else if (preset === 'under300') {
      setMinPrice(0);
      setMaxPrice(300);
    } else if (preset === '300to1000') {
      setMinPrice(300);
      setMaxPrice(1000);
    } else if (preset === 'above1000') {
      setMinPrice(1000);
      setMaxPrice(5000);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // 1. Wishlist Filter
        if (showWishlistOnly && !wishlist.includes(product.id)) {
          return false;
        }

        // 2. Category Filter
        if (selectedCategory !== 'all' && product.categorySlug !== selectedCategory) {
          return false;
        }

        // 3. Search Query Filter (Matches English and Nepali titles and descriptions)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchEn = product.nameEn.toLowerCase().includes(q);
          const matchNe = product.nameNe.toLowerCase().includes(q);
          const matchDescEn = product.descriptionEn?.toLowerCase().includes(q) || false;
          const matchDescNe = product.descriptionNe?.toLowerCase().includes(q) || false;
          const matchOriginEn = product.originEn?.toLowerCase().includes(q) || false;
          const matchOriginNe = product.originNe?.toLowerCase().includes(q) || false;

          if (!matchEn && !matchNe && !matchDescEn && !matchDescNe && !matchOriginEn && !matchOriginNe) {
            return false;
          }
        }

        // 4. Price Filter
        if (product.price < minPrice || product.price > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return b.id.localeCompare(a.id);
        // Default Popularity
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, minPrice, maxPrice, showWishlistOnly, wishlist, sortBy]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProducts();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPricePreset('all');
    setMinPrice(0);
    setMaxPrice(5000);
    setShowWishlistOnly(false);
    setSortBy('popular');
  };

  return (
    <section id="products-section" className="my-10 space-y-6">
      {/* Header & Title Area */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>FRESH GROCERY SYSTEM</span>
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isSupabaseConnected
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                }`}
              >
                <Database className="w-3 h-3" />
                <span>{isSupabaseConnected ? 'Supabase SDK Connected' : 'Local Storage Sync'}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              {getTranslation(language, 'popularProducts')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {language === 'ne'
                ? 'मुस्ताङ, इलाम, जुम्ला, र पोखराका ताजा र अर्गानिक खाद्यान्नहरू छान्नुहोस्।'
                : 'Browse organic rice, Mustang pulses, Ilam tea, and authentic Nepalese spices.'}
            </p>
          </div>

          {/* Sync / Refresh Button */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{language === 'ne' ? 'सुपाबेस सिंक गर्नुहोस्' : 'Sync Products'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Popular Keywords */}
        <div className="mt-4 pt-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getTranslation(language, 'searchPlaceholder')}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Wishlist Toggle Button */}
            <button
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                showWishlistOnly
                  ? 'bg-red-500 text-white border-red-500 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-gray-750'
              }`}
            >
              <Heart className={`w-4 h-4 ${showWishlistOnly ? 'fill-current' : 'text-red-500'}`} />
              <span>
                {language === 'ne' ? 'मन परेका मात्र (' : 'Wishlist Only ('}
                {wishlist.length})
              </span>
            </button>
          </div>

          {/* Quick Search Chips */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-gray-400 dark:text-gray-500 font-semibold shrink-0 flex items-center gap-1 text-[11px]">
              <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Popular:
            </span>
            {popularKeywords.map((item) => (
              <button
                key={item.query}
                onClick={() => setSearchQuery(item.query)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 border transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === item.query
                    ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-700'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                }`}
              >
                {language === 'ne' ? item.labelNe : item.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls Bar: Category, Price Range, Sorting */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Price Range Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{getTranslation(language, 'price')}:</span>
            </span>

            <button
              onClick={() => handlePricePresetChange('all')}
              className={`text-xs px-3 py-1 rounded-xl font-semibold border transition-all ${
                pricePreset === 'all'
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-700'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              All Prices
            </button>

            <button
              onClick={() => handlePricePresetChange('under300')}
              className={`text-xs px-3 py-1 rounded-xl font-semibold border transition-all ${
                pricePreset === 'under300'
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-700'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              &lt; Rs. 300
            </button>

            <button
              onClick={() => handlePricePresetChange('300to1000')}
              className={`text-xs px-3 py-1 rounded-xl font-semibold border transition-all ${
                pricePreset === '300to1000'
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-700'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              Rs. 300 - Rs. 1,000
            </button>

            <button
              onClick={() => handlePricePresetChange('above1000')}
              className={`text-xs px-3 py-1 rounded-xl font-semibold border transition-all ${
                pricePreset === 'above1000'
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-700'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              &gt; Rs. 1,000
            </button>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {getTranslation(language, 'sortBy')}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 dark:text-gray-200 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer"
            >
              <option value="popular">{getTranslation(language, 'sortPopular')}</option>
              <option value="price-low">{getTranslation(language, 'sortPriceLowHigh')}</option>
              <option value="price-high">{getTranslation(language, 'sortPriceHighLow')}</option>
              <option value="rating">{getTranslation(language, 'sortRating')}</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary Badge */}
        {(selectedCategory !== 'all' || searchQuery || pricePreset !== 'all' || showWishlistOnly) && (
          <div className="mt-3 pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400 dark:text-gray-500 font-medium">Active filters:</span>
            {selectedCategory !== 'all' && (
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-medium flex items-center gap-1">
                Category: {selectedCategory}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-emerald-950 dark:hover:text-emerald-100"
                  onClick={() => setSelectedCategory('all')}
                />
              </span>
            )}
            {searchQuery && (
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-medium flex items-center gap-1">
                Query: "{searchQuery}"
                <X
                  className="w-3 h-3 cursor-pointer hover:text-emerald-950 dark:hover:text-emerald-100"
                  onClick={() => setSearchQuery('')}
                />
              </span>
            )}
            {pricePreset !== 'all' && (
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-medium flex items-center gap-1">
                Price: Rs.{minPrice} - Rs.{maxPrice}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-emerald-950 dark:hover:text-emerald-100"
                  onClick={() => handlePricePresetChange('all')}
                />
              </span>
            )}
            {showWishlistOnly && (
              <span className="bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 px-2.5 py-0.5 rounded-lg border border-red-200 dark:border-red-800 font-medium flex items-center gap-1">
                Wishlist Items Only
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-950 dark:hover:text-red-100"
                  onClick={() => setShowWishlistOnly(false)}
                />
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline ml-auto"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Product Grid or Empty State */}
      {paginatedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xs">
          <SearchX className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
            {getTranslation(language, 'noProductsFound')}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
            {showWishlistOnly
              ? 'Your wishlist is empty. Click the heart icon on any product to save it here.'
              : 'Try relaxing your price filters or searching for terms like "Rice", "Daal", "Ghee", or "Tea".'}
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 bg-emerald-800 dark:bg-emerald-700 hover:bg-emerald-900 dark:hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Item Count Display */}
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Showing <span className="font-bold text-gray-900 dark:text-gray-100">{startIndex + 1}</span> to{' '}
            <span className="font-bold text-gray-900 dark:text-gray-100">{endIndex}</span> of{' '}
            <span className="font-bold text-emerald-800 dark:text-emerald-400">{totalItems}</span> grocery items
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs scale-105'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Items Per Page Selector */}
            <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span>Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
