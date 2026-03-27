import { useState, useRef } from 'react';
import { X, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseClient';
import { useLanguage } from '../i18n/LanguageProvider';
import { translations } from '../i18n/i18n';
import {
  ALL_PERMISSIONS,
  type Permission,
  type AdminProfile,
} from '../lib/uehMarketplaceAuth';

interface UserRow {
  id: string;
  email: string;
  role: 'admin' | 'user';
  permissions: Permission[];
  displayName?: string;
}

interface Props {
  targetUser: UserRow;
  /** The currently-logged-in admin's profile — used to lock the manage_users checkbox */
  currentAdminProfile: AdminProfile;
  onClose: () => void;
  onSaved: (updatedUser: UserRow) => void;
}

export function AssignPermissionsModal({ targetUser, currentAdminProfile, onClose, onSaved }: Props) {
  const { lang } = useLanguage();
  const t = translations[lang].admin;

  const [selected, setSelected] = useState<Set<Permission>>(
    new Set(targetUser.permissions)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canGrantManageUsers =
    currentAdminProfile.isMaster ||
    currentAdminProfile.permissions.includes('manage_users');

  const permConfig: {
    key: Permission;
    label: string;
    desc: string;
    locked?: boolean;
    lockedReason?: string;
  }[] = [
    {
      key: 'manage_products',
      label: t.permManageProducts,
      desc: t.permManageProductsDesc,
    },
    {
      key: 'manage_ratings',
      label: t.permManageRatings,
      desc: t.permManageRatingsDesc,
    },
    {
      key: 'manage_users',
      label: t.permManageUsers,
      desc: t.permManageUsersDesc,
      locked: !canGrantManageUsers,
      lockedReason: t.permManageUsersLocked,
    },
  ];

  const toggle = (perm: Permission) => {
    const next = new Set(selected);
    if (next.has(perm)) next.delete(perm);
    else next.add(perm);
    setSelected(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const permsArray = [...selected];
      const newRole: 'admin' | 'user' = permsArray.length > 0 ? 'admin' : 'user';

      await updateDoc(doc(db, 'users', targetUser.id), {
        role: newRole,
        permissions: permsArray,
      });

      onSaved({ ...targetUser, role: newRole, permissions: permsArray });
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const noneSelected = selected.size === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={!saving ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50">
                <ShieldCheck size={18} className="text-blue-700" />
              </div>
              <div>
                <h2 className="font-bold text-base text-gray-800">{t.permModalTitle}</h2>
                <p className="text-xs text-gray-400 mt-0.5 max-w-[240px] truncate">
                  {targetUser.displayName || targetUser.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-sm text-gray-500 mb-5">{t.permModalSubtitle}</p>

            <div className="space-y-3">
              {permConfig.map((perm) => {
                const isChecked = selected.has(perm.key);
                const isLocked = perm.locked ?? false;

                return (
                  <label
                    key={perm.key}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isLocked
                        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                        : isChecked
                        ? 'border-blue-200 bg-blue-50/60'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isLocked}
                      onChange={() => !isLocked && toggle(perm.key)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        {perm.label}
                        {isLocked && (
                          <span className="text-xs font-normal text-gray-400 flex items-center gap-1">
                            <ShieldOff size={11} />
                            {perm.lockedReason}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 leading-snug mt-0.5">{perm.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Warning when none selected */}
            {noneSelected && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
                <ShieldOff size={14} className="flex-shrink-0 mt-0.5" />
                <span>{t.permNoneWarning}</span>
              </div>
            )}

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t.permCancel}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#1B3A6B' }}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {t.permSaving}
                </>
              ) : (
                t.permSave
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
