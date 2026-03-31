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
  Users,
  UserCog,
  ShieldCheck,
  Settings2,
  Ban,
  Unlock,
  BookOpen,
  Edit2,
  Trash2,
  FileText,
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
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { formatTimestampToYYYYMMDD, mapFirestoreCategoryToUiCategoryId } from '../lib/uehMarketplaceFirebase';
import { translations } from '../i18n/i18n';
import { useLanguage } from '../i18n/LanguageProvider';
import {
  fetchAdminProfile,
  hasPermission,
  type AdminProfile,
  type Permission,
} from '../lib/uehMarketplaceAuth';
import { AssignPermissionsModal } from '../components/AssignPermissionsModal';

type Tab = 'products' | 'ratings' | 'users' | 'policies';
type ItemStatus = 'pending' | 'approved' | 'rejected';

const MASTER_ADMIN_EMAIL = 'anniversary@ueh.vn';

interface UserRow {
  id: string;
  email: string;
  role: 'admin' | 'user';
  permissions: Permission[];
  displayName?: string;
  status: 'active' | 'banned';
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = translations[lang].admin;

  // ── Auth / Profile ───────────────────────────────────────────────
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  // ── Active tab (default to first allowed tab) ────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('products');

  // ── Products ─────────────────────────────────────────────────────
  const [productItems, setProductItems] = useState<(PendingProduct & { status: ItemStatus })[]>([]);
  const [productFilter, setProductFilter] = useState<ItemStatus | 'all'>('all');

  // ── Ratings ──────────────────────────────────────────────────────
  const [ratingItems, setRatingItems] = useState<(PendingRating & { status: ItemStatus })[]>([]);
  const [ratingFilter, setRatingFilter] = useState<ItemStatus | 'all'>('all');

  // ── Users ────────────────────────────────────────────────────────
  const [userRows, setUserRows] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [permissionTarget, setPermissionTarget] = useState<UserRow | null>(null);

  // ── Action alerts ─────────────────────────────────────────────────
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ── Policies ──────────────────────────────────────────────────────
  const [policies, setPolicies] = useState<any[]>([]);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [policyForm, setPolicyForm] = useState({ title: '', slug: '', content: '' });
  const [savingPolicy, setSavingPolicy] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setPolicyForm(prev => {
      const generateSlug = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const isAutoSlug = prev.slug === '' || prev.slug === generateSlug(prev.title);
      return {
        ...prev,
        title: newTitle,
        slug: isAutoSlug ? generateSlug(newTitle) : prev.slug
      };
    });
  };

  const handleSavePolicy = async () => {
    if (!policyForm.title || !policyForm.slug || !policyForm.content) {
      showAlert('error', 'Vui lòng điền đầy đủ tiêu đề, slug và nội dung.');
      return;
    }
    setSavingPolicy(true);
    try {
      const payload = {
        title: policyForm.title,
        slug: policyForm.slug,
        content: policyForm.content,
        updatedAt: serverTimestamp()
      };
      if (editingPolicyId) {
        await updateDoc(doc(db, 'policies', editingPolicyId), payload);
        showAlert('success', '✓ Đã cập nhật chính sách.');
      } else {
        await addDoc(collection(db, 'policies'), payload);
        showAlert('success', '✓ Đã tạo chính sách mới.');
      }
      setPolicyForm({ title: '', slug: '', content: '' });
      setEditingPolicyId(null);
    } catch (err: any) {
      showAlert('error', `Lỗi lưu chính sách: ${err?.message}`);
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!window.confirm(t.cmsConfirmDelete)) return;
    try {
      await deleteDoc(doc(db, 'policies', id));
      showAlert('success', '✓ Đã xóa chính sách.');
    } catch (err: any) {
      showAlert('error', `Lỗi xóa: ${err?.message}`);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setActionAlert({ type, message });
    setTimeout(() => setActionAlert(null), 4000);
  };

  // ── Derived ──────────────────────────────────────────────────────
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

  // ── Sub-components ───────────────────────────────────────────────
  const StatusBadge = ({ status }: { status: ItemStatus }) => {
    if (status === 'approved') return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 size={11} /> {t.badgeApproved}
      </span>
    );
    if (status === 'rejected') return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
        <XCircle size={11} /> {t.badgeRejected}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={11} /> {t.badgePending}
      </span>
    );
  };

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={13} className={s <= rating ? 'text-amber-400' : 'text-gray-200'} fill="currentColor" />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}/5</span>
    </div>
  );

  // ── Auth effect ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCheckingAdmin(false);
        navigate('/login', { replace: true });
        return;
      }
      setCurrentUserEmail(user.email ?? '');
      try {
        const profile = await fetchAdminProfile(user.uid, user.email ?? undefined);
        if (!profile.isAdmin) {
          navigate('/', { replace: true });
          return;
        }
        setAdminProfile(profile);
        // Default to first tab the user can access
        if (profile.isMaster || hasPermission(profile, 'manage_products')) {
          setActiveTab('products');
        } else if (hasPermission(profile, 'manage_ratings')) {
          setActiveTab('ratings');
        } else if (hasPermission(profile, 'manage_users')) {
          setActiveTab('users');
        }
      } finally {
        setCheckingAdmin(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  // ── Data subscriptions ───────────────────────────────────────────
  useEffect(() => {
    if (!adminProfile) return;

    const subs: (() => void)[] = [];

    if (hasPermission(adminProfile, 'manage_products')) {
      subs.push(
        onSnapshot(collection(db, 'products'), (snap) => {
          const rows: (PendingProduct & { status: ItemStatus })[] = snap.docs.map((d) => {
            const data = d.data() as any;
            const uiCategoryId = mapFirestoreCategoryToUiCategoryId(data.category ?? '');
            const categoryName = uiCategoryId ? categories.find((c) => c.id === uiCategoryId)?.name : null;
            const rawStatus = data.status as string;
            const status: ItemStatus = rawStatus === 'approved' || rawStatus === 'rejected' ? rawStatus : 'pending';
            return {
              id: d.id,
              productName: data.title ?? '',
              seller: data.sellerName ?? '',
              category: categoryName ?? data.category ?? '',
              price: data.price ?? 0,
              submittedDate: formatTimestampToYYYYMMDD(data.createdAt),
              image: data.images?.[0] ?? '',
              status,
            };
          });
          setProductItems(rows);
        })
      );
    }

    if (hasPermission(adminProfile, 'manage_ratings')) {
      let req = 0;
      subs.push(
        onSnapshot(collection(db, 'ratings'), (snap) => {
          const currentReq = ++req;
          async function mapRatings() {
            const raw = snap.docs.map((d) => {
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
            await Promise.all(productIds.map(async (pid) => {
              const s = await getDoc(doc(db, 'products', pid));
              productMap.set(pid, (s.data() as any)?.title ?? pid);
            }));
            const buyerMap = new Map<string, string>();
            await Promise.all(buyerIds.map(async (bid) => {
              const s = await getDoc(doc(db, 'users', bid));
              const d = s.data() as any;
              buyerMap.set(bid, d?.email ?? d?.studentId ?? bid);
            }));
            if (currentReq !== req) return;
            setRatingItems(raw.map((r) => {
              const rawStatus = snap.docs.find((d) => d.id === r.id)?.data()?.status as string | undefined;
              const status: ItemStatus = rawStatus === 'approved' || rawStatus === 'rejected' ? rawStatus : 'pending';
              return {
                id: r.id,
                productName: productMap.get(r.productId) ?? '',
                reviewer: buyerMap.get(r.buyerId) ?? '',
                rating: typeof r.rating === 'number' ? r.rating : 0,
                comment: r.comment,
                submittedDate: r.submittedDate,
                status,
              };
            }));
          }
          mapRatings().catch(() => {});
        })
      );
    }

    return () => subs.forEach((u) => u());
  }, [adminProfile]);

  // ── Load users when entering users tab ───────────────────────────
  useEffect(() => {
    if (activeTab !== 'users' || !adminProfile || !hasPermission(adminProfile, 'manage_users')) return;
    setLoadingUsers(true);

    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const rows: UserRow[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const rawPerms: string[] = Array.isArray(data.permissions) ? data.permissions : [];
          return {
            id: d.id,
            email: data.email ?? '',
            role: (data.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
            permissions: rawPerms.filter((p): p is Permission =>
              ['manage_products', 'manage_ratings', 'manage_users'].includes(p)
            ),
            displayName: data.displayName ?? data.name ?? '',
            status: data.status === 'banned' ? 'banned' : 'active',
          };
        });
        rows.sort((a, b) => {
          if (a.email === MASTER_ADMIN_EMAIL) return -1;
          if (b.email === MASTER_ADMIN_EMAIL) return 1;
          if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
          return a.email.localeCompare(b.email);
        });
        setUserRows(rows);
        setLoadingUsers(false);
      },
      () => {
        setUserRows([]);
        setLoadingUsers(false);
      }
    );

    return () => unsub();
  }, [activeTab, adminProfile]);

  // ── Load policies when entering policies tab ──────────────────────
  useEffect(() => {
    if (activeTab !== 'policies' || currentUserEmail !== MASTER_ADMIN_EMAIL) return;
    const unsub = onSnapshot(collection(db, 'policies'), (snap) => {
      setPolicies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [activeTab, currentUserEmail]);

  // ── Guards ───────────────────────────────────────────────────────
  if (checkingAdmin) return null;
  if (!adminProfile) return null;

  // ── Tab config (filter by permissions) ───────────────────────────
  const allTabConfig = [
    {
      key: 'products' as Tab,
      icon: <Package size={16} />,
      label: t.tabProducts,
      badge: pendingProductCount,
      badgeColor: '#1B3A6B',
      activeColor: '#1B3A6B',
      permission: 'manage_products' as Permission,
    },
    {
      key: 'ratings' as Tab,
      icon: <Star size={16} />,
      label: t.tabRatings,
      badge: pendingRatingCount,
      badgeColor: '#d97706',
      activeColor: '#d97706',
      permission: 'manage_ratings' as Permission,
    },
    {
      key: 'users' as Tab,
      icon: <Users size={16} />,
      label: t.tabUsers,
      badge: 0,
      badgeColor: '#7c3aed',
      activeColor: '#7c3aed',
      permission: 'manage_users' as Permission,
    },
    ...(adminProfile.isMaster ? [{
      key: 'policies' as Tab,
      icon: <FileText size={16} />,
      label: t.tabContent,
      badge: 0,
      badgeColor: '#059669',
      activeColor: '#059669',
      permission: 'manage_users' as Permission,
    }] : []),
  ];

  const visibleTabs = allTabConfig.filter((tab) =>
    adminProfile.isMaster || hasPermission(adminProfile, tab.permission)
  );

  const filterKeys: { key: ItemStatus | 'all'; label: string }[] = [
    { key: 'all', label: t.filterAll },
    { key: 'pending', label: t.filterPending },
    { key: 'approved', label: t.filterApproved },
    { key: 'rejected', label: t.filterRejected },
  ];

  // ── Ban / Unban ──────────────────────────────────────────────────
  const handleBanToggle = async (user: UserRow) => {
    // Hierarchy guard: sub-admins cannot act on other admins
    if (user.role === 'admin' && currentUserEmail !== MASTER_ADMIN_EMAIL) {
      alert('Không đủ thẩm quyền! Sub-admins cannot ban other admins.');
      return;
    }
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    try {
      await updateDoc(doc(db, 'users', user.id), { status: newStatus });
      showAlert('success', newStatus === 'banned' ? '✓ User banned.' : '✓ User unbanned.');
    } catch (err: any) {
      showAlert('error', `Failed to update user status: ${err?.message ?? 'Unknown error'}`);
    }
  };

  const handleProductAction = async (id: string, action: 'approved' | 'rejected' | 'pending') => {
    try {
      await updateDoc(doc(db, 'products', id), { status: action });
      if (action === 'approved') showAlert('success', '✓ Product approved successfully.');
      else if (action === 'rejected') showAlert('success', '✓ Product rejected.');
      else showAlert('success', '✓ Đã hoàn tác.');
    } catch (err: any) {
      showAlert('error', `Failed to update product: ${err?.message ?? 'Unknown error'}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm(t.confirmDeleteProduct)) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      showAlert('success', '✓ Đã xóa bài viết.');
    } catch (err: any) {
      showAlert('error', `Failed to delete product: ${err?.message ?? 'Unknown error'}`);
    }
  };

  const handleRatingAction = async (id: string, action: 'approved' | 'rejected' | 'pending') => {
    try {
      await updateDoc(doc(db, 'ratings', id), { status: action });
      if (action === 'approved') showAlert('success', '✓ Rating approved successfully.');
      else if (action === 'rejected') showAlert('success', '✓ Rating rejected.');
      else showAlert('success', '✓ Đã hoàn tác.');
    } catch (err: any) {
      showAlert('error', `Failed to update rating: ${err?.message ?? 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1B3A6B' }}>
              <Shield size={20} className="text-white" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1B3A6B' }}>{t.title}</h1>
          </div>
          <p className="text-gray-500 text-sm">{t.subtitle}</p>
        </div>

        {/* Summary Cards */}
        <div className="flex gap-3 flex-wrap">
          {hasPermission(adminProfile, 'manage_products') && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-center">
              <div className="text-2xl font-bold" style={{ color: '#1B3A6B' }}>{pendingProductCount}</div>
              <div className="text-xs text-gray-400">{t.pendingProducts}</div>
            </div>
          )}
          {hasPermission(adminProfile, 'manage_ratings') && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-center">
              <div className="text-2xl font-bold" style={{ color: '#C8A24B' }}>{pendingRatingCount}</div>
              <div className="text-xs text-gray-400">{t.pendingRatings}</div>
            </div>
          )}
          {hasPermission(adminProfile, 'manage_users') && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-center">
              <div className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{userRows.length || '–'}</div>
              <div className="text-xs text-gray-400">{t.totalUsers}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Card ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Tab Bar */}
        <div className="border-b border-gray-100">
          <div className="flex">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive ? '' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  style={isActive ? { borderColor: tab.activeColor, color: tab.activeColor } : {}}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tab.badgeColor }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <>
            {/* Alert banner */}
            {actionAlert && (
              <div
                className={`mx-6 mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
                  actionAlert.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                <span>{actionAlert.message}</span>
                <button onClick={() => setActionAlert(null)} className="flex-shrink-0 p-1 rounded hover:bg-black/5">
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium">{t.filterLabel}</span>
              {filterKeys.map(({ key, label }) => (
                <button key={key} onClick={() => setProductFilter(key)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    productFilter === key ? 'bg-white shadow-sm text-gray-800 border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}>{label}</button>
              ))}
              <div className="ml-auto text-xs text-gray-400">{filteredProducts.length} {t.itemsOf} {productItems.length}</div>
            </div>
            <div className="overflow-x-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16"><Package size={36} className="text-gray-400 mb-3" /><p className="text-gray-500 text-sm">{t.noProducts}</p></div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.colProduct}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t.colSeller}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">{t.colCategory}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">{t.colPrice}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">{t.colSubmitted}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.colStatus}</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                              {item.image && <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-800 line-clamp-1">{item.productName}</div>
                              <div className="text-xs text-gray-400 sm:hidden">{item.seller}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell"><div className="text-sm text-gray-700">{item.seller}</div></td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{item.category}</span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>{formatPrice(item.price)}</span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell"><span className="text-xs text-gray-400">{item.submittedDate}</span></td>
                        <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            {item.status === 'pending' && hasPermission(adminProfile, 'manage_products') ? (
                              <>
                                <button onClick={() => handleProductAction(item.id, 'approved')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90"
                                  style={{ backgroundColor: '#16a34a' }}>
                                  <Check size={13} /> {t.approve}
                                </button>
                                <button onClick={() => handleProductAction(item.id, 'rejected')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600">
                                  <X size={13} /> {t.reject}
                                </button>
                              </>
                            ) : (
                              item.status !== 'pending' && (
                                <button onClick={() => handleProductAction(item.id, 'pending')}
                                  className="text-xs text-gray-400 hover:text-gray-600 underline">{t.undo}</button>
                              )
                            )}
                            {hasPermission(adminProfile, 'manage_products') && (
                              <button onClick={() => handleDeleteProduct(item.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                                <Trash2 size={12} /> {t.deleteProduct}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── RATINGS TAB ── */}
        {activeTab === 'ratings' && (
          <>
            {/* Alert banner */}
            {actionAlert && (
              <div
                className={`mx-6 mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
                  actionAlert.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                <span>{actionAlert.message}</span>
                <button onClick={() => setActionAlert(null)} className="flex-shrink-0 p-1 rounded hover:bg-black/5">
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium">{t.filterLabel}</span>
              {filterKeys.map(({ key, label }) => (
                <button key={key} onClick={() => setRatingFilter(key)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    ratingFilter === key ? 'bg-white shadow-sm text-gray-800 border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}>{label}</button>
              ))}
              <div className="ml-auto text-xs text-gray-400">{filteredRatings.length} {t.itemsOf} {ratingItems.length}</div>
            </div>
            <div className="overflow-x-auto">
              {filteredRatings.length === 0 ? (
                <div className="text-center py-16"><Star size={36} className="text-amber-300 mb-3" /><p className="text-gray-500 text-sm">{t.noRatings}</p></div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.colProduct}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t.colReviewer}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.colRating}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">{t.colComment}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">{t.colSubmitted}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.colStatus}</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.colActions}</th>
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
                        <td className="px-4 py-4 hidden sm:table-cell"><span className="text-sm text-gray-700">{item.reviewer}</span></td>
                        <td className="px-4 py-4">
                          <StarDisplay rating={item.rating} />
                          {item.rating <= 2 && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle size={11} className="text-red-500" />
                              <span className="text-xs text-red-500">{t.lowRating}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell max-w-xs">
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.comment}</p>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell"><span className="text-xs text-gray-400">{item.submittedDate}</span></td>
                        <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                        <td className="px-6 py-4">
                          {item.status === 'pending' && hasPermission(adminProfile, 'manage_ratings') ? (
                            <div className="flex items-center gap-2 justify-end">
                              <button onClick={() => handleRatingAction(item.id, 'approved')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90"
                                style={{ backgroundColor: '#16a34a' }}>
                                <Check size={13} /> {t.approve}
                              </button>
                              <button onClick={() => handleRatingAction(item.id, 'rejected')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600">
                                <X size={13} /> {t.reject}
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              {item.status !== 'pending' && (
                                <button onClick={() => handleRatingAction(item.id, 'pending')}
                                  className="text-xs text-gray-400 hover:text-gray-600 underline">{t.undo}</button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            {loadingUsers ? (
              <div className="text-center py-16 text-gray-400 text-sm">...</div>
            ) : userRows.length === 0 ? (
              <div className="text-center py-16"><Users size={36} className="text-gray-300 mb-3" /><p className="text-gray-500 text-sm">{t.noUsers}</p></div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.colUser}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t.colEmail}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.colRole}</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {userRows.map((user) => {
                    const isMaster = user.email === MASTER_ADMIN_EMAIL;
                    const isSelf = user.email === currentUserEmail;

                    // Permission badges to show
                    const permLabels: Record<Permission, string> = {
                      manage_products: t.permManageProducts,
                      manage_ratings: t.permManageRatings,
                      manage_users: t.permManageUsers,
                    };

                    return (
                      <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${isMaster ? 'bg-amber-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: user.role === 'admin' ? '#1B3A6B' : '#6b7280' }}
                            >
                              {(user.displayName || user.email).slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 flex-wrap">
                                {user.displayName || user.email.split('@')[0]}
                                {isSelf && <span className="text-xs text-blue-500 font-medium">(you)</span>}
                                {user.status === 'banned' && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 border border-red-200">Banned</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 sm:hidden">{user.email}</div>
                              {/* Permission pills (non-master admins) */}
                              {user.role === 'admin' && !isMaster && user.permissions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {user.permissions.map((p) => (
                                    <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium">
                                      {permLabels[p]}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-600">{user.email}</span>
                        </td>
                        <td className="px-4 py-4">
                          {isMaster ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <ShieldCheck size={12} /> {t.masterAdmin}
                            </span>
                          ) : user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              <Shield size={12} /> {t.roleAdmin}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                              <UserCog size={12} /> {t.roleUser}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* ── Ban / Unban ────────────────────────────────────────────
                                Visible to: Master Admin (everyone except self) AND
                                Sub-Admins with manage_users (regular users only). */}
                            {(() => {
                              const isMasterViewer = currentUserEmail === MASTER_ADMIN_EMAIL;
                              // Sub-admins may only ban regular users, never other admins
                              const canBan =
                                !isMaster &&
                                !isSelf &&
                                hasPermission(adminProfile, 'manage_users') &&
                                (isMasterViewer || user.role === 'user');

                              return canBan ? (
                                <button
                                  onClick={() => handleBanToggle(user)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                    user.status === 'banned'
                                      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                      : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                  }`}
                                >
                                  {user.status === 'banned'
                                    ? <><Unlock size={13} /> Unban</>
                                    : <><Ban size={13} /> Ban</>}
                                </button>
                              ) : null;
                            })()}

                            {/* ── Assign Permissions ─────────────────────────────────────
                                MASTER ADMIN ONLY — never shown to Sub-Admins. */}
                            {currentUserEmail === MASTER_ADMIN_EMAIL && !isMaster && !isSelf && (
                              <button
                                onClick={() => setPermissionTarget(user)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                              >
                                <Settings2 size={13} /> {t.assignPermissions}
                              </button>
                            )}

                            {/* Dash placeholder when no actions are available */}
                            {(() => {
                              const isMasterViewer = currentUserEmail === MASTER_ADMIN_EMAIL;
                              const canBan =
                                !isMaster && !isSelf &&
                                hasPermission(adminProfile, 'manage_users') &&
                                (isMasterViewer || user.role === 'user');
                              const canAssign = isMasterViewer && !isMaster && !isSelf;
                              return !canBan && !canAssign
                                ? <span className="text-xs text-gray-300 italic">—</span>
                                : null;
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── POLICIES TAB ── */}
        {activeTab === 'policies' && adminProfile.isMaster && (
          <div className="p-6">
            {actionAlert && (
              <div
                className={`mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
                  actionAlert.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                <span>{actionAlert.message}</span>
                <button onClick={() => setActionAlert(null)} className="flex-shrink-0 p-1 rounded hover:bg-black/5">
                  <X size={14} />
                </button>
              </div>
            )}
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Form */}
              <div className="flex-1 bg-gray-50/50 border border-gray-100 p-5 rounded-2xl">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-600" />
                  {editingPolicyId ? t.cmsEditPolicy : t.cmsNewPolicy}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t.cmsPageTitle}</label>
                    <input
                      type="text"
                      className="w-full text-sm px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={policyForm.title}
                      onChange={handleTitleChange}
                      placeholder="Ví dụ: Quy tắc cộng đồng"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {t.cmsSlug} <span className="font-normal text-gray-400">({t.cmsSlugHint})</span>
                    </label>
                    <input
                      type="text"
                      className="w-full text-sm px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono"
                      value={policyForm.slug}
                      onChange={(e) => setPolicyForm({ ...policyForm, slug: e.target.value })}
                      placeholder="vi-du-quy-tac"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t.cmsContent}</label>
                    <textarea
                      rows={10}
                      className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all leading-relaxed"
                      value={policyForm.content}
                      onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                      placeholder="..."
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSavePolicy}
                      disabled={savingPolicy}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {savingPolicy ? t.cmsSaving : t.cmsSave}
                    </button>
                    {editingPolicyId && (
                      <button
                        onClick={() => {
                          setEditingPolicyId(null);
                          setPolicyForm({ title: '', slug: '', content: '' });
                        }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {t.cmsCancel}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-4">{t.cmsTitle}</h3>
                {policies.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                    <FileText size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{t.cmsNoPolicy}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {policies.map(p => (
                      <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-100 hover:shadow-sm transition-all group">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-800 truncate">{p.title}</h4>
                          <div className="text-xs text-gray-400 font-mono mt-0.5 truncate">/policy/{p.slug}</div>
                        </div>
                        <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingPolicyId(p.id);
                              setPolicyForm({ title: p.title ?? '', slug: p.slug ?? '', content: p.content ?? '' });
                            }}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title={t.cmsEditPolicy}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePolicy(p.id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title={t.cmsDelete}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-red-400" /> {t.legendLowRating}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {t.legendUndo}</span>
      </div>

      {/* Assign Permissions Modal */}
      {permissionTarget && adminProfile && (
        <AssignPermissionsModal
          targetUser={permissionTarget}
          currentAdminProfile={adminProfile}
          onClose={() => setPermissionTarget(null)}
          onSaved={(updated) => {
            setUserRows((prev) => prev.map((u) =>
              u.id === updated.id ? { ...u, ...updated, status: u.status } : u
            ));
            setPermissionTarget(null);
          }}
        />
      )}
    </div>
  );
}