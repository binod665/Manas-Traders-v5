import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { ChevronLeft, ChevronRight, ShoppingBag, ShieldCheck, Truck, Sparkles, MapPin } from 'lucide-react';

interface Slide {
  id: string;
  titleEn: string;
  titleNe: string;
  subtitleEn: string;
  subtitleNe: string;
  badgeEn: string;
  badgeNe: string;
  originEn: string;
  originNe: string;
  image: string;
  discountText: string;
  categorySlug: string;
  bgGradient: string;
}

const slides: Slide[] = [
  {
    id: 'slide-1',
    titleEn: '100% Organic Mustang Black Lentils & Beans',
    titleNe: '१००% अर्गानिक मुस्ताङको कालो दाल र सिमी',
    subtitleEn: 'Sourced directly from high-altitude Himalayan farmers of Mustang Valley. Rich in protein & mountain flavor.',
    subtitleNe: 'मुस्ताङको हिमाली भेगका किसानहरूबाट सोझै संकलित। प्रोटिन र मौलिक स्वादले भरिपूर्ण।',
    badgeEn: 'Fresh Himalayan Harvest',
    badgeNe: 'ताजा हिमाली खाद्यान्न',
    originEn: 'Mustang, Nepal',
    originNe: 'मुस्ताङ, नेपाल',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=1200',
    discountText: '15% OFF THIS WEEK',
    categorySlug: 'pulses',
    bgGradient: 'from-emerald-900 via-teal-900 to-emerald-950',
  },
  {
    id: 'slide-2',
    titleEn: 'Organic Ilam High-Grown Orthodox Tea',
    titleNe: 'इलामको अर्गानिक हाइ-ग्रोन अर्थोडक्स चिया',
    subtitleEn: 'Hand-picked tea leaves from rolling green hills of Ilam. Pure aroma, rich antioxidants, 100% export quality.',
    subtitleNe: 'इलामका हरिया डाँडाहरूबाट हातले टिपिएका चियापत्ती। शुद्ध सुगन्ध र उच्च गुणस्तर।',
    badgeEn: 'Export Quality Tea',
    badgeNe: 'निर्यात योग्य चिया',
    originEn: 'Ilam, Nepal',
    originNe: 'इलाम, नेपाल',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=1200',
    discountText: 'BUY 2 GET 10% EXTRA',
    categorySlug: 'tea-beverages',
    bgGradient: 'from-green-900 via-emerald-900 to-slate-900',
  },
  {
    id: 'slide-3',
    titleEn: 'Aromatic Pokhreli Jethobudho Basmati Rice',
    titleNe: 'बास्नादार पोखरेली जेठोबुढो र बासमती चामल',
    subtitleEn: 'Authentic aromatic rice cultivated in pure Himalayan spring water. Perfect for festive feasts & daily dining.',
    subtitleNe: 'पोखराको हिउँदे पानीमा फलेको बास्नादार जेठोबुढो चामल। चाडपर्व र दैनिक खानाको लागि उत्कृष्ट।',
    badgeEn: 'Pure Organic Grains',
    badgeNe: 'शुद्ध अर्गानिक चामल',
    originEn: 'Pokhara, Nepal',
    originNe: 'पोखरा, नेपाल',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=1200',
    discountText: 'SPECIAL WHOLESALE RATE',
    categorySlug: 'rice-grains',
    bgGradient: 'from-amber-950 via-emerald-950 to-slate-900',
  },
  {
    id: 'slide-4',
    titleEn: 'Pure Mountain Dairy Cow & Yak Ghee',
    titleNe: 'शुद्ध पहाडी गाई तथा चौंरीको घिउ',
    subtitleEn: 'Traditional churned ghee with rich golden aroma. Natural nutrition guaranteed with zero preservatives.',
    subtitleNe: 'परम्परागत ढिँडो र ठेकीमा पारिएको दानेदार शुद्ध घिउ। कुनै मिसावट नभएको ग्यारेन्टी।',
    badgeEn: '100% Pure Dairy',
    badgeNe: '१००% शुद्ध घिउ',
    originEn: 'Solukhumbu / Dairy Co-op',
    originNe: 'सोलुखुम्बु / डेरी संस्थान',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=1200',
    discountText: 'FREE DELIVERY OVER Rs. 2,000',
    categorySlug: 'ghee-oil',
    bgGradient: 'from-amber-900 via-orange-950 to-amber-950',
  },
];

export function HeroSlider() {
  const { language, setSelectedCategory } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  const handleShopCategory = (slug: string) => {
    setSelectedCategory(slug);
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative my-6 rounded-3xl overflow-hidden shadow-2xl bg-gray-950 text-white">
      {/* Background Image Container with Gradient Overlay */}
      <div className="relative h-[420px] sm:h-[460px] md:h-[500px] w-full transition-all duration-700 ease-in-out">
        <img
          src={slide.image}
          alt={language === 'ne' ? slide.titleNe : slide.titleEn}
          decoding="async"
          loading={currentSlide === 0 ? "eager" : "lazy"}
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay transition-all duration-1000 scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-90`} />

        {/* Content Container */}
        <div className="relative z-10 h-full max-w-5xl mx-auto px-6 sm:px-12 flex flex-col justify-center">
          <div className="space-y-4 max-w-2xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black tracking-wide shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'ne' ? slide.badgeNe : slide.badgeEn}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
                <MapPin className="w-3 h-3 text-emerald-300" />
                {language === 'ne' ? slide.originNe : slide.originEn}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold uppercase">
                {slide.discountText}
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {language === 'ne' ? slide.titleNe : slide.titleEn}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-gray-200 line-clamp-2 font-normal leading-relaxed max-w-xl">
              {language === 'ne' ? slide.subtitleNe : slide.subtitleEn}
            </p>

            {/* CTAs & Value Props */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleShopCategory(slide.categorySlug)}
                className="group inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{getTranslation(language, 'shopNow')}</span>
              </button>

              <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-emerald-200/90 pl-2 border-l border-white/15">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Farmer Direct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Doorstep Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all rounded-full cursor-pointer ${
              currentSlide === index
                ? 'w-6 h-2 bg-emerald-400 shadow-sm'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
