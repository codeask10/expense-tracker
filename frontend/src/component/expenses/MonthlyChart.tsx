import { useEffect, useMemo, useRef, useState } from 'react';
import { useMonthlyDistribution } from '../hooks/useMonthlyDistribution';
import { getCategoryConfig } from '../../utils/category';
import { formatRupees } from '../../utils/currency';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { MonthData } from '../../types/expense';

const BAR_HEIGHT_PX = 200;
const GRID_LINES = [100, 60, 30, 0];

interface TooltipState {
  monthData: MonthData;
  year: number;
  x: number;
  y: number;
}

function StackedTooltip({ monthData, year, x, y }: TooltipState) {
  return (
    <div
      style={{ position: 'absolute', left: x, top: y - 10, transform: 'translateX(-50%) translateY(-100%)', pointerEvents: 'none', zIndex: 30 }}
      className="rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-xl text-sm whitespace-nowrap"
    >
      <p className="font-semibold text-gray-900 mb-2.5">{monthData.month} {year}</p>
      <div className="space-y-1.5 mb-2.5">
        {monthData.categories.map((cat) => {
          const pct = ((cat.amount / monthData.total) * 100).toFixed(1);
          const cfg = getCategoryConfig(cat.name);
          return (
            <div key={cat.name} className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
              <span className="text-gray-600 flex-1 min-w-0">{cat.name}</span>
              <span className="text-gray-400 text-xs tabular-nums">{pct}%</span>
              <span className="font-medium text-gray-800 tabular-nums pl-2">{formatRupees(cat.amount)}</span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-gray-100 pt-2 flex items-center justify-between gap-6">
        <span className="text-xs text-gray-400">Monthly Total</span>
        <span className="font-semibold text-gray-900 tabular-nums">{formatRupees(monthData.total)}</span>
      </div>
      <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 10, height: 10, background: 'white', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }} />
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-gray-300 select-none">
      <svg className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-sm">No data for this year</p>
    </div>
  );
}

export function MonthlyChart() {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const { data, isLoading } = useMonthlyDistribution(selectedYear);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => { setAnimKey((k) => k + 1); setTooltip(null); }, [data?.year]);

  const hasData = data ? data.monthlyData.some((m) => m.total > 0) : false;

  const legendCategories = useMemo(() => {
    if (!data) return [];
    const seen = new Map<string, string>();
    for (const m of data.monthlyData) {
      for (const cat of m.categories) {
        if (!seen.has(cat.name)) seen.set(cat.name, getCategoryConfig(cat.name).color);
      }
    }
    return Array.from(seen.entries()).map(([name, color]) => ({ name, color }));
  }, [data]);

  function handleBarEnter(e: React.MouseEvent<HTMLDivElement>, monthData: MonthData) {
    if (!monthData.total || !containerRef.current) return;
    const barRect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const rawX = barRect.left - containerRect.left + barRect.width / 2;
    setTooltip({
      monthData,
      year: data!.year,
      x: Math.max(60, Math.min(rawX, containerRect.width - 60)),
      y: barRect.top - containerRect.top,
    });
  }

  return (
    <Card padding="lg" className="h-full">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-semibold text-gray-900">Monthly Spending Distribution</h2>
          <p className="text-xs text-gray-400 mt-0.5">Percentage breakdown of expenses by category each month</p>
        </div>
        {data && data.availableYears.length > 1 && (
          <select
            value={selectedYear ?? data.year}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
          >
            {data.availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : !hasData ? (
        <EmptyChart />
      ) : (
        <>
          <div ref={containerRef} style={{ position: 'relative' }}>
            <div style={{ position: 'relative', height: BAR_HEIGHT_PX + 24, paddingTop: 8 }}>
              {GRID_LINES.map((pct) => (
                <div key={pct} style={{ position: 'absolute', bottom: 24 + (pct / 100) * BAR_HEIGHT_PX, left: 0, right: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#d1d5db', width: 32, textAlign: 'right', flexShrink: 0, lineHeight: 1 }}>{pct}%</span>
                  <div style={{ flex: 1, borderTop: '1px dashed #f3f4f6' }} />
                </div>
              ))}
              <div style={{ position: 'absolute', bottom: 24, left: 40, right: 0, height: BAR_HEIGHT_PX, display: 'flex', alignItems: 'flex-end', gap: 5 }}>
                {data!.monthlyData.map((monthData, i) => {
                  const hasMonthData = monthData.total > 0;
                  return (
                    <div key={`${monthData.month}-${animKey}`} style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div
                        style={{ width: '80%', margin: '0 auto', height: hasMonthData ? BAR_HEIGHT_PX : 3, display: 'flex', flexDirection: 'column-reverse', overflow: 'hidden', borderRadius: '4px 4px 0 0', cursor: hasMonthData ? 'pointer' : 'default', transformOrigin: 'bottom', animation: hasMonthData ? `barGrow ${320 + i * 40}ms cubic-bezier(0.34,1.1,0.64,1) ${i * 40}ms both` : 'none', willChange: 'transform', backgroundColor: hasMonthData ? 'transparent' : '#f3f4f6' }}
                        onMouseEnter={(e) => handleBarEnter(e, monthData)}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {hasMonthData && monthData.categories.map((cat) => (
                          <div key={cat.name} style={{ flexShrink: 0, width: '100%', height: `${(cat.amount / monthData.total) * 100}%`, backgroundColor: getCategoryConfig(cat.name).color }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 5, paddingLeft: 40 }}>
              {data!.monthlyData.map((m) => (
                <div key={m.month} style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
                  <span style={{ fontSize: 10, color: '#9ca3af', display: 'block', fontWeight: 500 }}>{m.month}</span>
                </div>
              ))}
            </div>
            {tooltip && <StackedTooltip {...tooltip} />}
          </div>
          {legendCategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-gray-100 pt-3">
              {legendCategories.map(({ name, color }) => (
                <span key={name} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  {name}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

export default MonthlyChart;
