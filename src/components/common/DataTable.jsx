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

export default function DataTable({
  columns,
  data,
  loading    = false,
  emptyState = null,
  className  = '',
}) {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  const rows     = table.getRowModel().rows;
  const colCount = columns.length;

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr
              key={hg.id}
              style={{
                background: 'var(--table-header-bg)',
                borderBottom: '1px solid var(--table-header-border)',
              }}
            >
              {hg.headers.map(header => {
                const canSort = header.column.getCanSort();
                const sorted  = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    className="px-4 py-3 text-left whitespace-nowrap select-none"
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--table-header-color)',
                      cursor: canSort ? 'pointer' : 'default',
                      width: header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span style={{ color: 'var(--table-header-color)', opacity: 0.6 }}>
                          {sorted === 'asc'  && <ChevronUp    size={13} />}
                          {sorted === 'desc' && <ChevronDown  size={13} />}
                          {!sorted           && <ChevronsUpDown size={13} />}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {loading && <Skeleton rows={6} colCount={colCount} />}

          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={colCount}>
                {emptyState ?? <EmptyState message="Không tìm thấy bản ghi nào." />}
              </td>
            </tr>
          )}

          {!loading && rows.map((row, index) => (
            <motion.tr
              key={row.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              style={{ borderBottom: '1px solid var(--table-row-border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--table-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-4 py-3"
                  style={{ color: 'var(--table-cell-color)' }}
                >
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