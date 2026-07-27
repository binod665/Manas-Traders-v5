import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { CategoryCard } from './components/CategoryCard';
import { DealsSection } from './components/DealsSection';
import { FeaturedProducts } from './components/FeaturedProducts';
import { ProductSystem } from './components/ProductSystem';
import { PromotionalBanners } from './components/PromotionalBanners';
import { CustomerReviews } from './components/CustomerReviews';
import { Newsletter } from './components/Newsletter';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { CheckoutModal } from './components/CheckoutModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { GitHubPagesGuideModal } from './components/GitHubPagesGuideModal';
import { AdminModal } from './components/AdminModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { getTranslation } from './translations';

import { AuthProvider } from './context/AuthContext';

function StoreMain() {
  const {
    language,
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
  } = useApp();

  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950 font-sans text-gray-800 dark:text-gray-100 transition-colors flex flex-col justify-between">
      <div>
        {/* Section 1 & 2 & 3: Top Bar, Sticky Header, Search */}
        <Header onOpenCart={() => setIsCartOpen(true)} />

        <main className="max-w-7xl mx-auto px-4">
          {/* Section 4: Hero Slider */}
          <HeroSlider />

          {/* Section 5: Categories */}
          <section className="my-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>{getTranslation(language, 'exploreCategories')}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select a category to filter fresh organic groceries
                </p>
              </div>

              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800"
                >
                  Clear Filter ({selectedCategory})
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {/* All Category Button */}
              <button
                onClick={() => setSelectedCategory('all')}
                className={`group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-900 dark:bg-emerald-700 text-white border-emerald-900 shadow-md scale-105'
                    : 'bg-white dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-800 shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-1.5 font-bold text-lg">
                  🛍️
                </div>
                <span className="font-semibold text-xs leading-tight">
                  {getTranslation(language, 'allCategories')}
                </span>
                <span className="text-[10px] text-emerald-200 dark:text-emerald-400 opacity-80 mt-0.5">
                  {products.length} Items
                </span>
              </button>

              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  isSelected={selectedCategory === cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                />
              ))}
            </div>
          </section>

          {/* Section 6: Today's Deals */}
          <DealsSection />

          {/* Section 7: Featured Products */}
          <FeaturedProducts />

          {/* Section 8: Main Product System (Supabase SDK integrated, Search, Categories, Price Filter, Sorting, Pagination, Wishlist, Add to Cart) */}
          <ProductSystem />

          {/* Section 9: Offers & Promotional Banners */}
          <PromotionalBanners />

          {/* Section 10: Customer Reviews */}
          <CustomerReviews />

          {/* Section 11: Newsletter */}
          <Newsletter />
        </main>
      </div>

      {/* Section 12: Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <QuickViewModal />
      <CheckoutModal />
      <SupabaseConfigModal />
      <GitHubPagesGuideModal />
      <AdminModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <StoreMain />
      </AuthProvider>
    </AppProvider>
  );
}
