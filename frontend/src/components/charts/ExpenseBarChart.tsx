import { useEffect, useRef, useState, useMemo } from "react";
import {
  buildCategoryBars,
  getCategoryConfig,
  formatRupees,
  CategoryBar,
} from "../../features/expenses/utils/expense.utils";
import type { Expense } from "../../features/expenses/types";

const BAR_HEIGHT_PX = 160;

interface TooltipState {
  bar: CategoryBar;
  x: number;
  y: number;
}

function BarTooltip({ bar, x, y }: TooltipState) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y - 12,
        transform: "translateX(-50%) translateY(-100%)",
        pointerEvents: "none",
        zIndex: 20,
      }}
      className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-xl text-sm whitespace-nowrap"
    >
      <p className="font-semibold text-gray-900 mb-1">{bar.category}</p>
      <p className="text-gray-700">{formatRupees(bar.amount)}</p>
      <p className="text-xs text-gray-400 mt-0.5">
        {bar.pct.toFixed(1)}% of total
      </p>
      <div
        style={{
          position: "absolute",
          bottom: -5,
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: 10,
          height: 10,
          background: "white",
          borderRight: "1px solid #e5e7eb",
          borderBottom: "1px solid #e5e7eb",
        }}
      />
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-gray-300 select-none">
      <svg
        className="h-10 w-10 mb-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <p className="text-sm">No expense data yet</p>
    </div>
  );
}

interface ExpenseBarChartProps {
  expenses: Expense[];
}

export function ExpenseBarChart({ expenses }: ExpenseBarChartProps) {
  const bars = useMemo(() => buildCategoryBars(expenses), [expenses]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [bars.length]);

  if (bars.length === 0) return <EmptyChart />;

  function handleMouseEnter(
    e: React.MouseEvent<HTMLDivElement>,
    bar: CategoryBar,
  ) {
    const barRect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
    };
    setTooltip({
      bar,
      x: barRect.left - containerRect.left + barRect.width / 2,
      y: barRect.top - containerRect.top,
    });
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        style={{
          position: "relative",
          height: BAR_HEIGHT_PX + 24,
          paddingTop: 8,
        }}
      >
        {[100, 75, 50, 25].map((pct) => (
          <div
            key={pct}
            style={{
              position: "absolute",
              bottom: 24 + (pct / 100) * BAR_HEIGHT_PX,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: "#d1d5db",
                width: 28,
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {pct}%
            </span>
            <div style={{ flex: 1, borderTop: "1px dashed #f3f4f6" }} />
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 36,
            right: 0,
            height: BAR_HEIGHT_PX,
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          {bars.map((bar, i) => {
            const cfg = getCategoryConfig(bar.category);
            const heightPx = Math.round((bar.relHeight / 100) * BAR_HEIGHT_PX);

            return (
              <div
                key={`${bar.category}-${animKey}`}
                style={{
                  flex: 1,
                  minWidth: 28,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => handleMouseEnter(e, bar)}
                onMouseLeave={() => setTooltip(null)}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: cfg.color,
                    marginBottom: 3,
                    opacity: 0,
                    animation: `fadeUp 0.3s ease-out ${150 + i * 60}ms both`,
                  }}
                >
                  {bar.pct.toFixed(0)}%
                </span>

                <div
                  style={{
                    width: "100%",
                    height: heightPx,
                    backgroundColor: cfg.color,
                    borderRadius: "4px 4px 0 0",
                    transformOrigin: "bottom",
                    animation: `barGrow ${300 + i * 60}ms cubic-bezier(0.34,1.1,0.64,1) ${i * 50}ms both`,
                    transition: "height 0.35s ease-out",
                    willChange: "transform",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, paddingLeft: 36 }}>
        {bars.map((bar) => {
          const cfg = getCategoryConfig(bar.category);
          return (
            <div
              key={bar.category}
              style={{ flex: 1, minWidth: 28, textAlign: "center" }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: cfg.color,
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                }}
              >
                {bar.category.length > 7
                  ? bar.category.slice(0, 6) + "…"
                  : bar.category}
              </span>
            </div>
          );
        })}
      </div>

      {tooltip && <BarTooltip {...tooltip} />}
    </div>
  );
}
