import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { SettingsSection } from "@/src/components/sections/settings-section";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title="Configure workspace preferences and role rules"
        description="Settings focus on preferences, workflow status, and role configuration. Notification settings are intentionally omitted."
      />
      <SettingsSection />
    </AppShell>
  );
}
