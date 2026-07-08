"use client";

import { useMemo, useState } from "react";
import { ArrowDown2, ArrowUp2, SearchNormal1 } from "iconsax-react";
import type { ReactNode } from "react";
import type { TableColumn } from "@/src/types";

type SortDirection = "asc" | "desc";

interface DataTableProps<TItem extends { id: string }> {
  data: TItem[];
  columns: TableColumn<TItem>[];
  searchPlaceholder: string;
  renderCell: (item: TItem, key: Extract<keyof TItem, string>) => ReactNode;
}

export function DataTable<TItem extends { id: string }>({
  data,
  columns,
  searchPlaceholder,
  renderCell,
}: DataTableProps<TItem>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<Extract<keyof TItem, string>>(columns[0].key);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? data.filter((item) =>
          Object.values(item).some((value) => String(value).toLowerCase().includes(normalizedQuery)),
        )
      : data;

    return [...filtered].sort((first, second) => {
      const firstValue = String(first[sortKey]);
      const secondValue = String(second[sortKey]);
      const result = firstValue.localeCompare(secondValue, undefined, { numeric: true });
      return sortDirection === "asc" ? result : -result;
    });
  }, [data, query, sortDirection, sortKey]);

  function toggleSort(key: Extract<keyof TItem, string>): void {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  return (
    <section className="surface-card">
      <div className="flex flex-col gap-3 border-b p-5 divider-accent md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-sm">
          <span className="sr-only">Search</span>
          <SearchNormal1 size={18} color="currentColor" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" variant="Outline" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-primary-200/60 bg-white/80 pl-10 pr-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button className="soft-control px-4 py-2 text-xs font-medium leading-5 text-slate-600" type="button">
            All statuses
          </button>
          <button className="soft-control px-4 py-2 text-xs font-medium leading-5 text-slate-600" type="button">
            All owners
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b text-xs uppercase leading-5 text-slate-500 divider-accent">
            <tr>
              {columns.map((column) => {
                const active = sortKey === column.key;
                const Icon = sortDirection === "asc" ? ArrowUp2 : ArrowDown2;

                return (
                  <th key={String(column.key)} className="px-5 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex items-center gap-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {column.label}
                      {active ? <Icon size={14} color="currentColor" variant="Outline" aria-hidden="true" /> : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divider-accent">
            {rows.map((item) => (
              <tr key={String(item.id)} className="hover:bg-primary-50/40 transition">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-5 py-4 text-sm leading-6 text-slate-700">
                    {renderCell(item, column.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
