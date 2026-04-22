import { useMemo, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ExpenseBarChart } from '../components/charts/ExpenseBarChart';
import { ExpenseSummary } from '../features/expenses/components/ExpenseSummary';
import { ExpenseForm } from '../features/expenses/components/ExpenseForm';
import { ExpenseTable } from '../features/expenses/components/ExpenseTable';
import { ExpenseFiltersBar } from '../features/expenses/components/ExpenseFilters';
import { useExpenses } from '../features/expenses/hooks/useExpenses';
import { useCreateExpense } from '../features/expenses/hooks/useCreateExpense';
import { useModal } from '../hooks/useModal';
import { computeSummary, formatRupees } from '../features/expenses/utils/expense.utils';
import type { Expense, ExpenseFilters } from '../features/expenses/types';

const DEFAULT_FILTERS: ExpenseFilters = {
  category: 'All',
  sortBy: 'date',
  order: 'desc',
  search: '',
};

export function Dashboard() {
  const addModal = useModal();
  const editModal = useModal();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);

  const {
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    queryKey,
    allExpenses,
    filtered,
    totalCount,
  } = useExpenses(filters);

  const createMutation = useCreateExpense(queryKey);

  const summary = useMemo(() => computeSummary(allExpenses, totalCount), [allExpenses, totalCount]);

  // Recent = top 5 from all loaded, sorted newest-first
  const recent = useMemo(
    () =>
      [...allExpenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [allExpenses]
  );

  // Category breakdown of all loaded expenses (for chart legend)
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    for (const e of allExpenses) {
      totals[e.category] = (totals[e.category] ?? 0) + e.amount;
      counts[e.category] = (counts[e.category] ?? 0) + 1;
    }
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amount]) => ({ cat, amount, count: counts[cat] }));
  }, [allExpenses]);

  function handleFilterChange(patch: Partial<ExpenseFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function handleEdit(expense: Expense) {
    setEditingExpense(expense);
    editModal.open();
  }

  function handleEditClose() {
    editModal.close();
    setEditingExpense(null);
  }

  return (
    <DashboardLayout onAddExpense={addModal.open}>
      {/* ── KPI cards ── */}
      <ExpenseSummary stats={summary} loading={isLoading} />

      {/* ── Chart + Recent ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-3 fade-up" style={{ animationDelay: '180ms' }}>
          <Card padding="lg" className="h-full">
            <h2 className="font-semibold text-gray-900">Spending by Category</h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-5">All loaded expenses, largest category at 100%</p>

            {isLoading ? (
              <div className="skeleton h-52 w-full rounded-xl" />
            ) : (
              <>
                <ExpenseBarChart expenses={allExpenses} />

                {categoryBreakdown.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-gray-100 pt-3">
                    {categoryBreakdown.map(({ cat, amount, count }) => (
                      <span key={cat} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Badge category={cat} size="sm" />
                        <span>{count} item{count !== 1 ? 's' : ''}</span>
                        <span className="text-gray-300">·</span>
                        <span className="font-medium text-gray-700">{formatRupees(amount)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Recent expenses */}
        <div className="lg:col-span-2 fade-up" style={{ animationDelay: '240ms' }}>
          <Card padding="lg" className="h-full">
            <h2 className="font-semibold text-gray-900">Recent Expenses</h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">Your latest transactions</p>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="skeleton h-3 w-20" />
                      <div className="skeleton h-4 w-36" />
                    </div>
                    <div className="skeleton h-4 w-14" />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400 text-sm">
                <span className="text-3xl mb-2 select-none">💸</span>No expenses yet
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recent.map((e) => (
                  <div key={e._id} className="flex items-start justify-between py-3 first:pt-0 last:pb-0 gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <Badge category={e.category} size="sm" />
                        <span className="text-xs text-gray-400">
                          {new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-1">{e.description}</p>
                    </div>
                    <span className="flex-shrink-0 text-sm font-semibold text-gray-900">
                      {formatRupees(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Full expense table with infinite scroll ── */}
      <div className="fade-up" style={{ animationDelay: '300ms' }}>
        <Card padding="lg">
          <div className="mb-5">
            <h2 className="font-semibold text-gray-900">All Expenses</h2>
            <p className="text-xs text-gray-400 mt-0.5">Scroll to load more</p>
          </div>

          {isError ? (
            <div className="py-10 text-center">
              <p className="text-red-500 text-sm font-medium">
                {error instanceof Error ? error.message : 'Failed to load expenses'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <ExpenseFiltersBar filters={filters} onChange={handleFilterChange} />
              </div>
              <ExpenseTable
                expenses={filtered}
                loading={isLoading}
                hasNextPage={!!hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onFetchNext={fetchNextPage}
                onEdit={handleEdit}
                loadedCount={allExpenses.length}
                totalCount={totalCount}
              />
            </>
          )}
        </Card>
      </div>

      {/* ── Add modal ── */}
      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        title="Add New Expense"
        description="Enter the details of your new expense."
      >
        <ExpenseForm
          onSuccess={addModal.close}
          onCancel={addModal.close}
          createMutation={createMutation}
        />
      </Modal>

      {/* ── Edit modal ── */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={handleEditClose}
        title="Edit Expense"
        description="Update the details of your expense."
      >
        <ExpenseForm
          expense={editingExpense}
          onSuccess={handleEditClose}
          onCancel={handleEditClose}
          createMutation={createMutation}
        />
      </Modal>
    </DashboardLayout>
  );
}
