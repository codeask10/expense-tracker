export interface Expense {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface CreateExpensePayload {
  amount: number;
  category: string;
  description: string;
  date: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export type SortBy = 'date' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface ExpenseQueryParams {
  category?: string;
  sortBy: SortBy;
  order: SortOrder;
}

export interface ExpenseFilters extends ExpenseQueryParams {
  search: string;
}

export interface PaginatedResponse {
  data: Expense[];
  total: number;
  limit: number;
  offset: number;
}

export interface ExpenseStats {
  totalExpense: number;
  thisMonthExpense: number;
  averageExpense: number;
}

export interface CategoryBreakdown {
  name: string;
  amount: number;
}

export interface MonthData {
  month: string;
  total: number;
  categories: CategoryBreakdown[];
}

export interface MonthlyDistributionResponse {
  year: number;
  availableYears: number[];
  monthlyData: MonthData[];
}
