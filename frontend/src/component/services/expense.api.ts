import { v4 as uuidv4 } from 'uuid';
import { apiClient } from '../../lib/axios';
import type {
  Expense,
  CreateExpensePayload,
  UpdateExpensePayload,
  PaginatedResponse,
  ExpenseQueryParams,
  ExpenseStats,
  MonthlyDistributionResponse,
} from '../../types/expense';

const PAGE_LIMIT = 20;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function fetchExpenses(
  params: ExpenseQueryParams & { offset: number; limit?: number },
): Promise<PaginatedResponse> {
  const { category, sortBy, order, offset, limit = PAGE_LIMIT } = params;
  const query: Record<string, string | number> = { sortBy, order, limit, offset };
  if (category && category !== 'All') query.category = category;

  const { data } = await apiClient.get<{ success: boolean } & PaginatedResponse>('/expenses', {
    params: query,
  });
  return { data: data.data, total: data.total, limit: data.limit, offset: data.offset };
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  const { data } = await apiClient.post<ApiResponse<Expense>>('/expenses', payload, {
    headers: { 'Idempotency-Key': uuidv4() },
  });
  return data.data;
}

export async function updateExpense(id: string, payload: UpdateExpensePayload): Promise<Expense> {
  const { data } = await apiClient.patch<ApiResponse<Expense>>(`/expenses/${id}`, payload);
  return data.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}

export async function fetchExpenseStats(): Promise<ExpenseStats> {
  const { data } = await apiClient.get<{ success: boolean; data: ExpenseStats }>('/expenses/stats');
  return data.data;
}

export async function fetchMonthlyDistribution(year?: number): Promise<MonthlyDistributionResponse> {
  const params: Record<string, number> = {};
  if (year !== undefined) params.year = year;
  const { data } = await apiClient.get<{ success: boolean; data: MonthlyDistributionResponse }>(
    '/expenses/monthly-distribution',
    { params },
  );
  return data.data;
}

export async function fetchRecentExpenses(params: {
  offset: number;
  limit?: number;
}): Promise<PaginatedResponse> {
  const { offset, limit = 10 } = params;
  const { data } = await apiClient.get<{ success: boolean } & PaginatedResponse>('/expenses/recent', {
    params: { limit, offset },
  });
  return { data: data.data, total: data.total, limit: data.limit, offset: data.offset };
}

export { PAGE_LIMIT };
