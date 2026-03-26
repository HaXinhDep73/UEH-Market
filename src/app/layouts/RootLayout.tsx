import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { auth } from '../firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseClient';

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [adminGateChecked, setAdminGateChecked] = useState(false);
  const [adminAllowed, setAdminAllowed] = useState(false);

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
        const snap = await getDoc(doc(db, 'users', user.uid));
        const role = snap.exists() ? (snap.data() as any).role : 'user';
        const allowed = role === 'admin';

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
    </div>
  );
}