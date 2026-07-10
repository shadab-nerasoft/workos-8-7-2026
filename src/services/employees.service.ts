import { useEmployeeStore } from "@/src/store/employee-store";
import type { User } from "@/src/types";

/**
 * Employees service — the single API seam for user/employee data.
 * TODAY: mock/Zustand. LATER: swap bodies to fetch("/api/employees...").
 */

export const employeesApi = {
  async getEmployees(): Promise<User[]> {
    return useEmployeeStore.getState().getAllUsers();
  },

  async createEmployee(user: User): Promise<User> {
    // LATER: POST /api/employees
    useEmployeeStore.getState().createUser(user);
    return user;
  },

  async updateEmployee(id: string, updates: Partial<User>): Promise<void> {
    // LATER: PATCH /api/employees/:id
    useEmployeeStore.getState().updateUser(id, updates);
  },

  async deleteEmployee(id: string): Promise<void> {
    // LATER: DELETE /api/employees/:id
    useEmployeeStore.getState().deleteUser(id);
  },
};
