import type { Budget, Transaction } from '@/types';
import {
  budgetProgress,
  clampRatio,
  inPeriod,
  incomeByCategory,
  spendByCategory,
  summarize,
} from '@/utils/finance';

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: Math.random().toString(),
    type: 'expense',
    amount: 1000,
    description: 'test',
    categoryId: 'food',
    date: '2026-10-10',
    paymentMethod: null,
    notes: null,
    createdAt: '',
    updatedAt: '',
    ...partial,
  };
}

describe('summarize', () => {
  it('computes balance as income minus expenses', () => {
    const result = summarize([
      tx({ type: 'income', amount: 500000 }),
      tx({ type: 'expense', amount: 120000 }),
      tx({ type: 'expense', amount: 30000 }),
    ]);
    expect(result.income).toBe(500000);
    expect(result.expenses).toBe(150000);
    expect(result.balance).toBe(350000);
  });

  it('returns zeros for an empty ledger', () => {
    expect(summarize([])).toEqual({ income: 0, expenses: 0, balance: 0 });
  });

  it('can produce a negative balance when overspending', () => {
    const result = summarize([
      tx({ type: 'income', amount: 10000 }),
      tx({ type: 'expense', amount: 25000 }),
    ]);
    expect(result.balance).toBe(-15000);
  });
});

describe('period filtering', () => {
  it('keeps only transactions within the period', () => {
    const data = [
      tx({ date: '2026-10-01' }),
      tx({ date: '2026-10-31' }),
      tx({ date: '2026-09-30' }),
      tx({ date: '2026-11-01' }),
    ];
    expect(inPeriod(data, '2026-10')).toHaveLength(2);
  });
});

describe('category grouping', () => {
  it('groups and ranks expense spend by category', () => {
    const result = spendByCategory([
      tx({ categoryId: 'food', amount: 1000 }),
      tx({ categoryId: 'food', amount: 2000 }),
      tx({ categoryId: 'transport', amount: 5000 }),
      tx({ categoryId: 'salary', type: 'income', amount: 99999 }),
    ]);
    expect(result[0]).toEqual({ categoryId: 'transport', total: 5000 });
    expect(result[1]).toEqual({ categoryId: 'food', total: 3000 });
    expect(result).toHaveLength(2); // income excluded
  });

  it('groups income by category', () => {
    const result = incomeByCategory([
      tx({ categoryId: 'salary', type: 'income', amount: 500000 }),
      tx({ categoryId: 'food', type: 'expense', amount: 1000 }),
    ]);
    expect(result).toEqual([{ categoryId: 'salary', total: 500000 }]);
  });
});

describe('budgetProgress', () => {
  const overall: Budget = {
    id: 'b1',
    categoryId: null,
    limit: 100000,
    period: '2026-10',
    createdAt: '',
    updatedAt: '',
  };

  it('sums all expenses for an overall budget', () => {
    const result = budgetProgress(overall, [
      tx({ amount: 40000, categoryId: 'food' }),
      tx({ amount: 30000, categoryId: 'transport' }),
      tx({ type: 'income', amount: 999999 }),
    ]);
    expect(result.spent).toBe(70000);
    expect(result.remaining).toBe(30000);
    expect(result.ratio).toBeCloseTo(0.7);
    expect(result.overspent).toBe(false);
  });

  it('flags overspending and negative remaining', () => {
    const result = budgetProgress(overall, [tx({ amount: 130000 })]);
    expect(result.spent).toBe(130000);
    expect(result.remaining).toBe(-30000);
    expect(result.overspent).toBe(true);
    expect(result.ratio).toBeCloseTo(1.3);
  });

  it('scopes category budgets to their category only', () => {
    const categoryBudget: Budget = { ...overall, categoryId: 'food', limit: 50000 };
    const result = budgetProgress(categoryBudget, [
      tx({ amount: 20000, categoryId: 'food' }),
      tx({ amount: 90000, categoryId: 'transport' }),
    ]);
    expect(result.spent).toBe(20000);
    expect(result.remaining).toBe(30000);
  });
});

describe('clampRatio', () => {
  it('clamps to the 0..1 range', () => {
    expect(clampRatio(-0.5)).toBe(0);
    expect(clampRatio(0.5)).toBe(0.5);
    expect(clampRatio(1.5)).toBe(1);
    expect(clampRatio(Infinity)).toBe(1);
  });
});
