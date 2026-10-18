import { QueryClient } from '@tanstack/react-query';

/**
 * Single app-wide query client. Data is local (SQLite), so retries are
 * off and data is considered fresh briefly to avoid redundant reads.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

/** Centralized query keys to keep invalidation consistent. */
export const queryKeys = {
  transactions: (filter?: unknown) =>
    filter ? (['transactions', filter] as const) : (['transactions'] as const),
  transaction: (id: string) => ['transaction', id] as const,
  budgets: (period?: string) =>
    period ? (['budgets', period] as const) : (['budgets'] as const),
};
