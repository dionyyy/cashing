/**
 * Core domain types for Cashing.
 *
 * Money is always stored and passed around as integer MINOR units
 * (e.g. centavos / cents) to avoid floating point drift. Only format
 * to a decimal string at the display boundary.
 */

export type Minor = number;

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'card' | 'bank' | 'ewallet' | 'other';

export interface CategoryDef {
  id: string;
  label: string;
  /** Lucide icon name used by CategoryBadge. */
  icon: string;
  type: TransactionType;
  /** Tailwind-ish accent token: 'primary' | 'negative' | hex handled in UI. */
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Positive integer in minor units. Sign is derived from `type`. */
  amount: Minor;
  description: string;
  categoryId: string;
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  /** null = overall monthly budget; otherwise category-scoped. */
  categoryId: string | null;
  /** Spending limit in minor units. */
  limit: Minor;
  /** Budget period month, formatted YYYY-MM. */
  period: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewTransaction {
  type: TransactionType;
  amount: Minor;
  description: string;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
}

export interface NewBudget {
  categoryId: string | null;
  limit: Minor;
  period: string;
}

export interface BalanceSummary {
  balance: Minor;
  income: Minor;
  expenses: Minor;
}

export interface CategorySpend {
  categoryId: string;
  total: Minor;
}

export interface BudgetProgress {
  budget: Budget;
  spent: Minor;
  remaining: Minor;
  /** 0..1 ratio (can exceed 1 when overspent). */
  ratio: number;
  overspent: boolean;
}

export type ThemePreference = 'light' | 'dark' | 'system';
