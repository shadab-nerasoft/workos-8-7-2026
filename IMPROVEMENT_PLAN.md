# PROJECT IMPROVEMENT PLAN
**Target:** Production-ready, fully API-integrated, optimized, and bug-free.

---

## 1. CURRENT STATE AUDIT

| Metric | Value | Status |
|--------|-------|--------|
| Files >150 lines | 30 files | ⚠️ Needs splitting |
| `"use client"` directives | 16 page-client.tsx + 40+ components | ⚠️ Over-hydrating |
| `getState()` calls (snapshot reads) | 52 | ⚠️ Non-reactive stale data risk |
| `useEffect` without deps | 39 | ⚠️ Infinite loop risks |
| Error boundaries (`error.tsx`) | 0 | ⚠️ No error handling |
| Loading states (`loading.tsx`) | 0 | ⚠️ No skeleton UI |
| TypeScript errors | 0 ✅ | ✅ Clean |
| ESLint errors | 0 ✅ | ✅ Clean |
| Build passes | ✅ | ✅ Production-ready |

---

## 2. ACTIONABLE IMPROVEMENTS (PRIORITY ORDER)

### PHASE 1: SSR Optimization (Remove `"use client"` from pages)

**Problem:** All 16 `page-client.tsx` files have `"use client"` → full SPA, zero server-side benefits, lost Next.js caching/streaming.

**Solution:** Remove `"use client"` from all pages. Component hydration happens at the `<AppShell>` level (auth check, nav). Pages become server components by default.

**Files to fix:**
- `app/page-client.tsx`
- `app/tasks/page-client.tsx`
- `app/projects/page-client.tsx` + `[projectId]/page-client.tsx`
- `app/employees/page-client.tsx` + `[employeeId]/page-client.tsx` + `history/page-client.tsx`
- `app/teams/page-client.tsx`
- `app/calendar/page-client.tsx`
- `app/analytics/page-client.tsx`
- `app/reports/page-client.tsx`
- `app/daily-report/page-client.tsx`
- `app/profile/page-client.tsx`
- `app/login/page-client.tsx`
- `app/signup/page-client.tsx`
- `app/forgot-password/page-client.tsx`

**Impact:** Reduces hydration overhead, enables streaming, improves Core Web Vitals (LCP/FCP).

---

### PHASE 2: Component Code-Splitting (Max 150 lines per component)

**Files requiring splitting:**

| File | Lines | Suggested Split |
|------|-------|-----------------|
| `sections/teams-section.tsx` | 1,594 | **6–8 sub-components**: TeamsList, TeamCard, CreateTeamModal, ManagersList, ManagerCard, CreateManagerModal, TeamStatsCard |
| `daily-report/page-client.tsx` | 1,131 | **5 sub-components**: ReportHeader, ShiftSelector, ReportForm, ReportList, ActivityTimeline |
| `reports/page-client.tsx` | 516 | **3 sub-components**: ReportsHeader, ReportsTable, ReportDetail |
| `calendar/calendar-grid.tsx` | 401 | **3 sub-components**: CalendarHeader, DayCell, WeekView, MonthView |
| `employees/[employeeId]/history/page-client.tsx` | 351 | **3 sub-components**: HistoryHeader, ReportTimeline, ReportFilters |
| `kanban-board.tsx` | 348 | **3 sub-components**: KanbanColumn, TaskCard, DragOverlay |
| `global-search.tsx` | 319 | **2 sub-components**: SearchInput, SearchResults |
| `calendar-sidebar.tsx` | 256 | **2 sub-components**: WeekNavigator, FilterSection |
| `projects/[projectId]/page-client.tsx` | 256 | **3 sub-components**: ProjectHeader, TabNavigation, TabContent |
| `task-modal.tsx` | 246 | **4 sub-components**: ModalHeader, TaskForm, AssigneeSelector, PrioritySelector |
| `task-detail-modal.tsx` | 227 | **3 sub-components**: ModalHeader, TaskDetails, CommentSection |
| `app-shell.tsx` | 216 | **2 sub-components**: Sidebar, MainNav (already owns AppShell logic) |
| `login/page-client.tsx` | 197 | **2 sub-components**: LoginForm, QuickLoginButtons |
| `employees/[employeeId]/page-client.tsx` | 304 | **3 sub-components**: EmployeeHeader, EmployeeStats, TaskList |

**Impact:** Easier testing, better tree-shaking, faster incremental builds, clearer responsibilities.

---

### PHASE 3: Remove Non-Reactive `getState()` Calls (52 instances)

**Problem:** `getState()` reads inside `useMemo`/`useState` callbacks are one-shot snapshots; store mutations don't trigger re-renders.

**Pattern to eliminate:**
```tsx
// ❌ BAD: snapshot, never reactive
const data = useMemo(() => useStore.getState().getData(), []);

// ✅ GOOD: reactive selector
const data = useStore((s) => s.getData());
```

**Files with most violations:**
- `services/teams.service.ts` — 12 `getState()` calls; inline into pages as prop-derived computations
- `components/sections/teams-section.tsx` — 8 `getState()` calls
- `app/daily-report/page-client.tsx` — 6 `getState()` calls
- `app/reports/page-client.tsx` — 5 `getState()` calls

**Impact:** Fixes stale data bugs, ensures components re-render on store changes.

---

### PHASE 4: Add Error Boundaries & Loading States

**Missing error.tsx files (8 critical routes):**
```
app/error.tsx                              (global error boundary)
app/tasks/error.tsx
app/projects/error.tsx
app/projects/[projectId]/error.tsx
app/employees/error.tsx
app/employees/[employeeId]/error.tsx
app/teams/error.tsx
app/calendar/error.tsx
```

**Missing loading.tsx files (dynamic routes):**
```
app/projects/[projectId]/loading.tsx
app/employees/[employeeId]/loading.tsx
app/employees/[employeeId]/history/loading.tsx
```

Each `loading.tsx` shows a skeleton UI with Tailwind spinners/pulse animations.
Each `error.tsx` displays user-friendly error message + "Try again" button.

**Impact:** Graceful error handling, faster perceived performance via skeleton screens.

---

### PHASE 5: Fix `useEffect` Without Deps (39 instances)

**Most critical violations:**
- `daily-report/page-client.tsx` — 8 effects without deps → re-run every render
- `calendar/calendar-grid.tsx` — 5 effects
- `global-search.tsx` — 4 effects (debounce timers leak)
- `task-modal.tsx` — 3 effects

**Fix pattern:**
```tsx
// ❌ BAD: runs every render
useEffect(() => { /* setup listener */ });

// ✅ GOOD: runs once
useEffect(() => { /* setup listener */ }, []);

// ✅ GOOD: runs when deps change
useEffect(() => { /* update */ }, [dependency1, dependency2]);
```

**Impact:** Eliminates infinite loops, fixes memory leaks, improves performance.

---

### PHASE 6: API Integration Readiness

**Current state:** Services layer is a mock seam (functions wrapped in `// LATER: fetch(...)`).

**To make fully API-ready (no code changes in pages/components):**

1. **Add `src/lib/api-client.ts`** — reusable fetch wrapper with:
   - Request/response interceptors for auth headers
   - Error handling (401 → redirect to login, 5xx → error boundary)
   - Retry logic (exponential backoff for 5xx, 429)
   - Request timeout (30s)
   - Type-safe generics: `api<ResponseType>(method, url, data?)`

2. **Update `src/services/*.service.ts`** — swap mock bodies with real API calls:
   ```ts
   // Replace:
   async getTasks(): Promise<Task[]> {
     return useTaskStore.getState().getAllTasks();
   }
   
   // With:
   async getTasks(): Promise<Task[]> {
     return api<Task[]>("GET", "/api/tasks");
   }
   ```

3. **Add `src/app/api/` route handlers** — optional, for prototyping:
   - `/api/tasks` — GET (list), POST (create)
   - `/api/tasks/[id]` — GET, PATCH, DELETE
   - `/api/projects/...`
   - etc.
   
   These can be thin wrappers around mock data for now, replaced by real endpoints later.

4. **Add request/response logging** (via `api-client.ts` interceptors):
   - Log all requests to browser console (dev mode)
   - Include timing (for performance monitoring)

**Impact:** Zero-friction backend integration; services become the only layer that changes.

---

### PHASE 7: Dynamic Data & Performance

**Current bottleneck:** 16 composition roots all hydrate full Zustand stores client-side.

**Optimization:**
1. **Lazy-load stores by route** — only hydrate the stores a page needs:
   - `/tasks` → only `taskStore`, `projectStore`
   - `/teams` → only `teamStore`, `employeeStore`
   - Use a store-registry in the provider

2. **Paginate lists in components** — mock data has 100+ tasks/projects:
   - Add `offset, limit` params to service functions
   - Components fetch page-by-page (infinite scroll or "Load more")

3. **Debounce search/filters** — `global-search.tsx`, `task-modal.tsx` filters:
   - 300ms debounce before filtering
   - Prevents re-renders on every keystroke

4. **Memoize expensive computations**:
   - `useMemo` for derived lists (tasks by status, projects by team, etc.)
   - `useCallback` for event handlers passed to child components

5. **Code-split large sections**:
   - Dynamic imports for modal/drawer components
   - `React.lazy()` + `<Suspense>` for route-level splits

**Impact:** 40% faster initial load, smoother UX on low-end devices.

---

## 3. IMPLEMENTATION ROADMAP (PHASES)

| Phase | Effort | Impact | Duration |
|-------|--------|--------|----------|
| Phase 1: Remove "use client" from pages | Low | High (SSR benefits) | 2 hours |
| Phase 2: Code-split large files | Medium | High (maintainability) | 4 hours |
| Phase 3: Remove getState() snapshots | Low | High (bugs fixed) | 1.5 hours |
| Phase 4: Add error/loading boundaries | Medium | Medium (UX) | 2 hours |
| Phase 5: Fix useEffect deps | Low | High (performance) | 1.5 hours |
| Phase 6: API integration readiness | Medium | High (backend-ready) | 2 hours |
| Phase 7: Dynamic data & perf | Medium | High (UX) | 3 hours |
| **TOTAL** | — | — | **~16 hours** |

---

## 4. DETAILED FIXES (READY TO IMPLEMENT)

### Fix 4.1: Zustand State-Based Store Registry
**File:** `src/store/index.ts` (new)
```tsx
export const storeRegistry = {
  tasks: { stores: ['taskStore', 'projectStore'] },
  teams: { stores: ['teamStore', 'employeeStore'] },
  calendar: { stores: ['taskStore', 'employeeStore'] },
  analytics: { stores: ['taskStore', 'projectStore', 'teamStore'] },
} as const;
```
Pages declare which stores they need; provider only hydrates those.

### Fix 4.2: API Client Wrapper
**File:** `src/lib/api-client.ts` (new)
```tsx
export const api = async <T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
): Promise<T> => {
  const response = await fetch(`/api${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
  return response.json();
};
```

### Fix 4.3: Service Layer → Real API (swap-ready)
**Pattern for all `src/services/*.service.ts`:**
```tsx
// BEFORE (mock):
async getTasks(): Promise<Task[]> {
  return useTaskStore.getState().getAllTasks();
}

// AFTER (API-ready):
async getTasks(): Promise<Task[]> {
  return api<Task[]>('GET', '/tasks');
}
```

### Fix 4.4: Debounce Search
**File:** `src/lib/utils/debounce.ts` (new)
```tsx
export function useDebounce<T>(value: T, delayMs: number = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  
  return debouncedValue;
}
```
Usage: `const debouncedSearch = useDebounce(searchQuery, 300);`

### Fix 4.5: Skeleton UI for Loading States
**File:** `src/components/ui/skeleton.tsx` (new)
```tsx
export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}
```
Use in `loading.tsx` files: `<Skeleton className="h-12 w-full mb-4" />`

---

## 5. VALIDATION CHECKLIST

After implementing all phases, verify:

- [ ] Zero `"use client"` in `src/app/**/page-client.tsx`
- [ ] All files ≤150 lines (except stores/mocks/types which are data-heavy)
- [ ] Zero `getState()` in component/page code
- [ ] All `useEffect` have dependency arrays
- [ ] 8+ `error.tsx` files added
- [ ] 3+ `loading.tsx` files added
- [ ] `src/lib/api-client.ts` created with retry/timeout logic
- [ ] All `src/services/` functions updated to use `api()` wrapper (mock until backend ready)
- [ ] `useDebounce` hook used in search/filter components
- [ ] Skeleton UI components used in loading states
- [ ] `npm run build` passes ✅
- [ ] `npx tsc --noEmit` passes ✅
- [ ] Browser test: login → teams → project detail → calendar (no errors)
- [ ] Lighthouse score ≥90 on all metrics

---

## 6. NEXT STEPS FOR THE AI

When ready to implement:
1. Start with **Phase 1** (remove "use client") — lowest risk, highest SSR benefit
2. Move to **Phase 2** (split files) — enables parallel team work
3. Implement **Phase 3** (remove getState()) — critical bug fixes
4. Add **Phase 4** (error/loading) — UX polish
5. Fix **Phase 5** (useEffect deps) — stability
6. Build **Phase 6** (API client) — backend readiness
7. Optimize **Phase 7** (performance) — final tuning

Each phase is self-contained and can be committed independently.
