export interface Expense {
  _id: string;
  amount: number;      // paise
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface CreateExpensePayload {
  amount: number;      // rupees
  category: string;
  description: string;
  date: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export type SortBy = 'date' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface ExpenseQueryParams {
  category?: string;   // undefined or 'All' → no filter
  sortBy: SortBy;
  order: SortOrder;
}

export interface ExpenseFilters extends ExpenseQueryParams {
  search: string;      // client-side only — not sent to API
}

export interface PaginatedResponse {
  data: Expense[];
  total: number;       // count of ALL matching records
  limit: number;
  offset: number;
}

export interface ExpenseStats {
  totalExpense: number;       // paise
  thisMonthExpense: number;   // paise
  averageExpense: number;     // paise
}

export interface CategoryBreakdown {
  name: string;
  amount: number; // paise
}

export interface MonthData {
  month: string;   // "Jan" … "Dec"
  total: number;   // paise
  categories: CategoryBreakdown[];
}

export interface MonthlyDistributionResponse {
  year: number;
  availableYears: number[];
  monthlyData: MonthData[];
}
