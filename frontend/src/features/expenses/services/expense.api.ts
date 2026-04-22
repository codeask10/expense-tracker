import { v4 as uuidv4 } from 'uuid';
import { apiClient } from '../../../lib/axios';
import type {
  Expense,
  CreateExpensePayload,
  UpdateExpensePayload,
  PaginatedResponse,
  ExpenseQueryParams,
} from '../types';

const PAGE_LIMIT = 20;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function fetchExpenses(
  params: ExpenseQueryParams & { offset: number; limit?: number }
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

export { PAGE_LIMIT };
