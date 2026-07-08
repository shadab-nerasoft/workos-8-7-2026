import { redirect } from "next/navigation";

/**
 * @deprecated Use /signup instead
 * This route redirects to /signup for consistency
 */
export default function RegisterPage() {
  redirect("/signup");
}
