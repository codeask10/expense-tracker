import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { createExpense, updateExpense, deleteExpense } from '../services/expense.api';
import { EXPENSES_KEY_BASE } from './useExpenses';
import { EXPENSE_STATS_KEY } from './useExpenseStats';
import { MONTHLY_DISTRIBUTION_KEY } from './useMonthlyDistribution';
import { RECENT_EXPENSES_KEY } from './useRecentExpenses';
import type { Expense, CreateExpensePayload, PaginatedResponse } from '../../types/expense';
import type { ExpensesQueryKey } from './useExpenses';

export function useCreateExpense(activeQueryKey: ExpensesQueryKey) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createExpense,

    onMutate: async (payload: CreateExpensePayload) => {
      await qc.cancelQueries({ queryKey: activeQueryKey });
      const snapshot = qc.getQueryData<InfiniteData<PaginatedResponse>>(activeQueryKey);

      const optimistic: Expense = {
        _id: `temp_${Date.now()}`,
        amount: Math.round(payload.amount * 100),
        category: payload.category,
        description: payload.description,
        date: payload.date,
        createdAt: new Date().toISOString(),
      };

      qc.setQueryData<InfiniteData<PaginatedResponse>>(activeQueryKey, (old) => {
        if (!old || old.pages.length === 0) return old;
        return {
          ...old,
          pages: old.pages.map((page, i) =>
            i === 0 ? { ...page, data: [optimistic, ...page.data], total: page.total + 1 } : page,
          ),
        };
      });

      return { snapshot };
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.snapshot !== undefined) qc.setQueryData(activeQueryKey, ctx.snapshot);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: [EXPENSES_KEY_BASE] });
      qc.invalidateQueries({ queryKey: EXPENSE_STATS_KEY });
      qc.invalidateQueries({ queryKey: [MONTHLY_DISTRIBUTION_KEY] });
      qc.invalidateQueries({ queryKey: [RECENT_EXPENSES_KEY] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateExpense>[1] }) =>
      updateExpense(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EXPENSES_KEY_BASE] });
      qc.invalidateQueries({ queryKey: EXPENSE_STATS_KEY });
      qc.invalidateQueries({ queryKey: [MONTHLY_DISTRIBUTION_KEY] });
      qc.invalidateQueries({ queryKey: [RECENT_EXPENSES_KEY] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EXPENSES_KEY_BASE] });
      qc.invalidateQueries({ queryKey: EXPENSE_STATS_KEY });
      qc.invalidateQueries({ queryKey: [MONTHLY_DISTRIBUTION_KEY] });
      qc.invalidateQueries({ queryKey: [RECENT_EXPENSES_KEY] });
    },
  });
}
