import { Setting4 } from "iconsax-react";
import { Card, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

const settings = [
  { label: "Workflow", value: "Default", helper: "Backlog, To Do, In Progress, Review, Completed." },
  { label: "Role model", value: "Admin / Manager / Employee", helper: "Actions are scoped by role and ownership." },
];

export function SettingsSection() {
  return (
    <Card>
      <CardHeader title="Workspace Preferences" />
      <div className="divide-y divider-accent">
        {settings.map((item) => (
          <div key={item.label} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Setting4 size={22} className="mt-1 text-slate-400" variant="Outline" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold leading-6 text-slate-950">{item.label}</p>
                <p className="text-sm leading-6 text-slate-600">{item.helper}</p>
              </div>
            </div>
            <Badge label={item.value} tone="primary" />
          </div>
        ))}
      </div>
    </Card>
  );
}
