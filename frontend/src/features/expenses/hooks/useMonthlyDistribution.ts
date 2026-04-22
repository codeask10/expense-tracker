import { useQuery } from '@tanstack/react-query';
import { fetchMonthlyDistribution } from '../services/expense.api';
import type { MonthlyDistributionResponse } from '../types';

export const MONTHLY_DISTRIBUTION_KEY = 'monthly-distribution' as const;

export function useMonthlyDistribution(year?: number) {
  return useQuery<MonthlyDistributionResponse>({
    queryKey: [MONTHLY_DISTRIBUTION_KEY, year],
    queryFn: () => fetchMonthlyDistribution(year),
    staleTime: 60_000,
  });
}
