export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonTableRow({ index }: { index: number }) {
  const widths = [[60, 160, 80, 60], [50, 140, 90, 55], [70, 180, 75, 65]];
  const [w0, w1, w2, w3] = widths[index % 3];
  return (
    <tr>
      <td className="px-4 py-3.5"><div className="skeleton h-4" style={{ width: w0 }} /></td>
      <td className="px-4 py-3.5"><div className="skeleton h-4" style={{ width: w1 }} /></td>
      <td className="px-4 py-3.5"><div className="skeleton h-5 w-20 rounded-full" /></td>
      <td className="px-4 py-3.5"><div className="skeleton h-4" style={{ width: w2 }} /></td>
      <td className="px-4 py-3.5"><div className="skeleton h-4" style={{ width: w3 }} /></td>
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-4 w-4" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-7 w-32" />
        <div className="skeleton h-3 w-20" />
      </div>
    </div>
  );
}

export function SkeletonRecentItem() {
  return (
    <div className="flex justify-between items-center gap-3">
      <div className="space-y-1.5 flex-1">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-4 w-36" />
      </div>
      <div className="skeleton h-4 w-14" />
    </div>
  );
}
