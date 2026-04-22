import { ReactNode } from 'react';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  onAddExpense: () => void;
  children: ReactNode;
}

export function DashboardLayout({ onAddExpense, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Expense Tracker</h1>
            <p className="text-xs text-gray-400 leading-none mt-0.5">Track and manage your financial expenses</p>
          </div>
          <Button variant="primary" size="md" onClick={onAddExpense}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Expense
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">{children}</main>
      <footer className="border-t border-gray-100 py-5 text-center text-xs text-gray-400">
        Amounts stored in paise &bull; Idempotency-safe writes
      </footer>
    </div>
  );
}
