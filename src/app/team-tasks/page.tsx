import { redirect } from "next/navigation";

/**
 * @deprecated Consolidated into the role-aware /tasks page.
 */
export default function TeamTasksPage() {
  redirect("/tasks");
}
