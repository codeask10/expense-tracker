import { memo } from 'react';
import { Card } from '../ui/Card';
import { SkeletonCard } from '../ui/Skeleton';
import { formatRupees } from '../../utils/currency';
import type { ExpenseStats as ExpenseStatsData } from '../../types/expense';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  delay: number;
}

function StatCard({ icon, label, value, sub, delay }: StatCardProps) {
  return (
    <Card
      padding="lg"
      className="flex flex-col gap-3 fade-up"
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="text-gray-300">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-gray-400">{sub}</p>
      </div>
    </Card>
  );
}

interface ExpenseStatsProps {
  stats: ExpenseStatsData | null;
  totalCount: number;
  loading?: boolean;
}

export const ExpenseStats = memo(function ExpenseStats({ stats, totalCount, loading }: ExpenseStatsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        delay={0}
        label="Total Expenses"
        value={formatRupees(stats.totalExpense)}
        sub={`Across ${totalCount} transaction${totalCount !== 1 ? 's' : ''}`}
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <StatCard
        delay={70}
        label="This Month"
        value={formatRupees(stats.thisMonthExpense)}
        sub="Current month spending"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        }
      />
      <StatCard
        delay={140}
        label="Average Expense"
        value={formatRupees(stats.averageExpense)}
        sub="Per transaction"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        }
      />
    </div>
  );
});
