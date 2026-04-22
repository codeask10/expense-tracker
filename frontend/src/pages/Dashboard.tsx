import { lazy, Suspense, useState } from 'react';
import { DashboardLayout } from '../component/layout/DashboardLayout';
import { Modal } from '../component/ui/Modal';
import { Card } from '../component/ui/Card';
import { Skeleton } from '../component/ui/Skeleton';
import { ExpenseStats } from '../component/expenses/ExpenseStats';
import { ExpenseForm } from '../component/expenses/ExpenseForm';
import { ExpenseFiltersBar } from '../component/expenses/ExpenseFilters';
import { RecentExpenses } from '../component/expenses/RecentExpenses';
import { useExpenses } from '../component/hooks/useExpenses';
import { useExpenseStats } from '../component/hooks/useExpenseStats';
import { useCreateExpense } from '../component/hooks/useCreateExpense';
import { useModal } from '../hooks/useModal';
import type { Expense, ExpenseFilters } from '../types/expense';

const ExpenseTable = lazy(() => import('../component/expenses/ExpenseTable'));
const MonthlyChart = lazy(() => import('../component/expenses/MonthlyChart'));

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

  const { isLoading, isError, error, hasNextPage, isFetchingNextPage, fetchNextPage, queryKey, allExpenses, filtered, totalCount } = useExpenses(filters);
  const { data: expenseStats, isLoading: isStatsLoading } = useExpenseStats();
  const createMutation = useCreateExpense(queryKey);

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
      {/* KPI cards */}
      <ExpenseStats stats={expenseStats ?? null} totalCount={totalCount} loading={isStatsLoading} />

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 fade-up" style={{ animationDelay: '180ms' }}>
          <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
            <MonthlyChart />
          </Suspense>
        </div>

        <div className="lg:col-span-2 fade-up" style={{ animationDelay: '240ms' }}>
          <RecentExpenses />
        </div>
      </div>

      {/* Full expense table */}
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
              <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
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
              </Suspense>
            </>
          )}
        </Card>
      </div>

      {/* Add modal */}
      <Modal isOpen={addModal.isOpen} onClose={addModal.close} title="Add New Expense" description="Enter the details of your new expense.">
        <ExpenseForm onSuccess={addModal.close} onCancel={addModal.close} createMutation={createMutation} />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={editModal.isOpen} onClose={handleEditClose} title="Edit Expense" description="Update the details of your expense.">
        <ExpenseForm expense={editingExpense} onSuccess={handleEditClose} onCancel={handleEditClose} createMutation={createMutation} />
      </Modal>
    </DashboardLayout>
  );
}
