import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../../services/api';

export interface Expense {
  _id: string;
  amount: number;        // in paise
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface CreateExpensePayload {
  amount: number;        // in rupees — service converts to paise
  category: string;
  description: string;
  date: string;
}

export interface GetExpensesParams {
  category?: string;
  sort?: 'date_desc' | 'date_asc';
}

async function fetchExpenses(params: GetExpensesParams): Promise<Expense[]> {
  const { data } = await api.get<{ success: boolean; data: Expense[] }>('/', {
    params: {
      ...(params.category ? { category: params.category } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
    },
  });
  return data.data;
}

async function postExpense(payload: CreateExpensePayload): Promise<Expense> {
  const idempotencyKey = uuidv4();
  const { data } = await api.post<{ success: boolean; data: Expense }>(
    '/',
    payload,
    { headers: { 'Idempotency-Key': idempotencyKey } }
  );
  return data.data;
}

export function useExpenses(params: GetExpensesParams = {}) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => fetchExpenses(params),
    staleTime: 30_000,
    retry: 2,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
