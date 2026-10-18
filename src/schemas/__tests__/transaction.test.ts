import { transactionFormSchema } from '@/schemas/transaction';

const valid = {
  type: 'expense' as const,
  amount: '12.50',
  description: 'Lunch',
  categoryId: 'food',
  date: '2026-10-18',
  paymentMethod: 'cash' as const,
  notes: null,
};

describe('transactionFormSchema', () => {
  it('accepts a valid transaction', () => {
    expect(transactionFormSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a non-positive amount', () => {
    expect(transactionFormSchema.safeParse({ ...valid, amount: '0' }).success).toBe(false);
    expect(transactionFormSchema.safeParse({ ...valid, amount: '-5' }).success).toBe(false);
    expect(transactionFormSchema.safeParse({ ...valid, amount: 'abc' }).success).toBe(false);
  });

  it('requires a description', () => {
    const result = transactionFormSchema.safeParse({ ...valid, description: '   ' });
    expect(result.success).toBe(false);
  });

  it('requires a category', () => {
    expect(transactionFormSchema.safeParse({ ...valid, categoryId: '' }).success).toBe(false);
  });

  it('rejects malformed dates', () => {
    expect(transactionFormSchema.safeParse({ ...valid, date: '18-10-2026' }).success).toBe(false);
    expect(transactionFormSchema.safeParse({ ...valid, date: 'today' }).success).toBe(false);
  });

  it('allows optional payment method and notes', () => {
    const result = transactionFormSchema.safeParse({
      ...valid,
      paymentMethod: null,
      notes: null,
    });
    expect(result.success).toBe(true);
  });
});
