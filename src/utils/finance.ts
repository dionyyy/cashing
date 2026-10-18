import type {
  BalanceSummary,
  Budget,
  BudgetProgress,
  CategorySpend,
  Minor,
  Transaction,
} from '@/types';
import { periodOf } from '@/utils/date';

/**
 * Pure financial calculations derived from the transaction ledger.
 * These are the single source of truth for every number shown in the app.
 *
 * Convention:
 *  - income increases balance
 *  - expenses decrease balance
 *  - all amounts are positive integers in minor units; `type` carries the sign
 */

export function summarize(transactions: Transaction[]): BalanceSummary {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, balance: income - expenses };
}

/** Filter transactions to a single "YYYY-MM" period. */
export function inPeriod(transactions: Transaction[], period: string): Transaction[] {
  return transactions.filter((t) => periodOf(t.date) === period);
}

/** Total expense spend grouped by category, highest first. */
export function spendByCategory(transactions: Transaction[]): CategorySpend[] {
  const totals = new Map<string, Minor>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
  }
  return [...totals.entries()]
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);
}

/** Total income grouped by category. */
export function incomeByCategory(transactions: Transaction[]): CategorySpend[] {
  const totals = new Map<string, Minor>();
  for (const t of transactions) {
    if (t.type !== 'income') continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
  }
  return [...totals.entries()]
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Compute spent/remaining/ratio for a budget against a set of transactions.
 * - Overall budget (categoryId === null): all expenses in the period.
 * - Category budget: only expenses for that category.
 */
export function budgetProgress(
  budget: Budget,
  periodTransactions: Transaction[],
): BudgetProgress {
  const spent = periodTransactions.reduce((sum, t) => {
    if (t.type !== 'expense') return sum;
    if (budget.categoryId !== null && t.categoryId !== budget.categoryId) return sum;
    return sum + t.amount;
  }, 0);

  const remaining = budget.limit - spent;
  const ratio = budget.limit > 0 ? spent / budget.limit : spent > 0 ? Infinity : 0;
  return {
    budget,
    spent,
    remaining,
    ratio,
    overspent: spent > budget.limit,
  };
}

/** Budget usage ratio clamped to 0..1 for progress bars. */
export function clampRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) return 1;
  return Math.max(0, Math.min(1, ratio));
}
