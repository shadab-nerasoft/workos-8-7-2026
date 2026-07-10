import { redirect } from "next/navigation";

/**
 * Legacy route. The root dashboard (/) is role-aware and renders
 * the manager view automatically.
 */
export default function ManagerPage() {
  redirect("/");
}
