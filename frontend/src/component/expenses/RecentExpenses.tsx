import { memo, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SkeletonRecentItem } from '../ui/Skeleton';
import { useRecentExpenses } from '../hooks/useRecentExpenses';
import { formatRupees } from '../../utils/currency';

export const RecentExpenses = memo(function RecentExpenses() {
  const { isLoading, allRecentExpenses } = useRecentExpenses();

  const recent = useMemo(() => allRecentExpenses.slice(0, 5), [allRecentExpenses]);

  return (
    <Card padding="lg" className="h-full">
      <h2 className="font-semibold text-gray-900">Recent Expenses</h2>
      <p className="text-xs text-gray-400 mt-0.5 mb-4">Your latest transactions</p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRecentItem key={i} />)}
        </div>
      ) : recent.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-gray-400 text-sm">
          <span className="text-3xl mb-2 select-none">💸</span>
          No expenses yet
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
  );
});
