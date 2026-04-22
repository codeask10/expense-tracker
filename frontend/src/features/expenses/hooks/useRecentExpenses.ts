import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchRecentExpenses } from "../services/expense.api";
import type { Expense, PaginatedResponse } from "../types";

export const RECENT_EXPENSES_KEY_BASE = "recent-expenses" as const;

export function buildRecentQueryKey() {
  return [RECENT_EXPENSES_KEY_BASE] as const;
}

export type RecentExpensesQueryKey = ReturnType<typeof buildRecentQueryKey>;
export type RecentExpensesInfiniteData = InfiniteData<PaginatedResponse>;

export function useRecentExpenses() {
  const queryKey = buildRecentQueryKey();

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchRecentExpenses({ offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    staleTime: 30_000,
    retry: 2,
  });

  // All recent expenses from every loaded page
  const allRecentExpenses: Expense[] = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  const totalCount = query.data?.pages[0]?.total ?? 0;

  return { ...query, queryKey, allRecentExpenses, totalCount };
}
