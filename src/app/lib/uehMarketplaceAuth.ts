import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseClient';
import { DEFAULT_ADMIN_EMAIL } from './uehMarketplaceFirebase';

// -----------------------------------------------------------------
// Permission types
// -----------------------------------------------------------------

export const ALL_PERMISSIONS = [
  'manage_products',
  'manage_ratings',
  'manage_users',
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export interface AdminProfile {
  /** True if role === 'admin' OR has any permissions (or is master) */
  isAdmin: boolean;
  /** The specific permissions granted. Master admin always has ALL_PERMISSIONS. */
  permissions: Permission[];
  /** True only for anniversary@ueh.vn — bypasses all permission checks */
  isMaster: boolean;
}

const EMPTY_PROFILE: AdminProfile = {
  isAdmin: false,
  permissions: [],
  isMaster: false,
};

// -----------------------------------------------------------------
// Fetch the admin profile for any uid
// -----------------------------------------------------------------

export async function fetchAdminProfile(uid: string, email?: string): Promise<AdminProfile> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return EMPTY_PROFILE;

    const data = snap.data() as {
      role?: string;
      email?: string;
      permissions?: string[];
    };

    const resolvedEmail = email ?? data.email ?? '';
    const isMaster = resolvedEmail === DEFAULT_ADMIN_EMAIL;

    if (isMaster) {
      return {
        isAdmin: true,
        permissions: [...ALL_PERMISSIONS],
        isMaster: true,
      };
    }

    const role = data.role ?? 'user';
    const rawPerms: string[] = Array.isArray(data.permissions) ? data.permissions : [];
    const permissions = rawPerms.filter((p): p is Permission =>
      (ALL_PERMISSIONS as readonly string[]).includes(p)
    );

    // A user counts as "admin" if role is 'admin' OR they have any permissions
    const isAdmin = role === 'admin' || permissions.length > 0;

    return { isAdmin, permissions, isMaster: false };
  } catch {
    return EMPTY_PROFILE;
  }
}

// -----------------------------------------------------------------
// Convenience helpers
// -----------------------------------------------------------------

export function hasPermission(profile: AdminProfile, perm: Permission): boolean {
  if (profile.isMaster) return true;
  return profile.permissions.includes(perm);
}
