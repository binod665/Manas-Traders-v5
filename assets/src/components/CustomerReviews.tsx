import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { Star, Quote, CheckCircle2, MapPin } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  location: string;
  avatar: string;
  productPurchased: string;
  rating: number;
  reviewEn: string;
  reviewNe: string;
  date: string;
}

const reviewsData: Review[] = [
  {
    id: 'rev-1',
    name: 'Rabindra Sharma',
    location: 'Baneshwor, Kathmandu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    productPurchased: 'Mustang Organic Black Lentils (5kg)',
    rating: 5,
    reviewEn: 'The Mustang Daal quality is unmatched! Cooked so fast and tastes exactly like authentic mountain lentils. Fast delivery in Kathmandu within 18 hours.',
    reviewNe: 'मुस्ताङको कालो दालको स्वाद असाध्यै मीठो लाग्यो। काठमाडौँ बानेश्वरमा १८ घण्टामै डेलिभरी भयो। सामान सोचेभन्दा पनि राम्रो र ताजा छ।',
    date: '2 days ago',
  },
  {
    id: 'rev-2',
    name: 'Saraswati Adhikari',
    location: 'Lakeside, Pokhara',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    productPurchased: 'Pokhreli Jethobudho Rice (25kg)',
    rating: 5,
    reviewEn: 'We ordered 2 bags of Pokhreli Jethobudho Basmati for our restaurant. Very clean grains, superb aroma, and reasonable wholesale rates.',
    reviewNe: 'हाम्रो रेस्टुरेन्टका लागि जेठोबुढो चामल अर्डर गरेका थियौँ। बास्नादार र सफा दाना। थोक मूल्य पनि निकै उपयुक्त छ।',
    date: '1 week ago',
  },
  {
    id: 'rev-3',
    name: 'Bikash Shrestha',
    location: 'Kumaripati, Lalitpur',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    productPurchased: 'Pure Himalayan Cow Ghee (1 Liter)',
    rating: 5,
    reviewEn: '100% pure cow ghee with rich golden aroma. Paid via eSewa instantly. Manas Traders is our family default grocery supplier now.',
    reviewNe: 'घिउ एकदमै शुद्ध र दानेदार छ। इ-सेवाबाट सजिलै क्युआर भुक्तानी गर्न पाइयो। अब हाम्रो घरको किराना सामान मनास ट्रेडर्सबाटै किन्छौँ।',
    date: '3 days ago',
  },
  {
    id: 'rev-4',
    name: 'Anjali Gurung',
    location: 'Narayangadh, Chitwan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    productPurchased: 'Ilam Orthodox Green Tea (500g)',
    rating: 5,
    reviewEn: 'Extremely fresh Ilam tea leaves. Packed securely and delivered safely to Chitwan. Highly recommend to everyone looking for organic tea.',
    reviewNe: 'इलामको ताजा अर्थोडक्स चिया। प्याकिङ एकदम सुरक्षित र चितवनसम्म समयमै आइपुग्यो। अर्गानिक चिया खोज्नेका लागि उत्तम।',
    date: '5 days ago',
  },
];

export function CustomerReviews() {
  const { language } = useApp();

  return (
    <section className="my-12 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-100">
        <div>
          <span className="text-emerald-800 text-xs font-black uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            TESTIMONIALS
          </span>
          <h3 className="text-2xl font-black text-gray-900 mt-2">
            {getTranslation(language, 'customerReviewsTitle')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {getTranslation(language, 'customerReviewsSubtitle')}
          </p>
        </div>

        {/* Aggregate Score Pill */}
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-100 self-start md:self-auto">
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div className="text-xs">
            <span className="font-extrabold text-emerald-950">4.9 / 5.0</span>
            <span className="text-gray-500 ml-1">(1,240+ verified reviews)</span>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {reviewsData.map((rev) => (
          <div
            key={rev.id}
            className="flex flex-col justify-between p-5 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group"
          >
            <div>
              {/* Quote Icon & Stars */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-emerald-300 opacity-60 group-hover:text-emerald-500 transition-colors" />
              </div>

              {/* Review Comment */}
              <p className="text-xs text-gray-700 leading-relaxed italic line-clamp-4">
                "{language === 'ne' ? rev.reviewNe : rev.reviewEn}"
              </p>

              {/* Product Purchased Tag */}
              <div className="mt-3 inline-block bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-[10px] font-semibold text-emerald-800">
                📦 {rev.productPurchased}
              </div>
            </div>

            {/* Reviewer Details */}
            <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center gap-3">
              <img
                src={rev.avatar}
                alt={rev.name}
                loading="lazy"
                decoding="async"
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h5 className="text-xs font-bold text-gray-900 truncate">{rev.name}</h5>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
                  <MapPin className="w-2.5 h-2.5 text-emerald-700" />
                  <span>{rev.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
