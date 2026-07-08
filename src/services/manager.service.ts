// src/services/manager.service.ts
export interface NewManager {
  name: string;
  department: string;
  teamAccess: string[]; // list of team identifiers the manager can access
}

/**
 * Persist a new manager entry in localStorage.
 * In a production environment this would call a backend API.
 */
export const createManager = (manager: NewManager): void => {
  // Retrieve existing managers from localStorage, default to empty array
  const existing: NewManager[] = JSON.parse(localStorage.getItem('managers') ?? '[]');
  existing.push(manager);
  localStorage.setItem('managers', JSON.stringify(existing));
};
