import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseClient';
import { BookOpen, ArrowLeft, AlertTriangle } from 'lucide-react';

interface PolicyDoc {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt?: any;
}

export default function PolicyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [policy, setPolicy] = useState<PolicyDoc | null | undefined>(undefined); // undefined = loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setPolicy(null);
      return;
    }
    setPolicy(undefined); // reset to loading
    setError(null);

    const q = query(collection(db, 'policies'), where('slug', '==', slug));
    getDocs(q)
      .then((snap) => {
        if (snap.empty) {
          setPolicy(null);
        } else {
          const d = snap.docs[0];
          const data = d.data() as any;
          setPolicy({
            id: d.id,
            slug: data.slug ?? '',
            title: data.title ?? '',
            content: data.content ?? '',
            updatedAt: data.updatedAt ?? null,
          });
        }
      })
      .catch((err) => {
        setError(err?.message ?? 'Unknown error');
        setPolicy(null);
      });
  }, [slug]);

  // ── Loading ──────────────────────────────────────────────────────────
  if (policy === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Đang tải...</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Có lỗi xảy ra</h2>
        <p className="text-sm text-gray-400 mb-6">{error}</p>
        <Link to="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1 justify-center">
          <ArrowLeft size={14} /> Về trang chủ
        </Link>
      </div>
    );
  }

  // ── Not Found ────────────────────────────────────────────────────────
  if (policy === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <BookOpen size={40} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-600 mb-2">Không tìm thấy trang</h2>
        <p className="text-sm text-gray-400 mb-6">
          Chính sách "<span className="font-mono text-gray-500">{slug}</span>" chưa được tạo.
        </p>
        <Link to="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1 justify-center">
          <ArrowLeft size={14} /> Về trang chủ
        </Link>
      </div>
    );
  }

  // ── Content ──────────────────────────────────────────────────────────
  const formattedDate = policy.updatedAt?.toDate
    ? policy.updatedAt.toDate().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Trang chủ
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#1B3A6B' }}
          >
            <BookOpen size={17} className="text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Quy tắc &amp; Chính sách
          </span>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-extrabold leading-tight"
          style={{ color: '#1B3A6B' }}
        >
          {policy.title}
        </h1>
        {formattedDate && (
          <p className="text-xs text-gray-400 mt-2">Cập nhật lần cuối: {formattedDate}</p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-8" />

      {/* Body */}
      <div className="prose prose-sm max-w-none">
        <div
          className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: 'inherit' }}
        >
          {policy.content}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft size={14} />
          Về trang chủ
        </Link>
        <span className="text-xs text-gray-300">UEH Market · {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
