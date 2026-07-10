import { redirect } from "next/navigation";

/**
 * Legacy route. The root dashboard (/) is role-aware and renders
 * the admin view automatically. /admin/create-manager remains a real page.
 */
export default function AdminPage() {
  redirect("/");
}
