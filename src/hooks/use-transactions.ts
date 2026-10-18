import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
  type TransactionFilter,
} from '@/db/repositories/transactions';
import { queryKeys } from '@/lib/query-client';
import type { NewTransaction } from '@/types';

export function useTransactions(filter: TransactionFilter = {}) {
  return useQuery({
    queryKey: queryKeys.transactions(filter),
    queryFn: () => listTransactions(filter),
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.transaction(id ?? ''),
    queryFn: () => getTransaction(id as string),
    enabled: !!id,
  });
}

/** Invalidate everything that depends on the ledger. */
function invalidateLedger(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['transactions'] });
  qc.invalidateQueries({ queryKey: ['transaction'] });
  qc.invalidateQueries({ queryKey: ['budgets'] });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewTransaction) => createTransaction(input),
    onSuccess: () => invalidateLedger(qc),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: NewTransaction }) =>
      updateTransaction(id, input),
    onSuccess: () => invalidateLedger(qc),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => invalidateLedger(qc),
  });
}
