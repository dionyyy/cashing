import type { CategoryDef, PaymentMethod } from '@/types';

/**
 * Fixed category catalog. Kept in code (not the DB) so icons and colors
 * ship with the app and transactions reference stable ids.
 */
export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { id: 'food', label: 'Food & Dining', icon: 'UtensilsCrossed', type: 'expense', color: '#E0761F' },
  { id: 'groceries', label: 'Groceries', icon: 'ShoppingCart', type: 'expense', color: '#2E9E5B' },
  { id: 'transport', label: 'Transport', icon: 'Bus', type: 'expense', color: '#3B82F6' },
  { id: 'bills', label: 'Bills & Utilities', icon: 'ReceiptText', type: 'expense', color: '#8B5CF6' },
  { id: 'rent', label: 'Rent & Housing', icon: 'House', type: 'expense', color: '#0EA5A3' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag', type: 'expense', color: '#EC4899' },
  { id: 'health', label: 'Health', icon: 'HeartPulse', type: 'expense', color: '#EF4444' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Clapperboard', type: 'expense', color: '#F59E0B' },
  { id: 'education', label: 'Education', icon: 'GraduationCap', type: 'expense', color: '#6366F1' },
  { id: 'other-expense', label: 'Other', icon: 'Ellipsis', type: 'expense', color: '#6E7270' },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { id: 'salary', label: 'Salary', icon: 'Wallet', type: 'income', color: '#107A57' },
  { id: 'freelance', label: 'Freelance', icon: 'Laptop', type: 'income', color: '#0D9488' },
  { id: 'business', label: 'Business', icon: 'Store', type: 'income', color: '#2563EB' },
  { id: 'investment', label: 'Investments', icon: 'TrendingUp', type: 'income', color: '#7C3AED' },
  { id: 'gift', label: 'Gifts', icon: 'Gift', type: 'income', color: '#DB2777' },
  { id: 'other-income', label: 'Other', icon: 'Ellipsis', type: 'income', color: '#6E7270' },
];

export const ALL_CATEGORIES: CategoryDef[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

const CATEGORY_MAP: Record<string, CategoryDef> = Object.fromEntries(
  ALL_CATEGORIES.map((c) => [c.id, c]),
);

export function getCategory(id: string | null | undefined): CategoryDef | undefined {
  if (!id) return undefined;
  return CATEGORY_MAP[id];
}

export function categoriesForType(type: 'income' | 'expense'): CategoryDef[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'Cash', icon: 'Banknote' },
  { id: 'card', label: 'Card', icon: 'CreditCard' },
  { id: 'bank', label: 'Bank Transfer', icon: 'Landmark' },
  { id: 'ewallet', label: 'E-Wallet', icon: 'Smartphone' },
  { id: 'other', label: 'Other', icon: 'Ellipsis' },
];
