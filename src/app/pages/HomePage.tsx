import { useNavigate } from 'react-router';
// @ts-ignore
import heroBg from '../../assets/UEH_50Y.PNG';
import { ArrowRight, Sprout, ChefHat, Plug, Sparkles, GraduationCap, Star, ShieldCheck, Users, Lock, Inbox } from 'lucide-react';
import { categories } from '../data/catalog';
import type { Product } from '../data/types';
import { ProductCard } from '../components/ProductCard';
import { db } from '../firebaseClient';
import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { formatTimestampToYYYYMMDD, getInitials, mapFirestoreCategoryToUiCategoryId } from '../lib/uehMarketplaceFirebase';
import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageProvider';
import { translations } from '../i18n/i18n';

const iconMap: Record<string, React.ReactNode> = {
  Sprout: <Sprout size={28} />,
  ChefHat: <ChefHat size={28} />,
  Plug: <Plug size={28} />,
  Sparkles: <Sparkles size={28} />,
  GraduationCap: <GraduationCap size={28} />,
};

export default function HomePage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = translations[lang].home;
  const tCat = translations[lang].categories;

  const [loadingRecent, setLoadingRecent] = useState(true);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    setLoadingRecent(true);

    const productsQ = query(
      collection(db, 'products'),
      where('status', '==', 'approved'),
      // Sort by newest first. To sort by highest rating instead, replace with: orderBy('rating', 'desc')
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsub = onSnapshot(
      productsQ,
      async (snap) => {
        const base = snap.docs.map((d) => {
          const data = d.data() as any;
          const uiCategoryId = mapFirestoreCategoryToUiCategoryId(data.category ?? '');
          return {
            id: d.id,
            categoryId: uiCategoryId ?? '',
            name: data.title ?? '',
            price: data.price ?? 0,
            image: data.images?.[0] ?? '',
            seller: data.sellerName ?? '',
            sellerId: data.sellerId ?? '',
            sellerAvatar: getInitials(data.sellerName ?? ''),
            rating: 0,
            reviewCount: undefined,
            description: data.description ?? '',
            phone: data.sellerPhone ?? '',
            zalo: data.sellerZalo ?? '',
            email: data.sellerEmail ?? '',
            condition: data.condition ?? '',
            postedDate: formatTimestampToYYYYMMDD(data.createdAt),
          } as Product & { sellerId: string };
        });

        const uniqueSellerIds = Array.from(new Set(base.map((p) => p.sellerId).filter(Boolean)));
        const ratingBySellerId = new Map<string, { avg: number; count: number }>();

        await Promise.all(
          uniqueSellerIds.map(async (sellerId) => {
            const ratingsQ = query(
              collection(db, 'ratings'),
              where('sellerId', '==', sellerId),
              where('status', '==', 'approved')
            );
            const ratingsSnap = await getDocs(ratingsQ);
            const reviewCount = ratingsSnap.size;
            const sum = ratingsSnap.docs.reduce((acc, r) => {
              const score = (r.data() as any).score ?? 0;
              return acc + (typeof score === 'number' ? score : 0);
            }, 0);
            const avg = reviewCount > 0 ? sum / reviewCount : 0;
            ratingBySellerId.set(sellerId, { avg, count: reviewCount });
          })
        );

        const finalProducts: Product[] = base.map((p) => {
          const r = ratingBySellerId.get(p.sellerId);
          return { ...p, rating: r?.avg ?? 0, reviewCount: r?.count ?? undefined };
        });

        setRecentProducts(finalProducts);
        setLoadingRecent(false);
      },
      (error) => {
        // If this fires, it often means a missing Firestore Composite Index.
        // The error message will contain a direct link to create it in the Firebase Console.
        console.error('[HomePage] onSnapshot error (check for missing Firestore composite index):', error);
        setRecentProducts([]);
        setLoadingRecent(false);
      }
    );

    return () => unsub();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div
        className="relative overflow-hidden min-h-[350px] md:min-h-[520px] flex items-center bg-contain bg-center bg-no-repeat bg-[#e6e2d6]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Subtle overlay for stats strip readability */}
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
        </div>

        {/* Stats strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-3 sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: <Users size={18} className="text-amber-300" />, value: '40,000+', label: t.statStudents },
              { icon: <ShieldCheck size={18} className="text-amber-300" />, value: '100%', label: t.statVerified },
              { icon: <Star size={18} className="text-amber-300" />, value: '4.8★', label: t.statRating },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                {stat.icon}
                <div className="text-white font-bold text-base sm:text-lg">{stat.value}</div>
                <div className="text-blue-200 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="mb-2" style={{ color: '#1B3A6B', fontSize: '1.75rem', fontWeight: 700 }}>
            {t.categoriesTitle}
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {t.categoriesDesc}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/category/${category.id}`)}
              className="group flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              {/* Image preview */}
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-1 relative">
                <img
                  src={category.image}
                  alt={tCat[category.id]?.name ?? category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div
                  className="absolute inset-0 flex items-end p-3"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    {iconMap[category.icon]}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm font-bold text-gray-800 mb-0.5">{tCat[category.id]?.name ?? category.name}</div>
                <div className="text-xs text-gray-400 leading-snug">{tCat[category.id]?.description ?? category.description}</div>
              </div>

              <div
                className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: category.color }}
              >
                {t.shopNow} <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 style={{ color: '#1B3A6B', fontSize: '1.4rem', fontWeight: 700 }} className="mb-1">
              {t.recentTitle}
            </h2>
            <p className="text-gray-400 text-sm">{t.recentDesc}</p>
          </div>
          <button
            onClick={() => navigate('/category/agriculture')}
            className="flex items-center gap-1.5 text-sm font-medium hover:underline"
            style={{ color: '#1B3A6B' }}
          >
            {t.viewAll} <ArrowRight size={14} />
          </button>
        </div>

        {loadingRecent ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-sm">{t.loadingListings}</div>
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="text-center py-16">
            <Inbox size={44} className="text-gray-400 mb-3" />
            <h3 className="text-gray-800 mb-2" style={{ fontWeight: 600 }}>{t.noListingsTitle}</h3>
            <p className="text-gray-400 text-sm">{t.noListingsDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Trust Banner */}
      <div className="mx-4 sm:mx-6 mb-12 rounded-2xl overflow-hidden" style={{ backgroundColor: '#1B3A6B' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-white mb-2" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {t.trustTitle}
            </h2>
            <p className="text-blue-200 text-sm max-w-md">
              {t.trustDesc}
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            {[
              { icon: <Lock size={24} className="text-amber-200" />, label: t.trustVerified },
              { icon: <ShieldCheck size={24} className="text-emerald-200" />, label: t.trustApproved },
              { icon: <Star size={24} className="text-amber-200" />, label: t.trustRatings },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5 bg-white/10 backdrop-blur rounded-xl px-5 py-4 border border-white/20">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-blue-100 text-xs text-center whitespace-pre-line">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
