import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Star,
  CheckCircle,
  Calendar,
  Tag,
  AlertTriangle,
  X,
  Send,
  Loader2,
} from 'lucide-react';
import { categories } from '../data/catalog';
import type { Product } from '../data/types';
import { StarRating, StarPicker } from '../components/StarRating';
import { auth, db, storage } from '../firebaseClient';
import { addDoc, collection, getDoc, getDocs, query, serverTimestamp, where, doc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { formatTimestampToYYYYMMDD, getInitials, mapFirestoreCategoryToUiCategoryId } from '../lib/uehMarketplaceFirebase';

type ProductWithSellerId = Product & { sellerId: string };

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState('');

  const [product, setProduct] = useState<ProductWithSellerId | null>(null);
  const [category, setCategory] = useState<(typeof categories)[number] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setLoading(true);
      setSubmitError('');
      setProduct(null);
      setCategory(null);

      try {
        const productSnap = await getDoc(doc(db, 'products', id));

        if (!productSnap.exists()) {
          if (!cancelled) setProduct(null);
          return;
        }

        const data = productSnap.data() as any;
        const uiCategoryId = mapFirestoreCategoryToUiCategoryId(data.category ?? '');
        const cat = uiCategoryId ? categories.find((c) => c.id === uiCategoryId) ?? null : null;

        // Seller rating is derived from approved ratings for this seller.
        const ratingsQ = query(
          collection(db, 'ratings'),
          where('sellerId', '==', data.sellerId),
          where('status', '==', 'approved')
        );
        const ratingsSnap = await getDocs(ratingsQ);

        const reviewCount = ratingsSnap.size;
        const sum = ratingsSnap.docs.reduce((acc, r) => {
          const score = (r.data() as any).score ?? 0;
          return acc + (typeof score === 'number' ? score : 0);
        }, 0);
        const averageRating = reviewCount > 0 ? sum / reviewCount : 0;

        const createdAt = data.createdAt;
        const postedDate = formatTimestampToYYYYMMDD(createdAt);

        const mapped: ProductWithSellerId = {
          id: productSnap.id,
          categoryId: uiCategoryId ?? '',
          name: data.title ?? '',
          price: data.price ?? 0,
          image: data.images?.[0] ?? '',
          seller: data.sellerName ?? '',
          sellerAvatar: getInitials(data.sellerName ?? ''),
          rating: averageRating,
          reviewCount,
          description: data.description ?? '',
          phone: data.sellerPhone ?? '',
          zalo: data.sellerZalo ?? '',
          email: data.sellerEmail ?? '',
          condition: data.condition ?? '',
          postedDate,
          sellerId: data.sellerId ?? '',
        };

        if (!cancelled) {
          setProduct(mapped);
          setCategory(cat);
        }
      } catch (e) {
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleSubmitRating = async () => {
    if (!product) return;
    if (selectedRating === 0) return;
    if (!proofFile) {
      setSubmitError('Please upload a proof image.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setSubmitError('Please log in again.');
      return;
    }

    setSubmitError('');
    setSubmitting(true);

    try {
      const path = `ratingsProofs/${product.id}/${currentUser.uid}/${Date.now()}_${proofFile.name}`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, proofFile);
      const proofImage = await getDownloadURL(ref);

      await addDoc(collection(db, 'ratings'), {
        productId: product.id,
        sellerId: product.sellerId,
        buyerId: currentUser.uid,
        score: selectedRating,
        proofImage,
        status: 'pending',
        comment,
        createdAt: serverTimestamp(),
      });

      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setShowRatingModal(false);
        setSubmitted(false);
        setSelectedRating(0);
        setComment('');
        setProofFile(null);
      }, 2000);
    } catch (e) {
      setSubmitting(false);
      setSubmitError('Failed to submit rating. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-gray-500">Product not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline text-sm">← Go Back</button>
      </div>
    );
  }

  const ratingStars = [1, 2, 3, 4, 5];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">Home</button>
        <span>/</span>
        {category && (
          <>
            <button onClick={() => navigate(`/category/${category.id}`)} className="hover:text-gray-600 transition-colors">
              {category.name}
            </button>
            <span>/</span>
          </>
        )}
        <span className="text-gray-600 line-clamp-1 max-w-[200px]">{product.name}</span>
      </nav>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Left: Image */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-[4/3]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
            <h2 className="text-gray-800 mb-3" style={{ fontSize: '1.05rem', fontWeight: 700 }}>About this item</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                <Tag size={15} className="text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">Condition</div>
                  <div className="text-sm font-medium text-gray-700">{product.condition}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                <Calendar size={15} className="text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">Posted</div>
                  <div className="text-sm font-medium text-gray-700">{product.postedDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info + Contact */}
        <div className="lg:col-span-2 space-y-4">
          {/* Product Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {category && (
              <span
                className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: `${category.color}18`, color: category.color }}
              >
                {category.name}
              </span>
            )}

            <h1 className="text-gray-900 leading-tight mb-3" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {product.name}
            </h1>

            <div className="mb-4">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            </div>

            <div className="text-3xl font-bold mb-2" style={{ color: '#1B3A6B' }}>
              {formatPrice(product.price)}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-5">
              <CheckCircle size={13} />
              Seller is a verified UEH student
            </div>

            {/* Seller */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ backgroundColor: '#1B3A6B' }}
              >
                {product.sellerAvatar}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{product.seller}</div>
                <div className="text-xs text-gray-400">UEH Student Seller</div>
                <div className="flex items-center gap-1 mt-0.5">
                  {ratingStars.map((s) => (
                    <Star
                      key={s}
                      size={11}
                      className={s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}
                      fill="currentColor"
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-0.5">{product.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Seller Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-gray-800 mb-4" style={{ fontSize: '1rem', fontWeight: 700 }}>Contact Seller</h2>

            <div className="space-y-3">
              {/* Phone */}
              <a
                href={`tel:${product.phone}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ backgroundColor: '#EFF6FF' }}>
                  <Phone size={18} style={{ color: '#1B3A6B' }} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Phone</div>
                  <div className="text-sm font-semibold text-gray-800">{product.phone}</div>
                </div>
                <div className="ml-auto text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  Call now →
                </div>
              </a>

              {/* Zalo */}
              <a
                href={`https://zalo.me/${product.zalo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EFF6FF' }}>
                  <MessageCircle size={18} style={{ color: '#0068FF' }} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Zalo</div>
                  <div className="text-sm font-semibold text-gray-800">{product.zalo}</div>
                </div>
                <div className="ml-auto text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  Chat →
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${product.email}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EFF6FF' }}>
                  <Mail size={18} style={{ color: '#1B3A6B' }} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Email</div>
                  <div className="text-sm font-semibold text-gray-800 break-all">{product.email}</div>
                </div>
                <div className="ml-auto text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium flex-shrink-0">
                  Email →
                </div>
              </a>
            </div>
          </div>

          {/* Submit Rating */}
          <button
            onClick={() => setShowRatingModal(true)}
            className="w-full py-3.5 rounded-xl border-2 text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ borderColor: '#1B3A6B', color: '#1B3A6B' }}
          >
            <Star size={16} />
            Submit a Rating
          </button>

          {/* Safety tip */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-2">
              <AlertTriangle size={14} />
              Safety Reminder
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Meet in public campus areas. Inspect items before payment. All transactions are between students — UEH Market does not handle payments.
            </p>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-900" style={{ fontSize: '1rem', fontWeight: 700 }}>Rate this Seller</h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <div className="px-6 py-10 text-center">
                <CheckCircle size={44} className="text-amber-400 mb-4" />
                <h3 className="text-gray-800 mb-2" style={{ fontWeight: 700 }}>Thank you!</h3>
                <p className="text-gray-500 text-sm">Your rating has been submitted for review.</p>
              </div>
            ) : (
              <div className="px-6 py-5">
                {/* Seller info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: '#1B3A6B' }}>
                    {product.sellerAvatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{product.seller}</div>
                    <div className="text-xs text-gray-400 line-clamp-1">{product.name}</div>
                  </div>
                </div>

                {/* Star picker */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Your Rating</label>
                  <div className="flex justify-center">
                    <StarPicker value={selectedRating} onChange={setSelectedRating} />
                  </div>
                  {selectedRating > 0 && (
                    <p className="text-center text-xs text-amber-600 mt-2">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][selectedRating]}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Comment (optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this seller..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 resize-none"
                  />
                </div>

                {/* Proof Image */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Proof Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 resize-none"
                  />
                  {proofFile && (
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {proofFile.name}
                    </p>
                  )}
                </div>

                {submitError && (
                  <p className="text-xs text-red-600 text-center mb-3">
                    {submitError}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRating}
                    disabled={selectedRating === 0 || submitting || !proofFile}
                    className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90"
                    style={{ backgroundColor: '#1B3A6B' }}
                  >
                    {submitting ? (
                      <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                    ) : (
                      <><Send size={15} /> Submit Rating</>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Ratings are reviewed by admin before being published.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
