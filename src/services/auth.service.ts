import { useAuthStore } from "@/src/store/auth-store";
import { useEmployeeStore } from "@/src/store/employee-store";
import type { User } from "@/src/types";

/**
 * Auth service — the ONLY place login/logout logic lives.
 *
 * TODAY: strict mock auth against the hydrated employee store.
 * LATER: replace each function body with a fetch() to your real
 * auth endpoint. Nothing else in the app needs to change.
 */

/** Shared demo password for all mock accounts. */
export const DEMO_PASSWORD = "password123";

export const authApi = {
  /**
   * Strict login: the email/ID must belong to a known user and the
   * password must match. No silent fallbacks, no auto-admin.
   */
  async login(identifier: string, password: string): Promise<User> {
    // LATER: const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) });
    const allUsers = useEmployeeStore.getState().getAllUsers();
    const normalized = identifier.trim().toLowerCase();

    const user = allUsers.find(
      (u) => u.email.toLowerCase() === normalized || u.id.toLowerCase() === normalized
    );

    if (!user) {
      throw new Error("No account found for that email or ID.");
    }

    if (password !== DEMO_PASSWORD) {
      throw new Error("Incorrect password.");
    }

    useAuthStore.getState().login(user);
    return user;
  },

  /** Demo helper: log in as the first user with the given role. */
  async loginAsRole(role: User["role"]): Promise<User> {
    const targetUser = useEmployeeStore
      .getState()
      .getAllUsers()
      .find((u) => u.role === role);

    if (!targetUser) {
      throw new Error(`No demo account found for the role: ${role}`);
    }

    useAuthStore.getState().login(targetUser);
    return targetUser;
  },

  async logout(): Promise<void> {
    // LATER: await fetch("/api/auth/logout", { method: "POST" });
    useAuthStore.getState().logout();
  },
};
