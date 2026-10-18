import { z } from 'zod';

/**
 * Form-level schema. The `amount` field is a string from the text input;
 * we validate it's a positive number, then convert to minor units at submit.
 */
export const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z
    .string()
    .min(1, 'Enter an amount')
    .refine((v) => {
      const n = Number(v.replace(/,/g, ''));
      return Number.isFinite(n) && n > 0;
    }, 'Amount must be greater than zero'),
  description: z
    .string()
    .trim()
    .min(1, 'Add a short description')
    .max(80, 'Keep it under 80 characters'),
  categoryId: z.string().min(1, 'Pick a category'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date'),
  paymentMethod: z
    .enum(['cash', 'card', 'bank', 'ewallet', 'other'])
    .nullable()
    .optional(),
  notes: z.string().max(240, 'Notes are too long').nullable().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
