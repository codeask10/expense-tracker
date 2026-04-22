import type { ExpenseFilters, SortBy, SortOrder } from '../types';

const SORT_BY_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'date',     label: 'Sort by Date' },
  { value: 'category', label: 'Sort by Category' },
];

const ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc',  label: 'Ascending' },
];

const CATEGORIES = [
  'All', 'Food', 'Transportation', 'Housing', 'Healthcare',
  'Entertainment', 'Shopping', 'Education', 'Utilities', 'Other',
];

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onChange: (patch: Partial<ExpenseFilters>) => void;
}

export function ExpenseFiltersBar({ filters, onChange }: ExpenseFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search (client-side) */}
      <div className="relative flex-1 min-w-[180px]">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </span>
        <input
          type="search"
          placeholder="Search expenses…"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="input-field pl-9"
        />
      </div>

      {/* Category (server-side) */}
      <select
        value={filters.category ?? 'All'}
        onChange={(e) => onChange({ category: e.target.value })}
        className="input-field w-auto"
      >
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Sort field (server-side) */}
      <select
        value={filters.sortBy}
        onChange={(e) => onChange({ sortBy: e.target.value as SortBy })}
        className="input-field w-auto"
      >
        {SORT_BY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Order (server-side) */}
      <select
        value={filters.order}
        onChange={(e) => onChange({ order: e.target.value as SortOrder })}
        className="input-field w-auto"
      >
        {ORDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
