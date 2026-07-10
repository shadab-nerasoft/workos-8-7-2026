import { redirect } from "next/navigation";

/**
 * Legacy route. The root dashboard (/) is role-aware and renders
 * the employee view automatically.
 */
export default function EmployeePage() {
  redirect("/");
}
