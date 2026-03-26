import { useEffect, useState } from 'react';
import {
  Shield,
  Check,
  X,
  Clock,
  Package,
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { categories } from '../data/catalog';
import type { PendingProduct, PendingRating } from '../data/types';
import { auth, db } from '../firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { formatTimestampToYYYYMMDD, mapFirestoreCategoryToUiCategoryId } from '../lib/uehMarketplaceFirebase';

type Tab = 'products' | 'ratings';
type ItemStatus = 'pending' | 'approved' | 'rejected';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const navigate = useNavigate();

  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [productItems, setProductItems] = useState<(PendingProduct & { status: ItemStatus })[]>([]);
  const [ratingItems, setRatingItems] = useState<(PendingRating & { status: ItemStatus })[]>([]);

  const [productFilter, setProductFilter] = useState<ItemStatus | 'all'>('all');
  const [ratingFilter, setRatingFilter] = useState<ItemStatus | 'all'>('all');

  const handleProductAction = async (id: string, action: 'approved' | 'rejected') => {
    await updateDoc(doc(db, 'products', id), { status: action });
  };

  const handleRatingAction = async (id: string, action: 'approved' | 'rejected') => {
    await updateDoc(doc(db, 'ratings', id), { status: action });
  };

  const filteredProducts = productFilter === 'all'
    ? productItems
    : productItems.filter((p) => p.status === productFilter);

  const filteredRatings = ratingFilter === 'all'
    ? ratingItems
    : ratingItems.filter((r) => r.status === ratingFilter);

  const pendingProductCount = productItems.filter((p) => p.status === 'pending').length;
  const pendingRatingCount = ratingItems.filter((r) => r.status === 'pending').length;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const StatusBadge = ({ status }: { status: ItemStatus }) => {
    if (status === 'approved') return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 size={11} /> Approved
      </span>
    );
    if (status === 'rejected') return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
        <XCircle size={11} /> Rejected
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={11} /> Pending
      </span>
    );
  };

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= rating ? 'text-amber-400' : 'text-gray-200'}
          fill="currentColor"
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}/5</span>
    </div>
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        navigate('/login', { replace: true });
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const role = userSnap.exists() ? (userSnap.data() as any).role : 'user';
        const admin = role === 'admin';
        setIsAdmin(admin);
        if (!admin) navigate('/', { replace: true });
      } finally {
        setCheckingAdmin(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const productsQ = query(collection(db, 'products'), where('status', '==', 'pending'));
    const ratingsQ = query(collection(db, 'ratings'), where('status', '==', 'pending'));

    const unsubProducts = onSnapshot(productsQ, (snapshot) => {
      const rows: (PendingProduct & { status: ItemStatus })[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        const uiCategoryId = mapFirestoreCategoryToUiCategoryId(data.category ?? '');
        const categoryName = uiCategoryId ? categories.find((c) => c.id === uiCategoryId)?.name : null;

        return {
          id: d.id,
          productName: data.title ?? '',
          seller: data.sellerName ?? '',
          category: categoryName ?? data.category ?? '',
          price: data.price ?? 0,
          submittedDate: formatTimestampToYYYYMMDD(data.createdAt),
          image: data.images?.[0] ?? '',
          status: 'pending',
        };
      });

      setProductItems(rows);
    });

    let ratingsRequest = 0;
    const unsubRatings = onSnapshot(ratingsQ, (snapshot) => {
      const currentReq = ++ratingsRequest;

      async function mapRatings() {
        const raw = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            productId: data.productId as string,
            buyerId: data.buyerId as string,
            rating: data.score as number,
            comment: data.comment ?? '',
            submittedDate: formatTimestampToYYYYMMDD(data.createdAt),
          };
        });

        const productIds = Array.from(new Set(raw.map((r) => r.productId).filter(Boolean)));
        const buyerIds = Array.from(new Set(raw.map((r) => r.buyerId).filter(Boolean)));

        const productMap = new Map<string, string>();
        await Promise.all(
          productIds.map(async (pid) => {
            const s = await getDoc(doc(db, 'products', pid));
            const data = s.exists() ? (s.data() as any) : null;
            productMap.set(pid, data?.title ?? pid);
          })
        );

        const buyerMap = new Map<string, string>();
        await Promise.all(
          buyerIds.map(async (bid) => {
            const s = await getDoc(doc(db, 'users', bid));
            const data = s.exists() ? (s.data() as any) : null;
            buyerMap.set(bid, data?.email ?? data?.studentId ?? bid);
          })
        );

        if (currentReq !== ratingsRequest) return;

        const rows: (PendingRating & { status: ItemStatus })[] = raw.map((r) => ({
          id: r.id,
          productName: productMap.get(r.productId) ?? '',
          reviewer: buyerMap.get(r.buyerId) ?? '',
          rating: typeof r.rating === 'number' ? r.rating : 0,
          comment: r.comment,
          submittedDate: r.submittedDate,
          status: 'pending',
        }));

        setRatingItems(rows);
      }

      mapRatings().catch(() => {
        /* ignore */
      });
    });

    return () => {
      unsubProducts();
      unsubRatings();
    };
  }, [isAdmin]);

  if (checkingAdmin) return null;
  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1B3A6B' }}>
              <Shield size={20} className="text-white" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1B3A6B' }}>Admin Dashboard</h1>
          </div>
          <p className="text-gray-500 text-sm">Review and moderate student listings and ratings.</p>
        </div>

        {/* Summary Cards */}
        <div className="flex gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-center">
            <div className="text-2xl font-bold" style={{ color: '#1B3A6B' }}>{pendingProductCount}</div>
            <div className="text-xs text-gray-400">Pending Products</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-center">
            <div className="text-2xl font-bold" style={{ color: '#C8A24B' }}>{pendingRatingCount}</div>
            <div className="text-xs text-gray-400">Pending Ratings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2.5 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'products' ? { borderColor: '#1B3A6B', color: '#1B3A6B' } : {}}
            >
              <Package size={16} />
              Pending Products
              {pendingProductCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#1B3A6B' }}>
                  {pendingProductCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ratings')}
              className={`flex items-center gap-2.5 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'ratings'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star size={16} />
              Pending Ratings
              {pendingRatingCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white bg-amber-500">
                  {pendingRatingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">Filter:</span>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => activeTab === 'products' ? setProductFilter(f) : setRatingFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                (activeTab === 'products' ? productFilter : ratingFilter) === f
                  ? 'bg-white shadow-sm text-gray-800 border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}

          <div className="ml-auto text-xs text-gray-400">
            {activeTab === 'products'
              ? `${filteredProducts.length} of ${productItems.length} items`
              : `${filteredRatings.length} of ${ratingItems.length} items`}
          </div>
        </div>

        {/* Pending Products Table */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package size={36} className="text-gray-400 mb-3" />
                <p className="text-gray-500 text-sm">No items to show</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Seller</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Submitted</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-800 line-clamp-1">{item.productName}</div>
                            <div className="text-xs text-gray-400 sm:hidden">{item.seller}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="text-sm text-gray-700">{item.seller}</div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>
                          {formatPrice(item.price)}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs text-gray-400">{item.submittedDate}</span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4">
                        {item.status === 'pending' ? (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleProductAction(item.id, 'approved')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                              style={{ backgroundColor: '#16a34a' }}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleProductAction(item.id, 'rejected')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 transition-all hover:bg-red-600"
                            >
                              <X size={13} /> Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <button
                              onClick={() => setProductItems((prev) => prev.map((p) => p.id === item.id ? { ...p, status: 'pending' } : p))}
                              className="text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                              Undo
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Pending Ratings Table */}
        {activeTab === 'ratings' && (
          <div className="overflow-x-auto">
            {filteredRatings.length === 0 ? (
              <div className="text-center py-16">
                <Star size={36} className="text-amber-300 mb-3" />
                <p className="text-gray-500 text-sm">No ratings to show</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Reviewer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Comment</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Submitted</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRatings.map((item) => (
                    <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${item.rating <= 2 ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-800 line-clamp-1">{item.productName}</div>
                          <div className="text-xs text-gray-400 sm:hidden">{item.reviewer}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-700">{item.reviewer}</span>
                      </td>
                      <td className="px-4 py-4">
                        <StarDisplay rating={item.rating} />
                        {item.rating <= 2 && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle size={11} className="text-red-500" />
                            <span className="text-xs text-red-500">Low rating</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell max-w-xs">
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.comment}</p>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs text-gray-400">{item.submittedDate}</span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4">
                        {item.status === 'pending' ? (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleRatingAction(item.id, 'approved')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                              style={{ backgroundColor: '#16a34a' }}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleRatingAction(item.id, 'rejected')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 transition-all hover:bg-red-600"
                            >
                              <X size={13} /> Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <button
                              onClick={() => setRatingItems((prev) => prev.map((r) => r.id === item.id ? { ...r, status: 'pending' } : r))}
                              className="text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                              Undo
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-red-400" /> Rows with low ratings (≤2★) are highlighted in red</span>
        <span className="flex items-center gap-1"><Clock size={12} /> Actions can be undone before page refresh</span>
      </div>
    </div>
  );
}