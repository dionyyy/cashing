import { z } from 'zod';

export const budgetFormSchema = z.object({
  categoryId: z.string().nullable(),
  limit: z
    .string()
    .min(1, 'Enter a limit')
    .refine((v) => {
      const n = Number(v.replace(/,/g, ''));
      return Number.isFinite(n) && n > 0;
    }, 'Limit must be greater than zero'),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid period'),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
