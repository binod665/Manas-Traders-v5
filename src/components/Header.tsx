import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { nepalDistricts } from '../data/products';
import {
  ShoppingBag,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  User,
  X,
  PhoneCall,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    selectedDistrict,
    setSelectedDistrict,
    searchQuery,
    setSearchQuery,
    cart,
    wishlist,
    setActiveModal,
    user,
  } = useApp();

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-xs transition-colors">
      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
                <span className="font-bold text-xl font-serif">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  {getTranslation(language, 'brandName')}
                </h1>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400 -mt-0.5">
                  Fresh Groceries • Nepal
                </p>
              </div>
            </a>

          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Controls: Location, Language, Theme, Admin, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* District Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100/80 dark:hover:bg-gray-750 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <select
                value={selectedDistrict.id}
                onChange={(e) => {
                  const d = nepalDistricts.find((item) => item.id === e.target.value);
                  if (d) setSelectedDistrict(d);
                }}
                className="bg-transparent focus:outline-none cursor-pointer text-gray-800 dark:text-gray-200 dark:bg-gray-800 pr-1 font-medium"
              >
                {nepalDistricts.map((d) => (
                  <option key={d.id} value={d.id} className="dark:bg-gray-800 dark:text-gray-100">
                    {language === 'ne' ? d.nameNe : d.nameEn} (Rs.{d.deliveryFee})
                  </option>
                ))}
              </select>
            </div>



            {/* Language Switcher Button */}
            <button
              onClick={() => setLanguage(language === 'ne' ? 'en' : 'ne')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold transition-all cursor-pointer"
              title={language === 'ne' ? 'Switch to English' : 'नेपाली भाषा छान्नुहोस्'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'ne' ? 'नेपाली' : 'English'}</span>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-gray-700 text-gray-700 dark:text-amber-400 rounded-xl border border-gray-200 dark:border-gray-700 transition-all cursor-pointer flex items-center justify-center group"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-700 group-hover:-rotate-12 transition-transform" />
              )}
            </button>
            <button
              onClick={() => setActiveModal('contact')}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
              title="Contact Manas Traders Tikapur"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">
                {getTranslation(language, 'contactUs')}
              </span>
            </button>

            {/* User Account / Auth Modal Trigger */}
            <button
              onClick={() => setActiveModal('auth')}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-emerald-800 dark:hover:text-emerald-400 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
              title={user ? `Logged in as ${user.fullName} (Customer Dashboard)` : 'Sign In / Register'}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-5 h-5 rounded-full object-cover border border-emerald-600" />
              ) : (
                <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              )}
              <span className="hidden md:inline max-w-[100px] truncate">
                {user ? user.fullName.split(' ')[0] : 'Sign In'}
              </span>
            </button>

            {/* Admin Modal Trigger */}
            <button
              onClick={() => setActiveModal('admin')}
              className="hidden sm:flex items-center gap-1.5 p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              title={getTranslation(language, 'adminPanel')}
            >
              <ShieldCheck className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => {
                if (wishlist.length === 0) {
                  alert(language === 'ne' ? 'तपाईंको विसलिस्ट खाली छ।' : 'Wishlist is empty.');
                }
              }}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
              title={getTranslation(language, 'wishlist')}
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all font-medium text-xs sm:text-sm"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartTotalItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-amber-400 text-emerald-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {cartTotalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-semibold">
                {getTranslation(language, 'cart')}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getTranslation(language, 'searchPlaceholder')}
              className="w-full pl-10 pr-10 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
