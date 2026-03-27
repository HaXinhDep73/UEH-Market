import type { Timestamp } from 'firebase/firestore';

export const STUDENT_EMAIL_SUFFIX = '@st.ueh.edu.vn';
export const DEFAULT_ADMIN_EMAIL = 'anniversary@ueh.vn';

export function isStudentEmail(email: string) {
  return email.endsWith(STUDENT_EMAIL_SUFFIX);
}

export function getStudentIdFromEmail(email: string) {
  return email.split('@')[0] ?? '';
}

// UI category IDs (your existing router params) -> Firestore category strings (spec).
export const UI_CATEGORY_TO_FIRESTORE_CATEGORY = {
  agriculture: 'Nông sản',
  food: 'thực phẩm',
  'home-appliances': 'đồ gia dụng',
  cosmetics: 'mỹ phẩm',
  'university-merch': 'danh mục sản phẩm ueh',
} as const;

export const FIRESTORE_CATEGORY_TO_UI_CATEGORY_ID = {
  'Nông sản': 'agriculture',
  'thực phẩm': 'food',
  'đồ gia dụng': 'home-appliances',
  'mỹ phẩm': 'cosmetics',
  'danh mục sản phẩm ueh': 'university-merch',
} as const;

export function mapUiCategoryIdToFirestoreCategory(uiCategoryId: string) {
  return (UI_CATEGORY_TO_FIRESTORE_CATEGORY as Record<string, string>)[uiCategoryId] ?? null;
}

export function mapFirestoreCategoryToUiCategoryId(firestoreCategory: string) {
  return (FIRESTORE_CATEGORY_TO_UI_CATEGORY_ID as Record<string, string>)[firestoreCategory] ?? null;
}

export function formatTimestampToYYYYMMDD(ts?: Timestamp | Date | null) {
  if (!ts) return '';
  const d = (ts as any).toDate ? (ts as Timestamp).toDate() : (ts as Date);
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

