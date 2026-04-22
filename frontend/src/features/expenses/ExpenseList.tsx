import { useState } from 'react';
import { useExpenses, Expense } from './useExpenses';
import { formatRupees } from '../../utils/currency';
import { SkeletonRow } from '../../components/SkeletonRow';

const CATEGORIES = [
  'All',
  'Food',
  'Transport',
  'Housing',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Utilities',
  'Other',
];

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-700',
  Transport: 'bg-blue-100 text-blue-700',
  Housing: 'bg-purple-100 text-purple-700',
  Healthcare: 'bg-red-100 text-red-700',
  Entertainment: 'bg-pink-100 text-pink-700',
  Shopping: 'bg-yellow-100 text-yellow-700',
  Education: 'bg-green-100 text-green-700',
  Utilities: 'bg-gray-100 text-gray-700',
  Other: 'bg-slate-100 text-slate-700',
};

export function ExpenseList() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState<'date_desc' | 'date_asc'>('date_desc');

  const { data: expenses, isLoading, isError, error, refetch } = useExpenses({
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    sort,
  });

  const total = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);

  // Category summary
  const summary = (expenses ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'date_desc' | 'date_asc')}
          className="input-field w-auto text-xs"
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
        </select>
      </div>

      {/* Total + Category Summary */}
      {!isLoading && !isError && expenses && expenses.length > 0 && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              {selectedCategory === 'All' ? 'Total Expenses' : `${selectedCategory} Total`}
            </span>
            <span className="text-xl font-bold text-gray-900">
              {formatRupees(total)}
            </span>
          </div>
          {selectedCategory === 'All' && Object.keys(summary).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              {Object.entries(summary)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <span
                    key={cat}
                    className={`rounded-lg px-2 py-1 text-xs font-medium ${
                      CATEGORY_COLORS[cat] ?? 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {cat}: {formatRupees(amount)}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Expense Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <table className="w-full text-sm">
            <TableHead />
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={5} />
              ))}
            </tbody>
          </table>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-red-600 font-medium">
              {error instanceof Error ? error.message : 'Failed to load expenses'}
            </p>
            <button onClick={() => refetch()} className="btn-secondary mt-4">
              Retry
            </button>
          </div>
        ) : expenses && expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TableHead />
              <tbody className="divide-y divide-gray-100">
                {expenses.map((expense) => (
                  <ExpenseRow key={expense._id} expense={expense} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState category={selectedCategory} />
        )}
      </div>
    </div>
  );
}

function TableHead() {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        {['Date', 'Category', 'Description', 'Amount', ''].map((h) => (
          <th
            key={h}
            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function ExpenseRow({ expense }: { expense: Expense }) {
  const date = new Date(expense.date);
  const colorClass =
    CATEGORY_COLORS[expense.category] ?? 'bg-slate-100 text-slate-700';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
        <time dateTime={expense.date}>
          {date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </time>
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
          {expense.category}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
        {expense.description}
      </td>
      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
        {formatRupees(expense.amount)}
      </td>
      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
        {new Date(expense.createdAt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </td>
    </tr>
  );
}

function EmptyState({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-3">📭</div>
      <p className="font-medium text-gray-700">No expenses found</p>
      <p className="text-sm text-gray-400 mt-1">
        {category === 'All'
          ? 'Add your first expense using the form above.'
          : `No expenses in the "${category}" category.`}
      </p>
    </div>
  );
}
