import type { Expense } from '../types';

// ─── Currency ─────────────────────────────────────────────────────────────────

const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

export function formatRupees(paise: number): string {
  return rupeeFormatter.format(paise / 100);
}

// ─── Category config ─────────────────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<string, { color: string; bg: string; text: string; border: string }> = {
  Food:           { color: '#ef4444', bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  Transportation: { color: '#14b8a6', bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-200' },
  Transport:      { color: '#14b8a6', bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-200' },
  Entertainment:  { color: '#3b82f6', bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
  Shopping:       { color: '#22c55e', bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200' },
  Health:         { color: '#a855f7', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  Healthcare:     { color: '#a855f7', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  Utilities:      { color: '#eab308', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  Housing:        { color: '#8b5cf6', bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  Education:      { color: '#06b6d4', bg: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-200' },
  Other:          { color: '#6b7280', bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200' },
};

export function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG['Other'];
}

// ─── Search filter (client-side only) ────────────────────────────────────────

export function filterBySearch(expenses: Expense[], search: string): Expense[] {
  if (!search.trim()) return expenses;
  const q = search.toLowerCase();
  return expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
  );
}

// ─── Summary stats ────────────────────────────────────────────────────────────

export interface SummaryStats {
  totalAmount: number;
  totalCount: number;         // from server (all records)
  loadedCount: number;        // from local pages
  thisMonthAmount: number;
  thisMonthCount: number;
  average: number;
}

export function computeSummary(expenses: Expense[], serverTotal: number): SummaryStats {
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const now = new Date();

  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  return {
    totalAmount,
    totalCount: serverTotal,
    loadedCount: expenses.length,
    thisMonthAmount: thisMonth.reduce((s, e) => s + e.amount, 0),
    thisMonthCount: thisMonth.length,
    average: expenses.length > 0 ? Math.round(totalAmount / expenses.length) : 0,
  };
}

// ─── Chart data ───────────────────────────────────────────────────────────────

export interface CategoryBar {
  category: string;
  amount: number;        // paise
  pct: number;           // % of total spend
  relHeight: number;     // % of tallest bar (for visual height)
}

export function buildCategoryBars(expenses: Expense[]): CategoryBar[] {
  if (expenses.length === 0) return [];

  const totals: Record<string, number> = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.amount;
  }

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);
  const maxAmount = Math.max(...Object.values(totals));

  return Object.entries(totals)
    .sort(([, a], [, b]) => b - a)   // descending by amount
    .map(([category, amount]) => ({
      category,
      amount,
      pct: (amount / grandTotal) * 100,
      relHeight: (amount / maxAmount) * 100,
    }));
}
