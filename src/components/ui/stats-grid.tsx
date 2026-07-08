import { ArrowUp2, ChartSuccess, Clock, Danger, StatusUp } from "iconsax-react";
import type { Stat } from "@/src/types";

const iconByTone = {
  primary: StatusUp,
  success: ChartSuccess,
  warning: Clock,
  error: Danger,
  info: ArrowUp2,
} satisfies Record<Stat["tone"], typeof StatusUp>;

const colorByTone: Record<Stat["tone"], string> = {
  primary: "text-primary-600 bg-primary-50",
  success: "text-emerald-600 bg-emerald-50",
  warning: "text-amber-600 bg-amber-50",
  error: "text-red-600 bg-red-50",
  info: "text-cyan-600 bg-cyan-50",
};

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconByTone[stat.tone];

        return (
          <section key={stat.label} className="surface-card p-6">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium leading-6 text-slate-600">{stat.label}</p>
              <span className={`rounded-full p-3 ${colorByTone[stat.tone]}`}>
                <Icon size={20} color="currentColor" variant="Outline" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold leading-[38px] text-slate-950">{stat.value}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{stat.change}</p>
          </section>
        );
      })}
    </div>
  );
}
