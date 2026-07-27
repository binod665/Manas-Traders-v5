import React from 'react';
import { Category } from '../types';
import { useApp } from '../context/AppContext';
import { Wheat, Sparkles, CircleDot, Droplet, Coffee, Milk, Cookie, Home } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onClick: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Wheat: <Wheat className="w-5 h-5 text-emerald-600" />,
  Sparkles: <Sparkles className="w-5 h-5 text-amber-500" />,
  CircleDot: <CircleDot className="w-5 h-5 text-orange-600" />,
  Droplet: <Droplet className="w-5 h-5 text-yellow-500" />,
  Coffee: <Coffee className="w-5 h-5 text-emerald-700" />,
  Milk: <Milk className="w-5 h-5 text-blue-500" />,
  Cookie: <Cookie className="w-5 h-5 text-amber-600" />,
  Home: <Home className="w-5 h-5 text-teal-600" />,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, isSelected, onClick }) => {
  const { language } = useApp();
  const name = language === 'ne' ? category.nameNe : category.nameEn;

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 text-center ${
        isSelected
          ? 'bg-emerald-900 text-white border-emerald-900 shadow-md scale-105'
          : 'bg-white hover:bg-emerald-50/50 text-gray-800 border-gray-100 hover:border-emerald-300 shadow-xs'
      }`}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden mb-2 relative shadow-xs">
        <img
          src={category.image}
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
      </div>

      <h4 className="font-semibold text-xs leading-tight line-clamp-1 mb-0.5">
        {name}
      </h4>

      <span
        className={`text-[10px] font-medium ${
          isSelected ? 'text-emerald-200' : 'text-gray-400'
        }`}
      >
        {category.itemCount} Items
      </span>
    </button>
  );
};
