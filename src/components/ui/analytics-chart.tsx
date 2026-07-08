"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSyncExternalStore } from "react";
import type { AnalyticsPoint } from "@/src/types";

export function AnalyticsChart({ data }: { data: AnalyticsPoint[] }) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className="h-80 min-h-80 w-full rounded-[var(--radius-sm)] bg-slate-100" aria-hidden="true" />;
  }

  return (
    <div style={{ width: "100%", height: 320, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="productivity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} width={36} />
          <Tooltip
            contentStyle={{
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              boxShadow: "0 1px 2px rgb(15 23 42 / 0.08)",
              fontFamily: "var(--font-montserrat), sans-serif",
            }}
          />
          <Area type="monotone" dataKey="productivity" stroke="#2563EB" strokeWidth={2} fill="url(#productivity)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
