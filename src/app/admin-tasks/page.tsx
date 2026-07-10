import { redirect } from "next/navigation";

/**
 * Legacy route. All task views are consolidated into the role-aware /tasks page.
 */
export default function Page() {
  redirect("/tasks");
}
