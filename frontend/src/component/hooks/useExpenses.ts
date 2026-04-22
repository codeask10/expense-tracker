import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchExpenses } from '../services/expense.api';
import type { Expense, ExpenseFilters, PaginatedResponse } from '../../types/expense';

export const EXPENSES_KEY_BASE = 'expenses' as const;

export function buildQueryKey(filters: ExpenseFilters) {
  const { search: _omit, ...apiParams } = filters;
  return [EXPENSES_KEY_BASE, apiParams] as const;
}

export type ExpensesQueryKey = ReturnType<typeof buildQueryKey>;
export type ExpensesInfiniteData = InfiniteData<PaginatedResponse>;

function filterBySearch(expenses: Expense[], search: string): Expense[] {
  if (!search.trim()) return expenses;
  const q = search.toLowerCase();
  return expenses.filter(
    (e) => e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q),
  );
}

export function useExpenses(filters: ExpenseFilters) {
  const queryKey = buildQueryKey(filters);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchExpenses({ ...filters, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    staleTime: 30_000,
    retry: 2,
  });

  const allExpenses: Expense[] = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  const filtered: Expense[] = useMemo(
    () => filterBySearch(allExpenses, filters.search),
    [allExpenses, filters.search],
  );

  const totalCount = query.data?.pages[0]?.total ?? 0;

  return { ...query, queryKey, allExpenses, filtered, totalCount };
}
