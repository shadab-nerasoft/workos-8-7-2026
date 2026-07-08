/**
 * Application-level constants
 * Centralized configuration for dates, API endpoints, and feature flags
 */

// ── Anchor Date for Mock Data ────────────────────────────
// This date is used as the reference point for all mock data generation.
// When switching to real data, update this or remove the usage from mock files.
export const MOCK_ANCHOR_DATE = new Date("2026-06-23");

// ── Authentication Routes ────────────────────────────────
export const AUTH_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  REGISTER: "/register", // Deprecated: use SIGNUP instead
} as const;

// ── App Routes ───────────────────────────────────────────
export const APP_ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  EMPLOYEES: "/employees",
  PROJECTS: "/projects",
  TEAMS: "/teams",
  TASKS: "/tasks",
  CALENDAR: "/calendar",
  REPORTS: "/reports",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  DAILY_REPORT: "/daily-report",
} as const;

// ── API Endpoints ────────────────────────────────────────
export const API_ENDPOINTS = {
  AUTH: "/api/auth",
  USERS: "/api/users",
  EMPLOYEES: "/api/employees",
  PROJECTS: "/api/projects",
  TEAMS: "/api/teams",
  TASKS: "/api/tasks",
  REPORTS: "/api/reports",
} as const;

// ── Default Pagination ───────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// ── User Roles ───────────────────────────────────────────
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
} as const;

// ── Date Formats ─────────────────────────────────────────
export const DATE_FORMATS = {
  SHORT: "MMM d, yyyy",
  LONG: "MMMM d, yyyy",
  TIME: "h:mm a",
  DATETIME: "MMM d, yyyy h:mm a",
} as const;
