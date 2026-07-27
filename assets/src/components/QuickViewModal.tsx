import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { X, Star, ShoppingBag, Heart, MapPin, Check, Plus, Minus, ShieldCheck, Truck } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const {
    language,
    activeModal,
    setActiveModal,
    selectedProductForView,
    addToCart,
    wishlist,
    toggleWishlist,
  } = useApp();

  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);

  if (activeModal !== 'quickView' || !selectedProductForView) return null;

  const product = selectedProductForView;
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const activeImage = productImages[activeImgIndex] || product.image;
  const title = language === 'ne' ? product.nameNe : product.nameEn;
  const description = language === 'ne' ? product.descriptionNe : product.descriptionEn;
  const origin = language === 'ne' ? product.originNe : product.originEn;
  const isWishlisted = wishlist.includes(product.id);
  const currentUnit = selectedUnit || product.unit;

  const handleClose = () => {
    setActiveModal(null);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, currentUnit);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 p-2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Gallery & Thumbnails */}
        <div className="md:w-1/2 relative bg-gray-50 flex flex-col justify-between p-2 min-h-[280px]">
          <div className="relative flex-1 w-full overflow-hidden rounded-2xl bg-white shadow-2xs">
            <img
              src={activeImage}
              alt={title}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {origin && (
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{origin}</span>
              </div>
            )}
          </div>

          {/* Multiple Images Thumbnail Strip */}
          {productImages.length > 1 && (
            <div className="flex items-center gap-2 pt-2 px-1 overflow-x-auto">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                    idx === activeImgIndex ? 'border-emerald-600 ring-2 ring-emerald-200 scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between space-y-4">
          <div>
            {/* Rating & Stock */}
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating}</span>
                <span className="text-gray-400 font-normal">({product.reviewsCount} reviews)</span>
              </div>
              <span
                className={`font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-full ${
                  product.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {product.inStock ? getTranslation(language, 'inStock') : getTranslation(language, 'outOfStock')}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 leading-snug mb-2">{title}</h2>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-black text-emerald-800">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed mb-4">{description}</p>

            {/* Available Units Selection */}
            {product.availableUnits && product.availableUnits.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Select Unit Size:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.availableUnits.map((u) => (
                    <button
                      key={u}
                      onClick={() => setSelectedUnit(u)}
                      className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-all ${
                        currentUnit === u
                          ? 'bg-emerald-900 text-white border-emerald-900'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 text-gray-600 hover:bg-gray-200 rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 font-bold text-sm text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1 text-gray-600 hover:bg-gray-200 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{getTranslation(language, 'addToCart')}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Quality Guaranteed
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Fast Valley Shipping
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
