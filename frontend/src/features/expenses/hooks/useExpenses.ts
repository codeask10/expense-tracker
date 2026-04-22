import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchExpenses } from '../services/expense.api';
import { filterBySearch } from '../utils/expense.utils';
import type { Expense, ExpenseFilters, PaginatedResponse } from '../types';

export const EXPENSES_KEY_BASE = 'expenses' as const;

// Derive a stable query key from only the server-side params (search is client-side)
export function buildQueryKey(filters: ExpenseFilters) {
  const { search: _omit, ...apiParams } = filters;
  return [EXPENSES_KEY_BASE, apiParams] as const;
}

export type ExpensesQueryKey = ReturnType<typeof buildQueryKey>;
export type ExpensesInfiniteData = InfiniteData<PaginatedResponse>;

export function useExpenses(filters: ExpenseFilters) {
  const queryKey = buildQueryKey(filters);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchExpenses({ ...filters, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    staleTime: 30_000,
    retry: 2,
  });

  // All expenses from every loaded page
  const allExpenses: Expense[] = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data]
  );

  // Client-side search applied on top of server-filtered data
  const filtered: Expense[] = useMemo(
    () => filterBySearch(allExpenses, filters.search),
    [allExpenses, filters.search]
  );

  const totalCount = query.data?.pages[0]?.total ?? 0;

  return { ...query, queryKey, allExpenses, filtered, totalCount };
}
