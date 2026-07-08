import type { Activity, User } from "@/src/types";

export function ActivityTimeline({ activity, users }: { activity: Activity[]; users: User[] }) {
  const usersById = new Map(users.map((user) => [user.id, user]));

  return (
    <ol className="divide-y divider-accent">
      {activity.map((item) => {
        const actor = usersById.get(item.actorId);

        return (
          <li key={item.id} className="flex gap-3 p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary-50 text-xs font-semibold text-primary-700">
              {actor?.avatar ?? "NA"}
            </span>
            <div>
              <p className="text-sm leading-6 text-slate-700">
                <span className="font-semibold text-slate-950">{actor?.name ?? "Unknown user"}</span> {item.action}{" "}
                <span className="font-medium text-slate-950">{item.subject}</span>
              </p>
              <time className="text-xs leading-5 text-slate-500" dateTime={item.timestamp}>
                {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(item.timestamp))}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
