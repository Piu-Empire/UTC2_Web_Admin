// src/components/common/DataTable.jsx (tạo mới)
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

/**
 * @param {{
 *   columns:      import('@tanstack/react-table').ColumnDef<any>[],
 *   data:         any[],
 *   loading?:     boolean,
 *   emptyState?:  React.ReactNode,
 *   className?:   string,
 * }} props
 */
export default function DataTable({
  columns,
  data,
  loading     = false,
  emptyState  = null,
  className   = '',
}) {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, // pagination handled by parent
  });

  const rows = table.getRowModel().rows;
  const colCount = columns.length;

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        {/* ── Head ── */}
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id} className="border-b border-surface-border dark:border-slate-700 bg-surface-muted dark:bg-slate-800">
              {hg.headers.map(header => {
                const canSort = header.column.getCanSort();
                const sorted  = header.column.getIsSorted(); // false | 'asc' | 'desc'

                return (
                  <th
                    key={header.id}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    className={`
                      px-4 py-3 text-left text-xs font-semibold text-ink-muted dark:text-slate-400 uppercase tracking-wide
                      whitespace-nowrap select-none
                      ${canSort ? 'cursor-pointer hover:text-ink' : ''}
                    `}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="text-ink-subtle">
                          {sorted === 'asc'  && <ChevronUp   size={13} />}
                          {sorted === 'desc' && <ChevronDown  size={13} />}
                          {!sorted           && <ChevronsUpDown size={13} className="opacity-40" />}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        {/* ── Body ── */}
        <tbody>
          {/* Loading: skeleton rows */}
          {loading && <Skeleton rows={6} colCount={colCount} />}

          {/* Empty state */}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={colCount}>
                {emptyState ?? <EmptyState message="Không tìm thấy bản ghi nào." />}
              </td>
            </tr>
          )}

          {/* Data rows with stagger */}
          {!loading && rows.map((row, index) => (
            <motion.tr
              key={row.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              className="border-b border-surface-border dark:border-slate-700 hover:bg-surface-hover dark:hover:bg-slate-800 transition-colors"
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-3 text-ink dark:text-slate-200">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}