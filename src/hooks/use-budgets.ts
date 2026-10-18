import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteBudget,
  listBudgets,
  upsertBudget,
} from '@/db/repositories/budgets';
import { queryKeys } from '@/lib/query-client';
import type { NewBudget } from '@/types';

export function useBudgets(period?: string) {
  return useQuery({
    queryKey: queryKeys.budgets(period),
    queryFn: () => listBudgets(period),
  });
}

export function useUpsertBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewBudget) => upsertBudget(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
}
