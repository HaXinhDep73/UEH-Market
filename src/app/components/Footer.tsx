import { GraduationCap, Phone, Mail, BookOpen, Shield, ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router';
import { translations } from '../i18n/i18n';
import { useLanguage } from '../i18n/LanguageProvider';

// Slugs align 1-to-1 with the t.rules label arrays in both VI and EN
const POLICY_SLUGS = [
  'quy-tac-cong-dong',
  'quy-dinh-dang-tin',
  'chinh-sach-danh-gia',
  'mat-hang-bi-cam',
  'giai-quyet-tranh-chap',
  'chinh-sach-bao-mat',
] as const;

export function Footer() {
  const { lang } = useLanguage();
  const t = translations[lang].footer;

  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1B3A6B' }}>
                <GraduationCap size={22} className="text-white" />
              </div>
              <div>
                <div className="font-bold" style={{ color: '#1B3A6B', fontSize: '1.05rem' }}>UEH Market</div>
                <div className="text-xs text-gray-400">{t.tagline}</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              {t.description}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-xs text-gray-400">{t.onlyAccounts}</span>
            </div>
          </div>

          {/* Rules */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen size={14} style={{ color: '#1B3A6B' }} />
              {t.rulesTitle}
            </h3>
            <ul className="space-y-2.5">
              {t.rules.map((rule, idx) => (
                <li key={POLICY_SLUGS[idx] ?? idx}>
                  <Link
                    to={`/policy/${POLICY_SLUGS[idx] ?? idx}`}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 transition-colors group"
                  >
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    {rule}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/* Hotline */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield size={14} style={{ color: '#1B3A6B' }} />
              {t.supportTitle}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <Phone size={15} style={{ color: '#1B3A6B' }} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">{t.phoneLabel}</div>
                  <a
                    href="tel:0933804640"
                    className="text-sm font-bold hover:underline transition-colors"
                    style={{ color: '#1B3A6B' }}
                  >
                    0933 804 640
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <Mail size={15} style={{ color: '#1B3A6B' }} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">{t.emailLabel}</div>
                  <a
                    href="mailto:ueh.anni@gmail.com"
                    className="text-sm font-bold hover:underline transition-colors break-all"
                    style={{ color: '#1B3A6B' }}
                  >
                    ueh.anni@gmail.com
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="text-xs text-amber-700 flex items-center gap-1" style={{ fontWeight: 600 }}>
                  <Clock size={14} /> {t.supportHoursTitle}
                </div>
                <div className="text-xs text-amber-600 mt-1">{t.supportHoursWeekday}</div>
                <div className="text-xs text-amber-600">{t.supportHoursSat}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100" style={{ backgroundColor: '#1B3A6B' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-blue-200">
              {t.copyright}
            </p>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-xs text-blue-300 hover:text-white transition-colors">{t.adminPortal}</Link>
            <a href="#" className="text-xs text-blue-300 hover:text-white transition-colors">{t.terms}</a>
            <a href="#" className="text-xs text-blue-300 hover:text-white transition-colors">{t.privacy}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
