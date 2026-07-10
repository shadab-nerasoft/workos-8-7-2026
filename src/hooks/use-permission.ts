import { useMemo } from "react";
import { useAuthStore } from "@/src/store/auth-store";
import { getPermissions } from "@/src/lib/permissions";
import type { Permissions } from "@/src/types";

/**
 * Reactive permission map for the logged-in user.
 * Backed by the central RBAC module in `src/lib/permissions.ts` —
 * do not hardcode role checks anywhere else.
 */
export function usePermissions(): Permissions {
  const currentUser = useAuthStore((s) => s.currentUser);

  return useMemo(() => getPermissions(currentUser), [currentUser]);
}
