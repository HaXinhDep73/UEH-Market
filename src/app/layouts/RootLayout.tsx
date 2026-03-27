import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PostListingModal } from '../components/PostListingModal';
import { auth } from '../firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '../i18n/LanguageProvider';
import { translations } from '../i18n/i18n';
import { fetchAdminProfile } from '../lib/uehMarketplaceAuth';

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();
  const t = translations[lang].navbar;

  const [checked, setChecked] = useState(false);
  const [adminGateChecked, setAdminGateChecked] = useState(false);
  const [adminAllowed, setAdminAllowed] = useState(false);
  const [fabModalOpen, setFabModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      setChecked(true);
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    async function gateAdminRoute() {
      if (!checked) return;
      if (location.pathname !== '/admin') {
        setAdminGateChecked(true);
        setAdminAllowed(true);
        return;
      }

      setAdminGateChecked(false);
      setAdminAllowed(false);

      const user = auth.currentUser;
      if (!user) {
        if (!cancelled) {
          setAdminGateChecked(true);
          setAdminAllowed(false);
        }
        navigate('/', { replace: true });
        return;
      }

      try {
        const profile = await fetchAdminProfile(user.uid, user.email ?? undefined);
        const allowed = profile.isAdmin;

        if (!cancelled) {
          setAdminAllowed(allowed);
          setAdminGateChecked(true);
        }

        if (!allowed) navigate('/', { replace: true });
      } catch (err) {
        console.error('Admin gate error:', err);
        if (!cancelled) {
          setAdminAllowed(false);
          setAdminGateChecked(true);
        }
        navigate('/', { replace: true });
      }
    }

    gateAdminRoute();
    return () => {
      cancelled = true;
    };
  }, [checked, location.pathname, navigate]);

  if (!checked) return null;
  if (location.pathname === '/admin' && !adminGateChecked) return null;
  if (location.pathname === '/admin' && adminGateChecked && !adminAllowed) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4F6F9' }}>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Mobile FAB – Post Listing */}
      <button
        onClick={() => setFabModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#C8A24B' }}
        aria-label={t.postListing}
      >
        <Plus size={26} className="text-white" />
      </button>

      {fabModalOpen && <PostListingModal onClose={() => setFabModalOpen(false)} />}
    </div>
  );
}