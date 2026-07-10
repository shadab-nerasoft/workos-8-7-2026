# IMPLEMENTATION CHECKLIST

## PHASE 1: Remove "use client" from Pages (2 hours)

### Action Items
- [ ] Remove `"use client";` from `src/app/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/tasks/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/projects/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/projects/[projectId]/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/employees/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/employees/[employeeId]/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/employees/[employeeId]/history/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/teams/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/calendar/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/analytics/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/reports/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/daily-report/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/profile/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/login/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/signup/page-client.tsx`
- [ ] Remove `"use client";` from `src/app/forgot-password/page-client.tsx`

### Verification
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] No browser errors on navigation

---

## PHASE 2: Code-Split Large Components (4 hours)

### TeamsSection (1,594 lines → 8 components, max 150 each)
- [ ] Create `src/components/sections/teams/teams-list.tsx` (TeamCard, TeamsList logic)
- [ ] Create `src/components/sections/teams/create-team-modal.tsx` (form, validation)
- [ ] Create `src/components/sections/teams/team-stats-card.tsx` (analytics display)
- [ ] Create `src/components/sections/teams/managers-list.tsx` (ManagerCard, list)
- [ ] Create `src/components/sections/teams/create-manager-modal.tsx` (form)
- [ ] Update `src/components/sections/teams-section.tsx` to import and compose sub-components
- [ ] Verify: All sub-components ≤150 lines

### DailyReport (1,131 lines → 5 components)
- [ ] Create `src/components/daily-report/report-header.tsx`
- [ ] Create `src/components/daily-report/shift-selector.tsx`
- [ ] Create `src/components/daily-report/report-form.tsx`
- [ ] Create `src/components/daily-report/report-list.tsx`
- [ ] Create `src/components/daily-report/activity-timeline.tsx`
- [ ] Update `src/app/daily-report/page-client.tsx` to import sub-components
- [ ] Verify: All ≤150 lines

### Reports (516 lines → 3 components)
- [ ] Create `src/components/reports/reports-header.tsx`
- [ ] Create `src/components/reports/reports-table.tsx`
- [ ] Create `src/components/reports/report-detail.tsx`
- [ ] Update `src/app/reports/page-client.tsx`
- [ ] Verify: All ≤150 lines

### CalendarGrid (401 lines → 3 components)
- [ ] Create `src/components/calendar/calendar-header.tsx`
- [ ] Create `src/components/calendar/day-cell.tsx`
- [ ] Create `src/components/calendar/month-view.tsx`
- [ ] Update `src/components/calendar/calendar-grid.tsx`
- [ ] Verify: All ≤150 lines

### EmployeeHistory (351 lines → 3 components)
- [ ] Create `src/components/employees/history-header.tsx`
- [ ] Create `src/components/employees/report-timeline.tsx`
- [ ] Create `src/components/employees/report-filters.tsx`
- [ ] Update `src/app/employees/[employeeId]/history/page-client.tsx`
- [ ] Verify: All ≤150 lines

### KanbanBoard (348 lines → 3 components)
- [ ] Create `src/components/kanban/kanban-column.tsx`
- [ ] Create `src/components/kanban/task-card.tsx`
- [ ] Create `src/components/kanban/drag-overlay.tsx`
- [ ] Update `src/components/ui/kanban-board.tsx`
- [ ] Verify: All ≤150 lines

### GlobalSearch (319 lines → 2 components)
- [ ] Create `src/components/search/search-input.tsx`
- [ ] Create `src/components/search/search-results.tsx`
- [ ] Update `src/components/common/global-search.tsx`
- [ ] Verify: All ≤150 lines

### CalendarSidebar (256 lines → 2 components)
- [ ] Create `src/components/calendar/week-navigator.tsx`
- [ ] Create `src/components/calendar/filter-section.tsx`
- [ ] Update `src/components/calendar/calendar-sidebar.tsx`
- [ ] Verify: All ≤150 lines

### ProjectDetail (256 lines → 3 components)
- [ ] Create `src/components/projects/project-header.tsx`
- [ ] Create `src/components/projects/tab-navigation.tsx`
- [ ] Create `src/components/projects/tab-content.tsx`
- [ ] Update `src/app/projects/[projectId]/page-client.tsx`
- [ ] Verify: All ≤150 lines

### TaskModal (246 lines → 4 components)
- [ ] Create `src/components/tasks/modal-header.tsx`
- [ ] Create `src/components/tasks/task-form.tsx`
- [ ] Create `src/components/tasks/assignee-selector.tsx`
- [ ] Create `src/components/tasks/priority-selector.tsx`
- [ ] Update `src/components/projects/task-modal.tsx`
- [ ] Verify: All ≤150 lines

### TaskDetailModal (227 lines → 3 components)
- [ ] Create `src/components/tasks/detail-modal-header.tsx`
- [ ] Create `src/components/tasks/task-details-view.tsx`
- [ ] Create `src/components/tasks/comment-section.tsx`
- [ ] Update `src/components/tasks/task-detail-modal.tsx`
- [ ] Verify: All ≤150 lines

### LoginPage (197 lines → 2 components)
- [ ] Create `src/components/auth/login-form.tsx`
- [ ] Create `src/components/auth/quick-login-buttons.tsx`
- [ ] Update `src/app/login/page-client.tsx`
- [ ] Verify: All ≤150 lines

### EmployeeDetail (304 lines → 3 components)
- [ ] Create `src/components/employees/employee-header.tsx`
- [ ] Create `src/components/employees/employee-stats.tsx`
- [ ] Create `src/components/employees/task-list.tsx`
- [ ] Update `src/app/employees/[employeeId]/page-client.tsx`
- [ ] Verify: All ≤150 lines

### Verification
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] No new linting errors
- [ ] All new components ≤150 lines

---

## PHASE 3: Remove getState() Snapshots (1.5 hours)

### Files Requiring Fixes
- [ ] `src/services/teams.service.ts` — convert 12 `getState()` calls to prop-derived computations
- [ ] `src/components/sections/teams-section.tsx` — convert 8 calls
- [ ] `src/app/daily-report/page-client.tsx` — convert 6 calls
- [ ] `src/app/reports/page-client.tsx` — convert 5 calls
- [ ] All remaining 21 instances across other files

### Conversion Pattern
For each `getState()` call:
1. Replace `useStore.getState().getData()` with selector: `useStore((s) => s.data)`
2. Add to component dependency array if inside `useMemo` or `useCallback`
3. Verify component re-renders when store changes

### Verification
- [ ] Zero `getState()` calls in component/page code (only OK in store initialization)
- [ ] All selectors properly memoized
- [ ] No stale data in UI

---

## PHASE 4: Error & Loading Boundaries (2 hours)

### Create Error Boundaries (8 files)
- [ ] Create `src/app/error.tsx` (global boundary)
- [ ] Create `src/app/tasks/error.tsx`
- [ ] Create `src/app/projects/error.tsx`
- [ ] Create `src/app/projects/[projectId]/error.tsx`
- [ ] Create `src/app/employees/error.tsx`
- [ ] Create `src/app/employees/[employeeId]/error.tsx`
- [ ] Create `src/app/teams/error.tsx`
- [ ] Create `src/app/calendar/error.tsx`

### Create Loading States (3 files)
- [ ] Create `src/app/projects/[projectId]/loading.tsx` (skeleton UI)
- [ ] Create `src/app/employees/[employeeId]/loading.tsx`
- [ ] Create `src/app/employees/[employeeId]/history/loading.tsx`

### Template for error.tsx
```tsx
'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-slate-600 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
      >
        Try again
      </button>
    </div>
  );
}
```

### Template for loading.tsx
```tsx
export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-12 bg-slate-200 rounded animate-pulse" />
      <div className="h-64 bg-slate-200 rounded animate-pulse" />
      <div className="h-12 bg-slate-200 rounded animate-pulse" />
    </div>
  );
}
```

### Verification
- [ ] All 8 error.tsx files created
- [ ] All 3 loading.tsx files created
- [ ] Manual test: trigger error, verify boundary catches it
- [ ] Manual test: slow network, verify loading UI shows

---

## PHASE 5: Fix useEffect Dependencies (1.5 hours)

### Files with Most Violations
- [ ] `src/app/daily-report/page-client.tsx` — 8 effects
- [ ] `src/components/calendar/calendar-grid.tsx` — 5 effects
- [ ] `src/components/common/global-search.tsx` — 4 effects
- [ ] `src/components/projects/task-modal.tsx` — 3 effects
- [ ] All remaining 19 instances

### Fix Pattern
```tsx
// ❌ BAD
useEffect(() => { /* setup */ });

// ✅ GOOD
useEffect(() => { /* setup */ }, []);  // once on mount
// OR
useEffect(() => { /* setup */ }, [dep1, dep2]);  // when deps change
```

### Verification
- [ ] Zero warnings in console
- [ ] No infinite loops (watch network tab for repeated API calls)
- [ ] Effects trigger only when intended

---

## PHASE 6: API Integration Ready (2 hours)

### Create API Client
- [ ] Create `src/lib/api-client.ts` with:
  - [ ] Generic `api<T>(method, url, data?)` function
  - [ ] Request/response logging (dev only)
  - [ ] Retry logic (3 retries, exponential backoff for 5xx)
  - [ ] Request timeout (30s)
  - [ ] Auth header injection (bearer token from auth store)
  - [ ] Error handling (401 → logout + redirect, 5xx → throw, others → throw)

### Update Services
- [ ] `src/services/auth.service.ts` — swap `loginAsRole` mock to api wrapper
- [ ] `src/services/tasks.service.ts` — all 8 functions
- [ ] `src/services/projects.service.ts` — all 4 functions
- [ ] `src/services/employees.service.ts` — all 4 functions
- [ ] `src/services/reports.service.ts` — all 3 functions

### Create Example API Routes (optional, for local testing)
- [ ] Create `src/app/api/tasks/route.ts` (GET, POST)
- [ ] Create `src/app/api/tasks/[id]/route.ts` (GET, PATCH, DELETE)
- [ ] Similar for projects, employees, reports (thin wrappers around mock data)

### Template for api-client.ts
```tsx
const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;

export async function api<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`/api${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      
      if (response.ok) {
        const result: T = await response.json();
        return result;
      }
      
      if (response.status === 401) {
        // Logout and redirect
        const auth = useAuthStore.getState();
        auth.logout();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      
      throw new Error(`${response.status}: ${response.statusText}`);
    } catch (err) {
      lastError = err as Error;
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error('Request failed');
}
```

### Template for Service Update
```tsx
// BEFORE
async getTasks(): Promise<Task[]> {
  return useTaskStore.getState().getAllTasks();
}

// AFTER
async getTasks(): Promise<Task[]> {
  return api<Task[]>('GET', '/tasks');
}
```

### Verification
- [ ] All service functions use `api()` wrapper
- [ ] Dev console shows request logging
- [ ] Retry logic works (test with slow network)
- [ ] 401 triggers logout + redirect

---

## PHASE 7: Dynamic Data & Performance (3 hours)

### Add Pagination to Services
- [ ] Update `tasksApi.getTasks()` to accept `{ offset, limit }`
- [ ] Update `projectsApi.getProjects()` with pagination
- [ ] Update `employeesApi.getEmployees()` with pagination
- [ ] Components use infinite-scroll or "Load more" button

### Add Debounce Hook
- [ ] Create `src/lib/hooks/use-debounce.ts`:
  ```tsx
  export function useDebounce<T>(value: T, delayMs = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delayMs);
      return () => clearTimeout(timer);
    }, [value, delayMs]);
    return debounced;
  }
  ```

### Apply Debounce
- [ ] `src/components/common/global-search.tsx` — debounce search query
- [ ] `src/components/tasks/task-modal.tsx` — debounce filters
- [ ] `src/components/calendar/calendar-filters.tsx` — debounce

### Memoize Expensive Computations
- [ ] Review all `useMemo` calls — ensure they're necessary
- [ ] Review all `useCallback` calls — ensure dependency arrays are tight
- [ ] Add `useMemo` for derived lists (tasks by status, etc.)

### Code-Split Modal Components
- [ ] Create `src/components/tasks/task-modal-lazy.tsx`:
  ```tsx
  const TaskModal = lazy(() => import('./task-modal'));
  ```
- [ ] Use in pages with `<Suspense fallback={<Skeleton />}>`

### Verify Performance
- [ ] Run Lighthouse audit
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] No unnecessary re-renders (check React DevTools Profiler)

---

## FINAL VALIDATION (1 hour)

- [ ] Build: `npm run build` ✅
- [ ] Type: `npx tsc --noEmit` ✅
- [ ] Lint: `npm run lint` ✅
- [ ] Browser test (all major flows):
  - [ ] Login → redirect to dashboard ✅
  - [ ] Navigate to tasks → load list ✅
  - [ ] Click task → open modal ✅
  - [ ] Create task → success ✅
  - [ ] View project detail → load board ✅
  - [ ] View teams → load list ✅
  - [ ] Search → debounce works ✅
  - [ ] Logout → redirect to login ✅
- [ ] Mobile test (336×666):
  - [ ] All pages render ✅
  - [ ] No horizontal scroll ✅
  - [ ] Buttons tappable ✅
- [ ] Lighthouse:
  - [ ] Performance ≥90 ✅
  - [ ] Accessibility ≥90 ✅
  - [ ] Best Practices ≥90 ✅
  - [ ] SEO ≥90 ✅
- [ ] Commit & push:
  - [ ] All phases committed ✅
  - [ ] GitHub PR opens with changes ✅

---

**Total Estimated Time: ~16 hours**
**Outcome: Production-ready, API-integrated, performant, bug-free codebase**
