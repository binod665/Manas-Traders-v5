import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { getTranslation } from '../translations';
import { Award, Sparkles, MapPin } from 'lucide-react';

export function FeaturedProducts() {
  const { language, products } = useApp();

  // Featured items with origins from Mustang, Ilam, Pokhara, Jumla
  const featuredList = products
    .filter((p) => p.originEn || p.rating >= 4.8)
    .slice(0, 4);

  if (featuredList.length === 0) return null;

  return (
    <section className="my-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-3 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            <span>ORIGIN GUARANTEED</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span>{getTranslation(language, 'featuredProductsTitle')}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {getTranslation(language, 'featuredProductsSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {featuredList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
