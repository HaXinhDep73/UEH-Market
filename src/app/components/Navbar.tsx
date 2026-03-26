import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { ShoppingBag, GraduationCap, LogOut, Shield, Menu, X, ChevronDown, Leaf, Utensils, Plug, Sparkles } from 'lucide-react';
import { categories } from '../data/catalog';
import { auth } from '../firebaseClient';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { translations } from '../i18n/i18n';
import { useLanguage } from '../i18n/LanguageProvider';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const { lang, toggleLang } = useLanguage();
  const t = translations[lang].navbar;

  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? '');
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const categoryIcons: Record<string, ReactNode> = {
    agriculture: <Leaf size={18} style={{ color: '#2d7a4f' }} />,
    food: <Utensils size={18} style={{ color: '#c05621' }} />,
    'home-appliances': <Plug size={18} style={{ color: '#1d4ed8' }} />,
    cosmetics: <Sparkles size={18} style={{ color: '#9d174d' }} />,
    'university-merch': <GraduationCap size={18} style={{ color: '#1B3A6B' }} />,
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1B3A6B' }}>
              <GraduationCap size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm leading-tight" style={{ color: '#1B3A6B' }}>UEH Market</div>
              <div className="text-xs text-gray-400 leading-tight">Student Marketplace</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === '/' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {t.home}
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <ShoppingBag size={15} />
                {t.categories}
                <ChevronDown size={13} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>

              {catOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { navigate(`/category/${cat.id}`); setCatOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg">{categoryIcons[cat.id]}</span>
                      <div>
                        <div className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{cat.name}</div>
                        <div className="text-xs text-gray-400">{cat.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === '/admin' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Shield size={14} />
              {t.admin}
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="truncate max-w-[160px]">{userEmail}</span>
            </div>
            <button
              onClick={toggleLang}
              className="hidden sm:inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
              aria-label="Toggle language"
            >
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2">
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              {t.home}
            </Link>
            <button
              onClick={() => toggleLang()}
              className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 border border-gray-200 text-center"
            >
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>
            <div className="text-xs text-gray-400 px-3 pt-2 pb-1 font-medium uppercase tracking-wide">{t.categoriesLabelMobile}</div>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>{categoryIcons[cat.id]}</span>
                {cat.name}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              <Shield size={14} /> {t.adminDashboardMobile}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
