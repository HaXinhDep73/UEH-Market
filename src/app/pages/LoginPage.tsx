import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2, PartyPopper } from 'lucide-react';
import { IMAGES } from '../data/catalog';
import { auth, db } from '../firebaseClient';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_ADMIN_EMAIL, getStudentIdFromEmail, isStudentEmail } from '../lib/uehMarketplaceFirebase';
import { translations } from '../i18n/i18n';
import { useLanguage } from '../i18n/LanguageProvider';
// @ts-ignore
import backgroundBg from '../../assets/background.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const { lang, toggleLang } = useLanguage();
  const t = translations[lang].login;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const mapFirebaseAuthErrorToLang = (err: any) => {
    const code = err?.code as string | undefined;
    const message = (err?.message as string | undefined) ?? '';

    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return lang === 'vi' ? 'Sai email hoặc mật khẩu.' : 'Wrong email or password.';
      case 'auth/user-not-found':
        return lang === 'vi' ? 'Không tìm thấy tài khoản với email này.' : 'No account found for this email.';
      case 'auth/email-already-in-use':
        return lang === 'vi' ? 'Email này đã được đăng ký. Vui lòng đăng nhập.' : 'This email is already registered. Please sign in.';
      case 'auth/invalid-email':
        return lang === 'vi' ? 'Email không hợp lệ.' : 'Invalid email format.';
      case 'auth/weak-password':
        return lang === 'vi' ? 'Mật khẩu quá yếu. Vui lòng đặt ít nhất 6 ký tự.' : 'Password is too weak. Use at least 6 characters.';
      case 'auth/operation-not-allowed':
        return lang === 'vi' ? 'Tính năng này hiện không được hỗ trợ.' : 'This operation is not allowed.';
      case 'auth/missing-password':
        return lang === 'vi' ? 'Vui lòng nhập mật khẩu.' : 'Please enter your password.';
      case 'auth/too-many-requests':
        return lang === 'vi' ? 'Quá nhiều lần thử. Vui lòng thử lại sau vài phút.' : 'Too many attempts. Please try again later.';
      default:
        return message || (lang === 'vi' ? 'Xác thực không thành công. Vui lòng thử lại.' : 'Authentication failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== DEFAULT_ADMIN_EMAIL && !isStudentEmail(normalizedEmail)) {
      setError(
        lang === 'vi'
          ? 'Email phải kết thúc bằng @st.ueh.edu.vn để truy cập UEH Market.'
          : 'Email must end with @st.ueh.edu.vn to access UEH Market.'
      );
      return;
    }

    if (password.length < 6) {
      setError(lang === 'vi' ? 'Mật khẩu phải có ít nhất 6 ký tự.' : 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const cred = isLogin
        ? await signInWithEmailAndPassword(auth, normalizedEmail, password)
        : await createUserWithEmailAndPassword(auth, normalizedEmail, password);

      const user = cred.user;
      const role = normalizedEmail === DEFAULT_ADMIN_EMAIL ? 'admin' : 'user';
      const studentId = getStudentIdFromEmail(normalizedEmail);

      const userRef = doc(db, 'users', user.uid);

      // If the user doc doesn't exist yet (e.g., interrupted signup), create it silently.
      // Also covers the case where the user doc exists but is missing fields.
      // Firestore: always explicitly await calls and surface errors.
      let averageRating = 0;
      try {
        const existing = await getDoc(userRef);

        if (existing.exists()) {
          const data = existing.data() as any;
          averageRating = typeof data?.averageRating === 'number' ? data.averageRating : 0;
        }
      } catch (error) {
        console.error('Firestore Error:', error);
        // If security rules block reads, we cannot safely proceed. Re-throw so finally executes.
        throw error;
      }

      try {
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: normalizedEmail,
            studentId,
            role,
            averageRating,
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Firestore Error:', error);
        throw error;
      }

      // Ensure navigation happens immediately after Firestore step.
      navigate('/intro', { replace: true });
      // Extra fallback: if navigation is blocked for any reason.
      // (Should not normally be hit.)
      // eslint-disable-next-line no-restricted-globals
      if (typeof window !== 'undefined' && window.location.pathname !== '/intro') {
        window.location.href = '/intro';
      }
    } catch (err: any) {
      setError(mapFirebaseAuthErrorToLang(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left – Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[#003c71]">
        <img
          src={backgroundBg}
          alt="UEH Campus"
          className="absolute inset-0 w-full h-full object-contain"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(27,58,107,0.88) 0%, rgba(27,58,107,0.65) 100%)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <GraduationCap size={26} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">UEH Market</div>
              <div className="text-blue-200 text-sm">Student Marketplace</div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
            <PartyPopper size={18} className="text-amber-300" />
            <span className="text-white text-sm font-medium">50 Years of Excellence</span>
          </div>
          <h1 className="text-4xl text-white leading-tight mb-4" style={{ fontWeight: 700 }}>
            Đại học Kinh tế<br />TP.HCM (UEH)
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-sm">
            Celebrating 50 years (1976–2026) of shaping Vietnam's future economists, entrepreneurs, and business leaders at Đại học Kinh tế TP.HCM (UEH). Trade with trust among your fellow students.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { number: '50+', label: 'Years of Excellence' },
            { number: '40K+', label: 'Active Students' },
            { number: '100%', label: 'UEH Verified' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-white text-xl font-bold">{stat.number}</div>
              <div className="text-blue-200 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right – Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: '#F4F6F9' }}>
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: '#1B3A6B' }}>
            <GraduationCap size={32} className="text-white" />
          </div>
          <div className="text-xl font-bold" style={{ color: '#1B3A6B' }}>UEH Market</div>
          <div className="text-gray-400 text-sm">Student Marketplace</div>
        </div>

        <div className="w-full max-w-md">
          {/* Language toggle */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleLang}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
              aria-label="Toggle language"
            >
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-gray-900 mb-1.5" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {isLogin ? t.welcomeBack : t.createAccount}
              </h2>
              <p className="text-gray-500 text-sm">
                {isLogin ? t.signInHelper : t.signUpHelper}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" htmlFor="email" style={{ fontWeight: 600 }}>
                  {t.studentEmail}
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@st.ueh.edu.vn"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
                    style={{ '--tw-ring-color': '#1B3A6B' } as React.CSSProperties}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{t.mustEndWith}</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" htmlFor="password" style={{ fontWeight: 600 }}>
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Forgot */}
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-xs hover:underline"
                  style={{ color: '#1B3A6B' }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                >
                  {isLogin ? t.toggleSignUp : t.toggleSignIn}
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 active:scale-[0.99]"
                style={{ backgroundColor: '#1B3A6B' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isLogin ? t.signInSubmitting : t.signUpSubmitting}
                  </>
                ) : (
                  isLogin ? t.signIn : t.signUp
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            {t.onlyUehStudents}
            <span className="font-medium text-gray-500">@st.ueh.edu.vn</span>
            {lang === 'vi' ? ' mới được truy cập nền tảng này.' : ' email may access this platform.'}
          </p>
        </div>
      </div>
    </div>
  );
}
