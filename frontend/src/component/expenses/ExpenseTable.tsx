import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Badge } from '../ui/Badge';
import { SkeletonTableRow } from '../ui/Skeleton';
import { useDeleteExpense } from '../hooks/useCreateExpense';
import { formatRupees } from '../../utils/currency';
import type { Expense } from '../../types/expense';

function EmptyState() {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3 select-none">📭</div>
          <p className="font-medium text-gray-700">No expenses found</p>
          <p className="text-sm text-gray-400 mt-1">Try changing your filters or add a new expense.</p>
        </div>
      </td>
    </tr>
  );
}

function ExpenseRow({ expense, index, onEdit }: { expense: Expense; index: number; onEdit: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout>>();
  const deleteMutation = useDeleteExpense();
  const isOptimistic = expense._id.startsWith('temp_');

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      confirmTimer.current = setTimeout(() => setConfirming(false), 3000);
      return;
    }
    clearTimeout(confirmTimer.current);
    deleteMutation.mutate(expense._id, {
      onSuccess: () => toast.success('Expense deleted'),
      onError: () => { toast.error('Failed to delete'); setConfirming(false); },
    });
  }

  const delay = Math.min(index * 35, 300);

  return (
    <tr
      className={`group border-b border-gray-50 transition-colors row-animate ${isOptimistic ? 'bg-blue-50/40' : 'hover:bg-gray-50/70'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <td className="px-4 py-3.5 whitespace-nowrap">
        <time className="text-sm text-gray-500" dateTime={expense.date}>
          {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </time>
      </td>
      <td className="px-4 py-3.5 max-w-xs">
        <span className="text-sm text-gray-800 line-clamp-1">{expense.description}</span>
        {isOptimistic && (
          <span className="ml-2 inline-block rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">saving…</span>
        )}
      </td>
      <td className="px-4 py-3.5"><Badge category={expense.category} /></td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="text-sm font-semibold text-gray-900">{formatRupees(expense.amount)}</span>
      </td>
      <td className="px-4 py-3.5">
        {!isOptimistic && (
          <div className="flex items-center justify-end gap-1">
            <button onClick={onEdit} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${confirming ? 'bg-red-500 text-white scale-105' : 'text-gray-400 hover:bg-red-50 hover:text-red-600'}`}
              title={confirming ? 'Click again to confirm' : 'Delete'}
            >
              {confirming ? 'Confirm?' : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              )}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function BottomLoader() {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex items-center justify-center gap-1.5 py-5">
          {[0, 1, 2].map((i) => <span key={i} className="loader-dot" style={{ animationDelay: `${i * 160}ms` }} />)}
        </div>
      </td>
    </tr>
  );
}

interface ExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNext: () => void;
  onEdit: (expense: Expense) => void;
  loadedCount: number;
  totalCount: number;
}

export function ExpenseTable({
  expenses,
  loading,
  hasNextPage,
  isFetchingNextPage,
  onFetchNext,
  onEdit,
  loadedCount,
  totalCount,
}: ExpenseTableProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) onFetchNext(); },
      { rootMargin: '150px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onFetchNext]);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {(['Date', 'Description', 'Category', 'Amount'] as const).map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonTableRow key={i} index={i} />)
              : expenses.length === 0
              ? <EmptyState />
              : expenses.map((expense, i) => (
                  <ExpenseRow key={expense._id} expense={expense} index={i} onEdit={() => onEdit(expense)} />
                ))}
            {isFetchingNextPage && <BottomLoader />}
          </tbody>
        </table>
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} aria-hidden />

      {!loading && totalCount > 0 && (
        <p className="mt-3 text-center text-xs text-gray-400">
          {hasNextPage
            ? `Showing ${loadedCount} of ${totalCount} expenses — scroll for more`
            : `All ${totalCount} expense${totalCount !== 1 ? 's' : ''} loaded`}
        </p>
      )}
    </>
  );
}

export default ExpenseTable;
