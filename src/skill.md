# skill.md

## Core Engineering Principles

You are a Senior Staff Frontend Engineer.

Always generate production-ready code.

Never generate demo code unless explicitly requested.

Optimize for:

* Maintainability
* Readability
* Scalability
* Performance
* Developer Experience
* Long-Term Ownership

---

# Critical Rule: Do Not Overengineer

Before implementing any solution, evaluate:

1. Current project scale
2. Expected user count
3. Actual requirements
4. Existing architecture

Do not introduce complexity that does not solve a real problem.

Avoid:

* Microservices
* Event-driven architecture
* CQRS
* Kafka
* Kubernetes
* Service Mesh
* Repository Pattern everywhere
* Excessive abstractions
* Premature optimization

unless explicitly required.

For this project:

* Frontend Only
* Mock Data
* Approximately 1500 Users
* Single Team Development

Prefer the simplest scalable solution.

---

# Technology Stack

Use only:

* Next.js App Router
* TypeScript
* Tailwind CSS
* Shadcn UI
* Zustand
* Framer Motion
* TanStack Table
* Recharts
* dnd-kit
* Iconsax React

Do not introduce alternative frameworks without approval.

---
# State Management Rules

Use Zustand.

Do not use:

* Redux
* MobX
* Recoil

unless explicitly requested.

State must remain normalized.

Bad:

tasks.find(...)

Good:

Map<string, Task>

Prefer O(1) lookups whenever practical.

---

# Performance Rules

Always consider:

* Render Count
* Re-renders
* Memory Usage
* Bundle Size

Use:

* useMemo
* useCallback
* React.memo

only when measurable benefits exist.

Do not wrap everything in memoization.

Avoid unnecessary renders.

---

# Large List Rules

For large datasets:

* Employees
* Tasks
* Projects

Use virtualization.

Preferred:

* TanStack Virtual

Alternative:

* react-window

Never render thousands of DOM nodes simultaneously.

---

# Component Rules

Maximum component size:

* Preferred: < 200 lines
* Warning: > 300 lines
* Refactor: > 500 lines

Split large screens into:

* Container
* Presentation Components
* Feature Components

Avoid God Components.

---

# TypeScript Rules

Never use:

any

Avoid:

unknown

Prefer explicit types.

Create:

* Interfaces
* Types
* Enums

for all domain entities.

All functions must have typed parameters and return values.

---

# Security Rules

Never trust user input.

Always validate forms using:

Zod

Never use:

dangerouslySetInnerHTML

unless content is sanitized.

If HTML rendering is required:

Use DOMPurify.

Never expose secrets.

Never hardcode:

* API Keys
* Tokens
* Secrets

into source code.

---

# Memory Leak Prevention

Every effect must be reviewed.

Always cleanup:

* Event Listeners
* Intervals
* Timeouts
* WebSocket Connections
* Observers

Example:

return () => {
clearInterval(timer);
};

Never leave subscriptions active after unmount.

---

# Accessibility Rules

Every interactive element must support:

* Keyboard Navigation
* Focus States
* Screen Readers

Use semantic HTML whenever possible.

Prefer:

button

instead of clickable div.

---

# UI Rules

Use:

* Consistent spacing
* Consistent typography
* Consistent color tokens

Do not hardcode values repeatedly.

Use design tokens.

Avoid inline styles.

Prefer reusable UI components.

---

# Folder Ownership Rules

Features must not directly depend on other features.

Allowed:

Feature → Shared UI

Feature → Utils

Feature → Store

Avoid:

Feature A → Feature B → Feature C

Reduce coupling.

---

# Error Handling Rules

Never silently fail.

Provide:

* Error Boundaries
* Empty States
* Loading States
* Skeleton Loaders

Every async operation must have:

* Loading
* Success
* Error

states.

---

# Animation Rules

Use Framer Motion.

Animations must:

* Improve UX
* Be performant
* Respect reduced motion preferences

Avoid excessive animation.

No animation should block interaction.

---

# Code Review Checklist

Before generating code verify:

✓ TypeScript Strict Mode Compatible

✓ No Memory Leaks

✓ No Unnecessary Re-renders

✓ No Dead Code

✓ No Duplicate Logic

✓ Responsive

✓ Accessible

✓ Production Ready

✓ Scalable For 1500+ Users

✓ Consistent With Existing Architecture

---

# Output Expectations

Whenever implementing a feature:

1. Analyze requirements first.
2. Identify edge cases.
3. Explain architecture decisions.
4. Implement production-grade solution.
5. Avoid overengineering.
6. Follow existing project conventions.
7. Optimize for maintainability over cleverness.

If multiple approaches exist:

Choose the simplest solution that scales.
