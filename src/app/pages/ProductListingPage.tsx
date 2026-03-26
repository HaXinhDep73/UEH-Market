import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Sprout, ChefHat, Plug, Sparkles, GraduationCap, SlidersHorizontal, Inbox } from 'lucide-react';
import { categories } from '../data/catalog';
import type { Product } from '../data/types';
import { ProductCard } from '../components/ProductCard';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../firebaseClient';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { formatTimestampToYYYYMMDD, getInitials, mapUiCategoryIdToFirestoreCategory } from '../lib/uehMarketplaceFirebase';

const iconMap: Record<string, React.ReactNode> = {
  Sprout: <Sprout size={22} />,
  ChefHat: <ChefHat size={22} />,
  Plug: <Plug size={22} />,
  Sparkles: <Sparkles size={22} />,
  GraduationCap: <GraduationCap size={22} />,
};

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating';

export default function ProductListingPage() {
  const { id: routeCategoryId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState(routeCategoryId ?? '');
  const [listingProducts, setListingProducts] = useState<
    (Product & { createdAtMs: number; sellerId: string })[]
  >([]);

  useEffect(() => {
    setActiveCategoryId(routeCategoryId ?? '');
  }, [routeCategoryId]);

  const category = categories.find((c) => c.id === activeCategoryId);
  const sortedProducts = useMemo(() => {
    const arr = [...listingProducts];
    arr.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      return b.createdAtMs - a.createdAtMs;
    });
    return arr;
  }, [listingProducts, sort]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!category || !activeCategoryId) return;
      setLoading(true);
      const firestoreCategory = mapUiCategoryIdToFirestoreCategory(category.id);
      if (!firestoreCategory) {
        setListingProducts([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'products'),
          where('status', '==', 'approved'),
          where('category', '==', firestoreCategory)
        );
        const snap = await getDocs(q);

        const base = snap.docs.map((d) => {
          const data = d.data() as any;
          const createdAt = data.createdAt;
          const createdAtMs = createdAt?.toMillis
            ? createdAt.toMillis()
            : createdAt?.toDate
              ? createdAt.toDate().getTime()
              : createdAt instanceof Date
                ? createdAt.getTime()
                : 0;
          return {
            id: d.id,
            categoryId: category.id,
            name: data.title ?? '',
            price: data.price ?? 0,
            image: data.images?.[0] ?? '',
            seller: data.sellerName ?? '',
            sellerAvatar: getInitials(data.sellerName ?? ''),
            rating: 0,
            reviewCount: undefined,
            description: data.description ?? '',
            phone: data.sellerPhone ?? '',
            zalo: data.sellerZalo ?? '',
            email: data.sellerEmail ?? '',
            condition: data.condition ?? '',
            postedDate: formatTimestampToYYYYMMDD(createdAt),
            createdAtMs,
            sellerId: data.sellerId ?? '',
          };
        });

        const sellerIds = Array.from(new Set(base.map((p) => p.sellerId).filter(Boolean)));
        const ratingBySellerId = new Map<string, { avg: number; count: number }>();

        await Promise.all(
          sellerIds.map(async (sellerId) => {
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

        const withRatings = base.map((p) => {
          const r = ratingBySellerId.get(p.sellerId);
          return {
            ...p,
            rating: r?.avg ?? 0,
            reviewCount: r?.count ?? undefined,
          };
        });

        if (!cancelled) setListingProducts(withRatings);
      } catch (e) {
        if (!cancelled) setListingProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [category, activeCategoryId]);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-gray-500">Category not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline text-sm">
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Category Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: 200 }}>
        <img
          src={category.image}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: `${category.color}cc` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white">
              {iconMap[category.icon]}
            </div>
            <div>
              <h1 className="text-white mb-1" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{category.name}</h1>
              <p className="text-white/75 text-sm">{category.description} · {sortedProducts.length} listings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Other category quick links */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-2.5 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  navigate(`/category/${cat.id}`);
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                  cat.id === activeCategoryId
                    ? 'text-white font-medium'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                style={cat.id === activeCategoryId ? { backgroundColor: cat.color } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listing Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            Showing <span className="font-medium text-gray-800">{sortedProducts.length}</span> listings
          </p>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 cursor-pointer"
              style={{ '--tw-ring-color': '#1B3A6B' } as React.CSSProperties}
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-gray-500 text-sm">Loading listings...</div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Inbox size={44} className="text-gray-400 mb-4" />
            <h3 className="text-gray-800 mb-2" style={{ fontWeight: 600 }}>No listings yet</h3>
            <p className="text-gray-400 text-sm">Be the first to list something in {category.name}!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
