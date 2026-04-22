import { useQuery } from '@tanstack/react-query';
import { fetchExpenseStats } from '../services/expense.api';
import type { ExpenseStats } from '../../types/expense';

export const EXPENSE_STATS_KEY = ['expense-stats'] as const;

export function useExpenseStats() {
  return useQuery<ExpenseStats>({
    queryKey: EXPENSE_STATS_KEY,
    queryFn: fetchExpenseStats,
    staleTime: 60_000,
  });
}
