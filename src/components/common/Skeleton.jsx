// src/components/common/Skeleton.jsx (tạo mới)

/**
 * Single shimmer bar.
 * @param {{ className?: string }} props
 */
export function SkeletonBar({ className = 'h-4 w-full' }) {
  return <div className={`skeleton ${className}`} />;
}

/**
 * N rows of shimmer bars, one per table cell (colCount cells per row).
 * @param {{ rows?: number, colCount?: number }} props
 */
export default function Skeleton({ rows = 5, colCount = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-surface-border">
          {Array.from({ length: colCount }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="skeleton h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}