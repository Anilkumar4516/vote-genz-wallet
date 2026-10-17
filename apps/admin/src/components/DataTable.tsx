'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  actions?: React.ReactNode;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchFilter,
  pageSize = 10,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = searchFilter && query
    ? data.filter((item) => searchFilter(item, query))
    : data;

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="w-full space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {searchFilter ? (
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-surface-200/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        ) : <div />}

        {actions && <div className="flex items-center gap-2 w-full sm:w-auto">{actions}</div>}
      </div>

      {/* Table Surface */}
      <div className="overflow-x-auto rounded-2xl admin-card border border-slate-800">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.className}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer transition-colors' : ''}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={col.className}>
                    {col.render
                      ? col.render(row)
                      : col.accessorKey
                      ? String(row[col.accessorKey] ?? '—')
                      : '—'}
                  </td>
                ))}
              </tr>
            ))}

            {currentData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Inbox className="w-8 h-8 text-slate-600" />
                    <p className="text-xs font-semibold text-slate-400">No matching records found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {filteredData.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span>
              Showing <strong>{startIndex + 1}</strong> to{' '}
              <strong>{Math.min(startIndex + pageSize, filteredData.length)}</strong> of{' '}
              <strong>{filteredData.length}</strong> records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-700 bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-50 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-xs font-bold text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-700 bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-50 text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
