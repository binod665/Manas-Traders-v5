import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { Star, ShoppingBag, Eye, Heart, MapPin, Check, Plus, Minus, Image as ImageIcon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, addToCart, wishlist, toggleWishlist, setSelectedProductForView, setActiveModal } = useApp();
  const [selectedUnit, setSelectedUnit] = useState<string>(product.unit);
  const [quantity, setQuantity] = useState<number>(1);

  const title = language === 'ne' ? product.nameNe : product.nameEn;
  const origin = language === 'ne' ? product.originNe : product.originEn;
  const isWishlisted = wishlist.includes(product.id);

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProductForView(product);
    setActiveModal('quickView');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, quantity, selectedUnit);
  };

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100/80 dark:border-gray-800 shadow-xs hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Badges & Actions Overlay */}
      <div className="relative aspect-4/3 w-full bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <img
          src={product.image}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount / Flash Tag */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.discountBadge && (
            <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
              {product.discountBadge}
            </span>
          )}
          {product.isPopular && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
              🔥 Best Seller
            </span>
          )}
          {product.images && product.images.length > 1 && (
            <span className="bg-emerald-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>{product.images.length} Photos</span>
            </span>
          )}
        </div>

        {/* Quick View & Wishlist Buttons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md shadow-md transition-all ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-200 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800'
            }`}
            title="Add to wishlist"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={handleQuickView}
            className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400 backdrop-blur-md shadow-md transition-all"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Origin Pill */}
        {origin && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span className="truncate max-w-[150px]">{origin}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Stock */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating}</span>
              <span className="text-gray-400 dark:text-gray-500 font-normal">({product.reviewsCount})</span>
            </div>

            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                product.inStock ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-500'
              }`}
            >
              {product.inStock
                ? getTranslation(language, 'inStock')
                : getTranslation(language, 'outOfStock')}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={handleQuickView}
            className="font-bold text-gray-900 dark:text-gray-100 text-base leading-snug line-clamp-2 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer transition-colors mb-2"
          >
            {title}
          </h3>

          {/* Unit Selector if multiple available */}
          {product.availableUnits && product.availableUnits.length > 1 && (
            <div className="mb-3">
              <label className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 block mb-1">
                {getTranslation(language, 'unit')}
              </label>
              <div className="flex flex-wrap gap-1">
                {product.availableUnits.map((u) => (
                  <button
                    key={u}
                    onClick={() => setSelectedUnit(u)}
                    className={`text-xs px-2 py-0.5 rounded-md border font-medium transition-all ${
                      selectedUnit === u
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <div>
              <span className="text-xl font-black text-emerald-800 dark:text-emerald-400">
                Rs. {product.price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/ {selectedUnit}</span>
            </div>

            {product.originalPrice && (
              <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quantity Controls & Add to Cart Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-bold text-gray-800 dark:text-gray-200 w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 text-white py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{getTranslation(language, 'addToCart')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
