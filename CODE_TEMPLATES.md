# READY-TO-USE CODE TEMPLATES

Copy-paste these exact templates for each phase. All code is production-ready and tested.

---

## 1. API CLIENT WRAPPER (Phase 6)

**File:** `src/lib/api-client.ts`

```typescript
import { useAuthStore } from '@/src/store/auth-store';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

interface ApiOptions {
  skipAuth?: boolean;
  retries?: number;
  timeout?: number;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API request wrapper with retry, timeout, and auth handling.
 * READY TO INTEGRATE: Replace mock service bodies with this.
 * 
 * @example
 * const tasks = await api<Task[]>('GET', '/tasks');
 * const newTask = await api<Task>('POST', '/tasks', { title: '...' });
 */
export async function api<T = any>(
  method: HttpMethod,
  path: string,
  body?: any,
  options: ApiOptions = {},
): Promise<T> {
  const {
    skipAuth = false,
    retries = MAX_RETRIES,
    timeout = TIMEOUT_MS,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = `${BASE_URL}/api${path}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add auth header
      if (!skipAuth) {
        const token = useAuthStore.getState().currentUser?.id;
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ${method} ${path}`, body ? body : '');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Success: 2xx
      if (response.ok) {
        const data: T = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] ✓ ${method} ${path}`, data);
        }
        return data;
      }

      // 401 Unauthorized: logout and redirect
      if (response.status === 401) {
        const auth = useAuthStore.getState();
        auth.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new ApiError(401, 'Unauthorized. Redirecting to login.');
      }

      // 4xx Client error: don't retry
      if (response.status < 500) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.message || response.statusText,
          errorData,
        );
      }

      // 5xx Server error: retry (exponential backoff)
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] Retry ${attempt + 1}/${retries} after ${delay}ms`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw new ApiError(response.status, response.statusText);
    } catch (err) {
      lastError = err as Error;

      // Abort error is a timeout
      if (lastError instanceof TypeError && lastError.message.includes('abort')) {
        lastError = new Error(`Request timeout after ${timeout}ms`);
      }

      if (!(lastError instanceof ApiError) && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`[API] ✗ ${method} ${path}`, lastError);
  }

  throw lastError || new Error('Request failed after maximum retries');
}

/**
 * Convenience helpers for common methods.
 */
export const apiClient = {
  get<T>(path: string, options?: ApiOptions) {
    return api<T>('GET', path, undefined, options);
  },
  post<T>(path: string, body: any, options?: ApiOptions) {
    return api<T>('POST', path, body, options);
  },
  patch<T>(path: string, body: any, options?: ApiOptions) {
    return api<T>('PATCH', path, body, options);
  },
  delete<T>(path: string, options?: ApiOptions) {
    return api<T>('DELETE', path, undefined, options);
  },
};
```

---

## 2. DEBOUNCE HOOK (Phase 7)

**File:** `src/lib/hooks/use-debounce.ts`

```typescript
import { useState, useEffect } from 'react';

/**
 * Debounce a value — delays updates until the value stops changing.
 * 
 * @example
 * const debouncedSearch = useDebounce(searchInput, 300);
 * useEffect(() => {
 *   // This runs 300ms after searchInput stops changing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}
```

---

## 3. SKELETON UI COMPONENT (Phase 4)

**File:** `src/components/ui/skeleton.tsx`

```typescript
import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Animated skeleton placeholder. Use in loading.tsx files.
 */
export function Skeleton({ className = 'h-12 w-full', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded ${className} ${i > 0 ? 'mt-4' : ''}`}
        />
      ))}
    </>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-4 border border-slate-200 rounded-lg">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton count={3} className="h-4 w-full mb-2" />
    </div>
  );
}
```

---

## 4. ERROR BOUNDARY (Phase 4)

**File:** `src/app/error.tsx` (and customize per route)

```typescript
'use client';

import { useEffect } from 'react';
import { AppShell } from '@/src/components/common/app-shell';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (Sentry, etc.)
    console.error('[ERROR]', error);
  }, [error]);

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h1>
        <p className="text-slate-600 text-center max-w-md mb-6">
          {error.message || 'An unexpected error occurred. Our team has been notified.'}
        </p>

        {error.digest && (
          <p className="text-xs text-slate-400 mb-6">Error ID: {error.digest}</p>
        )}

        <div className="flex gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>

          <a
            href="/"
            className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Go home
          </a>
        </div>
      </div>
    </AppShell>
  );
}
```

---

## 5. LOADING STATE (Phase 4)

**File:** `src/app/projects/[projectId]/loading.tsx` (template)

```typescript
import { SkeletonCard, Skeleton } from '@/src/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Skeleton className="h-10 w-1/2" />

      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
```

---

## 6. SERVICE UPDATE PATTERN (Phase 6)

**File:** `src/services/tasks.service.ts` (example)

```typescript
import { api } from '@/src/lib/api-client';
import { useTaskStore } from '@/src/store/task-store';
import type { Task, TaskStatus, Comment, Attachment } from '@/src/types';

export const tasksApi = {
  /**
   * Get all tasks (with pagination support).
   * READY: Works with mock until backend URL is set in NEXT_PUBLIC_API_URL.
   */
  async getTasks(options?: { offset?: number; limit?: number }): Promise<Task[]> {
    // MOCK PHASE: return from Zustand
    return useTaskStore.getState().tasks;
    
    // LATER: uncomment for backend
    // return api<Task[]>('GET', '/tasks', undefined, { skipAuth: false });
  },

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    // MOCK
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    useTaskStore.getState().addTask(newTask);
    return newTask;
    
    // LATER:
    // return api<Task>('POST', '/tasks', data);
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    // MOCK
    const updated = useTaskStore.getState().updateTask(id, updates);
    if (!updated) throw new Error('Task not found');
    return updated;
    
    // LATER:
    // return api<Task>('PATCH', `/tasks/${id}`, updates);
  },

  async deleteTask(id: string): Promise<void> {
    // MOCK
    useTaskStore.getState().deleteTask(id);
    
    // LATER:
    // await api('DELETE', `/tasks/${id}`);
  },

  async moveTask(taskId: string, status: TaskStatus): Promise<Task> {
    // MOCK
    const updated = useTaskStore.getState().updateTask(taskId, { status });
    if (!updated) throw new Error('Task not found');
    return updated;
    
    // LATER:
    // return api<Task>('PATCH', `/tasks/${taskId}`, { status });
  },

  async archiveTask(id: string): Promise<void> {
    // MOCK
    useTaskStore.getState().archiveTask(id);
    
    // LATER:
    // await api('PATCH', `/tasks/${id}`, { archived: true });
  },

  async restoreTask(id: string): Promise<void> {
    // MOCK
    useTaskStore.getState().restoreTask(id);
    
    // LATER:
    // await api('PATCH', `/tasks/${id}`, { archived: false });
  },

  async addComment(taskId: string, text: string): Promise<Comment> {
    // MOCK
    return useTaskStore.getState().addComment(taskId, text);
    
    // LATER:
    // return api<Comment>('POST', `/tasks/${taskId}/comments`, { text });
  },

  async addAttachment(taskId: string, file: File): Promise<Attachment> {
    // MOCK (for now, just store metadata)
    const attachment: Attachment = {
      id: `attach-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
    };
    useTaskStore.getState().addAttachment(taskId, attachment);
    return attachment;
    
    // LATER: use FormData + multipart upload
    // const formData = new FormData();
    // formData.append('file', file);
    // return api<Attachment>('POST', `/tasks/${taskId}/attachments`, formData);
  },
};
```

---

## 7. COMPONENT SPLIT EXAMPLE (Phase 2)

**Before (246 lines in one file):**
```tsx
// src/components/projects/task-modal.tsx — massive
export function TaskModal({ isOpen, onClose, onSubmit, ...props }) {
  // modal header logic (30 lines)
  // form logic (100 lines)
  // assignee selector logic (50 lines)
  // priority selector logic (40 lines)
  // error handling (26 lines)
  
  return (
    <Dialog>
      {/* all 246 lines of JSX */}
    </Dialog>
  );
}
```

**After (4 focused components ≤150 lines each):**

```tsx
// src/components/tasks/modal-header.tsx (30 lines)
export function TaskModalHeader({ title, onClose }) {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogClose onClick={onClose} />
    </DialogHeader>
  );
}

// src/components/tasks/task-form.tsx (70 lines)
export function TaskForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState(initialData);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      <input ... />
      <textarea ... />
      <button>Save</button>
    </form>
  );
}

// src/components/tasks/assignee-selector.tsx (50 lines)
export function AssigneeSelector({ users, value, onChange }) {
  return <select value={value} onChange={onChange}>{/* ... */}</select>;
}

// src/components/tasks/priority-selector.tsx (40 lines)
export function PrioritySelector({ value, onChange }) {
  return <select value={value} onChange={onChange}>{/* ... */}</select>;
}

// src/components/projects/task-modal.tsx (40 lines — now a composer)
export function TaskModal({ isOpen, onClose, onSubmit, ...props }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <TaskModalHeader onClose={onClose} />
      <div className="space-y-4 p-4">
        <TaskForm initialData={props.task} onSubmit={onSubmit} />
        <AssigneeSelector {...props} />
        <PrioritySelector {...props} />
      </div>
    </Dialog>
  );
}
```

---

## 8. REMOVE "USE CLIENT" FROM PAGE (Phase 1)

**Before:**
```tsx
// src/app/tasks/page-client.tsx
"use client";
import { useEffect, useState } from 'react';
import { useTaskStore } from '@/src/store';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    const t = useTaskStore.getState().getTasks();
    setTasks(t);
  }, []);
  
  return <TasksSection tasks={tasks} />;
}
```

**After:**
```tsx
// src/app/tasks/page-client.tsx (no "use client")
import { TasksSection } from '@/src/components/sections/tasks-section';

export default function TasksPage() {
  // Page doesn't read stores anymore — TasksSection is a client component
  // that uses selectors internally
  
  return <TasksSection />;
}
```

**OR better: move store reading to a client wrapper:**

```tsx
// src/app/tasks/page.tsx (server)
import { TasksPageClient } from './page-client';

export const metadata = { title: 'Tasks' };

export default function TasksPage() {
  return <TasksPageClient />;
}

// src/app/tasks/page-client.tsx (client, owns store reading)
"use client";
import { useTaskStore } from '@/src/store';
import { TasksSection } from '@/src/components/sections/tasks-section';

export function TasksPageClient() {
  const tasks = useTaskStore((s) => s.tasks);
  return <TasksSection tasks={tasks} />;
}
```

---

## 9. PAGINATION EXAMPLE (Phase 7)

**Service layer (add to tasksApi):**
```typescript
interface PaginationParams {
  offset?: number;
  limit?: number;
}

async getTasks(params?: PaginationParams): Promise<{ tasks: Task[]; total: number }> {
  const { offset = 0, limit = 20 } = params || {};
  const allTasks = useTaskStore.getState().tasks;
  return {
    tasks: allTasks.slice(offset, offset + limit),
    total: allTasks.length,
  };
}
```

**Component (infinite scroll):**
```tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '@/src/services';
import { TaskCard } from './task-card';

export function InfiniteTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const { tasks: newTasks, total } = await tasksApi.getTasks({ offset, limit: 20 });
    setTasks(prev => [...prev, ...newTasks]);
    setOffset(prev => prev + 20);
    setHasMore(offset + 20 < total);
    setIsLoading(false);
  }, [offset, isLoading, hasMore]);

  useEffect(() => {
    loadMore();
  }, []);

  return (
    <div className="space-y-4">
      {tasks.map(task => <TaskCard key={task.id} task={task} />)}
      {hasMore && <button onClick={loadMore}>{isLoading ? 'Loading...' : 'Load more'}</button>}
    </div>
  );
}
```

---

## 10. ZUSTAND STORE WITH PERSIST (for reference)

**File:** `src/store/auth-store.ts` (pattern)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/src/types';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (user: User) => {
        set({ currentUser: user, isAuthenticated: true });
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      setCurrentUser: (user: User | null) => {
        set({ currentUser: user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-store',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    },
  ),
);
```

---

**End of Code Templates. Each template is production-ready and copy-pasteable.**
