# Role-Based Access Control (RBAC) Detailed Report
## GFT Workspace Task Management System

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Role Architecture](#role-architecture)
3. [Admin Role - Complete Details](#admin-role---complete-details)
4. [Manager Role - Complete Details](#manager-role---complete-details)
5. [Employee Role - Complete Details](#employee-role---complete-details)
6. [Permission Matrix](#permission-matrix)
7. [Data Visibility Rules](#data-visibility-rules)
8. [Access Control Implementation](#access-control-implementation)
9. [Use Cases & Workflows](#use-cases--workflows)

---

## System Overview

The GFT Workspace uses a **three-tier hierarchical role-based access control system** with:
- **3 Roles**: Admin, Manager, Employee
- **19 Permissions**: Controlling all major operations
- **Role-Specific Dashboards**: Different views for different users
- **Granular Access Control**: From page-level to component-level permissions

### Role Hierarchy
```
Admin (Company-wide control)
  └── Manager (Team-level control)
      └── Employee (Individual-level control)
```

---

## Role Architecture

### 1. Role Definition
Located in: `src/types/index.ts`
```typescript
export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: string;
  name: string;
  role: UserRole;                    // Primary role identifier
  title: string;
  email: string;
  teamId: string;                    // Team assignment
  avatar: string;
  department?: string;
  reportingManager?: string;         // Reporting hierarchy
  designation?: string;
}
```

### 2. Permission System
Located in: `src/hooks/use-permission.ts`

The system uses a **PERMISSION_MAP** that statically defines all permissions for each role.

---

## Admin Role - Complete Details

### Overview
- **Scope**: Company-wide control
- **Access Level**: Unrestricted across all modules
- **Responsibility**: System administration, company metrics, team oversight

### Admin Permissions (18/19 Available)

| Permission | Value | Purpose |
|-----------|-------|---------|
| `canCreateTeam` | ✅ TRUE | Create new teams |
| `canEditTeam` | ✅ TRUE | Modify team settings |
| `canDeleteTeam` | ✅ TRUE | Remove teams (permanent) |
| `canCreateProject` | ✅ TRUE | Create projects in any team |
| `canEditProject` | ✅ TRUE | Modify project details |
| `canDeleteProject` | ✅ TRUE | Delete projects |
| `canCreateTask` | ✅ TRUE | Create tasks anywhere |
| `canEditTask` | ✅ TRUE | Edit any task |
| `canDeleteTask` | ✅ TRUE | Delete any task |
| `canAssignTasks` | ✅ TRUE | Assign tasks to anyone |
| `canManageEmployees` | ✅ TRUE | Create, edit, delete employees |
| `canViewAllTeams` | ✅ TRUE | View all teams (not just own) |
| `canViewAllProjects` | ✅ TRUE | View all projects |
| `canViewCompanyAnalytics` | ✅ TRUE | Access company-wide analytics |
| `canViewTeamAnalytics` | ✅ TRUE | View team-specific metrics |
| `canViewSettings` | ✅ TRUE | Access system settings |
| `canEditSettings` | ✅ TRUE | Modify system configuration |
| `canViewTeams` | ✅ TRUE | See teams list |
| `canCreateDailyReport` | ❌ FALSE | Cannot submit reports (admin role) |

### Admin Dashboard View
Located in: `src/app/page.tsx`

**Display:**
```
┌─────────────────────────────────────────────────┐
│ Admin Dashboard                                 │
│ Company Health & Performance                    │
│ High-level visibility into company-wide...      │
├─────────────────────────────────────────────────┤
│ • Company Statistics (4 KPI Cards)              │
│ • Company Analytics Chart (Sales/Performance)   │
│ • Recent Activity Timeline (All users)          │
│ • Project Health (All projects)                 │
└─────────────────────────────────────────────────┘
```

**Key Data Shown:**
- Total tasks across company
- Completed vs. in-progress tasks
- Overdue tasks company-wide
- Recent activities from all users
- All projects with health status

### Admin Navigation
Located in: `src/components/common/nav-links.tsx`

**Additional Menu Items for Admin:**
- Dashboard (root)
- Projects
- My Tasks
- Team Tasks
- Reports
- **Employees** (manage all)
- **Manager Tasks** (if manager)
- **All Tasks** (company-wide)
- Teams
- **Create Manager** (special admin feature)
- Calendar
- Analytics
- Profile
- Settings

### Admin Data Access

**Can See:**
- All users in all teams
- All projects across company
- All tasks (regardless of assignee)
- All daily reports submitted
- All comments and attachments
- Team performance metrics
- Company-wide analytics
- Employee performance data

**Cannot See:**
- Not applicable - admin has unrestricted access

### Admin Actions Available

**Team Management:**
- Create unlimited teams
- Edit team name, description, members
- Delete teams (with all associated data)
- Assign team leads (managers)

**Employee Management:**
- Create new employees (any role)
- Edit employee profiles
- Assign employees to teams
- Modify reporting manager
- Delete employees

**Project Management:**
- Create projects across any team
- Edit project scope, timeline, status
- Delete projects and all associated tasks
- Reassign project ownership

**Task Management:**
- Create tasks for anyone
- Edit any task properties (status, priority, deadline, assignee)
- Delete any task
- Assign/reassign tasks to any employee
- Add/remove task labels, dependencies, subtasks

**Report Viewing:**
- View all daily reports submitted by employees
- Export reports to CSV/PDF
- Analyze team productivity
- Track missing reports

---

## Manager Role - Complete Details

### Overview
- **Scope**: Team-level control (their assigned team only)
- **Access Level**: Full control within team boundaries
- **Responsibility**: Team oversight, task assignment, performance tracking

### Manager Permissions (14/19 Available)

| Permission | Value | Purpose |
|-----------|-------|---------|
| `canCreateTeam` | ✅ TRUE | Create sub-teams/workgroups |
| `canEditTeam` | ✅ TRUE | Modify team settings |
| `canDeleteTeam` | ❌ FALSE | Cannot delete (admin only) |
| `canCreateProject` | ✅ TRUE | Create projects for team |
| `canEditProject` | ✅ TRUE | Edit team projects |
| `canDeleteProject` | ❌ FALSE | Cannot delete projects |
| `canCreateTask` | ✅ TRUE | Create tasks for team |
| `canEditTask` | ✅ TRUE | Edit any team task |
| `canDeleteTask` | ✅ TRUE | Delete team tasks |
| `canAssignTasks` | ✅ TRUE | Assign tasks to team members |
| `canManageEmployees` | ✅ TRUE | Add/remove from team |
| `canViewAllTeams` | ❌ FALSE | Can only see own team |
| `canViewAllProjects` | ❌ FALSE | Can only see team projects |
| `canViewCompanyAnalytics` | ❌ FALSE | No company-wide analytics |
| `canViewTeamAnalytics` | ✅ TRUE | View team performance metrics |
| `canViewSettings` | ❌ FALSE | No system settings access |
| `canEditSettings` | ❌ FALSE | Cannot modify settings |
| `canViewTeams` | ✅ TRUE | See teams (own team) |
| `canCreateDailyReport` | ❌ FALSE | Managers don't submit reports |

### Manager Dashboard View
Located in: `src/app/page.tsx`

**Display:**
```
┌─────────────────────────────────────────────────┐
│ Manager Dashboard                               │
│ Managing [Department] Team                      │
│ Track your team's daily reports...              │
├─────────────────────────────────────────────────┤
│ • Team Delivery Trend (Chart - last 6 weeks)   │
│ • Team Activity (Timeline - 4 activities)      │
│ • Team Projects (Only team's projects)         │
└─────────────────────────────────────────────────┘
```

**Key Data Shown:**
- Team-specific delivery trends
- Recent team activities (limited to 4)
- Only projects assigned to their team
- Team member performance in context

### Manager Navigation
Located in: `src/components/common/nav-links.tsx`

**Menu Items for Manager:**
- Dashboard (root)
- Projects (team only)
- My Tasks
- Team Tasks
- **Team Reports** (instead of "Reports")
- **Employees** (team members only)
- **Team Tasks** (special manager view)
- Calendar
- Profile
- (NO Create Manager option)
- (NO All Tasks)
- (NO Analytics)
- (NO Settings)

### Manager Data Access

**Can See:**
- Team members' details
- Team-only projects
- Tasks assigned to team members
- Daily reports from team members
- Team performance metrics
- Team activity history

**Cannot See:**
- Other teams' data
- Company-wide analytics
- Other managers' information
- System settings
- Employee performance outside their team

### Manager Actions Available

**Team Management:**
- Create workgroups within team
- Edit team information
- Assign team members to tasks
- View team member reports
- (Cannot delete teams)

**Project Management:**
- Create projects (in their team)
- Edit project details
- View team project progress
- (Cannot delete projects)

**Task Management:**
- Create tasks for team members
- Edit any team task
- Delete team tasks
- Assign/reassign tasks within team
- Set task priorities and deadlines
- Add labels and dependencies

**Employee Management:**
- View team member profiles
- See team member workload
- Track individual performance
- Monitor daily reports

---

## Employee Role - Complete Details

### Overview
- **Scope**: Individual-level control (own tasks & reports)
- **Access Level**: Limited to personal work
- **Responsibility**: Task execution, daily reporting

### Employee Permissions (1/19 Available)

| Permission | Value | Purpose |
|-----------|-------|---------|
| `canCreateTeam` | ❌ FALSE | No team creation |
| `canEditTeam` | ❌ FALSE | No team editing |
| `canDeleteTeam` | ❌ FALSE | No team deletion |
| `canCreateProject` | ❌ FALSE | No project creation |
| `canEditProject` | ❌ FALSE | No project editing |
| `canDeleteProject` | ❌ FALSE | No project deletion |
| `canCreateTask` | ❌ FALSE | No task creation |
| `canEditTask` | ❌ FALSE | No task editing |
| `canDeleteTask` | ❌ FALSE | No task deletion |
| `canAssignTasks` | ❌ FALSE | No task assignment |
| `canManageEmployees` | ❌ FALSE | No employee management |
| `canViewAllTeams` | ❌ FALSE | Cannot view other teams |
| `canViewAllProjects` | ❌ FALSE | Cannot view all projects |
| `canViewCompanyAnalytics` | ❌ FALSE | No company analytics |
| `canViewTeamAnalytics` | ❌ FALSE | No team analytics |
| `canViewSettings` | ❌ FALSE | No settings access |
| `canEditSettings` | ❌ FALSE | Cannot edit settings |
| `canViewTeams` | ❌ FALSE | No team list access |
| `canCreateDailyReport` | ✅ TRUE | Submit daily reports |

### Employee Dashboard View
Located in: `src/app/page.tsx`

**Display:**
```
┌─────────────────────────────────────────────────┐
│ Employee Dashboard                              │
│ Welcome back, [Employee Name]                  │
│ Manage your daily tasks, submit reports...      │
├─────────────────────────────────────────────────┤
│ • My Tasks (Assigned to me)                    │
│ • My Projects (Related to my tasks)            │
│ • Daily Report Status (Submitted/Pending)      │
│ • Report Submission Cards                      │
└─────────────────────────────────────────────────┘
```

**Key Data Shown:**
- Only tasks assigned to them
- Only projects related to their tasks
- Daily report submission status
- Missing report count

### Employee Navigation
Located in: `src/components/common/nav-links.tsx`

**Menu Items for Employee:**
- Dashboard (root)
- Projects (only assigned projects)
- My Tasks
- Team Tasks (view only)
- **Daily Report** (submit report)
- **My Reports** (view submitted reports)
- Calendar
- Profile
- (NO Employees)
- (NO Team Reports)
- (NO All Tasks)
- (NO Analytics)
- (NO Settings)
- (NO Teams)

### Employee Data Access

**Can See:**
- Own assigned tasks
- Tasks in projects they're working on
- Team tasks (read-only)
- Own daily reports
- Team member list
- Own calendar

**Cannot See:**
- Other employees' tasks (except team tasks board)
- Projects they're not assigned to
- Company analytics
- Team analytics
- Employee directory
- System settings
- Other employees' reports

### Employee Actions Available

**Daily Work:**
- View assigned tasks
- View task details, comments, attachments
- See task status and priority
- View subtasks and dependencies
- Read comments from others
- Download attachments

**Reporting:**
- Submit daily reports
- Edit draft reports
- View submitted reports
- Track report submission history

---

## Permission Matrix

### Comprehensive Permission Grid

```
╔════════════════════════════════╦═════════╦═════════╦═════════╗
║ Permission                     ║ Admin   ║ Manager ║ Employee║
╠════════════════════════════════╬═════════╬═════════╬═════════╣
║ Team Management                ║         ║         ║         ║
║  - Create Team                 ║    ✅   ║    ✅   ║    ❌   ║
║  - Edit Team                   ║    ✅   ║    ✅   ║    ❌   ║
║  - Delete Team                 ║    ✅   ║    ❌   ║    ❌   ║
║                                ║         ║         ║         ║
║ Project Management             ║         ║         ║         ║
║  - Create Project              ║    ✅   ║    ✅   ║    ❌   ║
║  - Edit Project                ║    ✅   ║    ✅   ║    ❌   ║
║  - Delete Project              ║    ✅   ║    ❌   ║    ❌   ║
║                                ║         ║         ║         ║
║ Task Management                ║         ║         ║         ║
║  - Create Task                 ║    ✅   ║    ✅   ║    ❌   ║
║  - Edit Task                   ║    ✅   ║    ✅   ║    ❌   ║
║  - Delete Task                 ║    ✅   ║    ✅   ║    ❌   ║
║  - Assign Tasks                ║    ✅   ║    ✅   ║    ❌   ║
║                                ║         ║         ║         ║
║ Employee Management            ║         ║         ║         ║
║  - Manage Employees            ║    ✅   ║    ✅   ║    ❌   ║
║                                ║         ║         ║         ║
║ Viewing Access                 ║         ║         ║         ║
║  - View All Teams              ║    ✅   ║    ❌   ║    ❌   ║
║  - View All Projects           ║    ✅   ║    ❌   ║    ❌   ║
║  - View Teams List             ║    ✅   ║    ✅   ║    ❌   ║
║                                ║         ║         ║         ║
║ Analytics & Reporting         ║         ║         ║         ║
║  - Company Analytics           ║    ✅   ║    ❌   ║    ❌   ║
║  - Team Analytics              ║    ✅   ║    ✅   ║    ❌   ║
║  - Create Daily Report         ║    ❌   ║    ❌   ║    ✅   ║
║                                ║         ║         ║         ║
║ System Management              ║         ║         ║         ║
║  - View Settings               ║    ✅   ║    ❌   ║    ❌   ║
║  - Edit Settings               ║    ✅   ║    ❌   ║    ❌   ║
╚════════════════════════════════╩═════════╩═════════╩═════════╝

Legend: ✅ = Allowed | ❌ = Denied
```

---

## Data Visibility Rules

### Task Visibility

**Admin sees:**
- ALL tasks in system
- Filter by: assignee, project, status, priority, team

**Manager sees:**
- Tasks in their team
- Tasks in their team's projects
- Can view team member's tasks
- Filter by: assignee (team only), status, priority

**Employee sees:**
- Own assigned tasks
- Team tasks board (read-only visibility)
- Subtasks of assigned tasks
- Dependencies of assigned tasks

### Project Visibility

**Admin sees:**
- ALL projects
- View across all teams
- Can see archived projects
- Full project details

**Manager sees:**
- Team's projects only
- Cannot see other teams' projects
- Full project details for own team
- Can view project members

**Employee sees:**
- Projects they're assigned to
- Projects their assigned tasks belong to
- Limited project details (task-related)
- Cannot create or modify projects

### Employee/User Visibility

**Admin sees:**
- All employees in company
- Employee details: name, role, team, performance, utilization
- Can view by department
- Can sort by performance metrics

**Manager sees:**
- Team members only
- Full details of team members
- Can see their team's structure
- Cannot see employees from other teams

**Employee sees:**
- Team member list (basic info)
- Own profile details
- Cannot see employee directory
- Cannot see company org chart

### Report Visibility

**Admin sees:**
- All daily reports from all employees
- Can filter by employee, date, status
- Can export reports
- Can see missing reports

**Manager sees:**
- Team members' daily reports only
- Can track submission status
- Can see missing reports from team
- Can export team reports

**Employee sees:**
- Own submitted reports only
- Cannot see team reports
- Can track own submission history
- Can download own reports

---

## Access Control Implementation

### 1. Permission Hook Pattern
Located in: `src/hooks/use-permission.ts`

```typescript
export function usePermissions(): Permissions {
  const currentUser = useAuthStore((s) => s.currentUser);

  return useMemo(() => {
    if (!currentUser) return DEFAULT_PERMISSIONS;
    return PERMISSION_MAP[currentUser.role];
  }, [currentUser]);
}

// Usage in components:
const { canCreateProject, canViewAllTeams } = usePermissions();

if (!canCreateProject) {
  return <RestrictedAccess />;
}
```

### 2. Navigation-Level Access Control
Located in: `src/components/common/nav-links.tsx`

```typescript
// Admin-specific menu items
if (currentUser?.role === "admin") {
  items.push({ href: "/admin-tasks", label: "All Tasks" });
  items.push({ href: "/admin/create-manager", label: "Create Manager" });
}

// Manager-specific menu items
if (currentUser?.role === "manager") {
  items.push({ href: "/manager-tasks", label: "Team Tasks" });
}

// Employee-specific menu items
if (isEmployee) {
  items.push({ href: "/daily-report", label: "Daily Report" });
  items.push({ href: "/reports", label: "My Reports" });
}
```

### 3. Page-Level Access Control
Located in: `src/app/page.tsx`

```typescript
const getHeaderInfo = () => {
  switch (currentUser.role) {
    case "admin":
      return { title: "Company Health & Performance" };
    case "manager":
      return { title: `Managing ${department} Team` };
    default:
      return { title: `Welcome back, ${name}` };
  }
};
```

### 4. Component-Level Access Control
Located in: `src/components/sections/dashboard-section.tsx`

```typescript
if (currentUser.role === "admin") {
  return <AdminDashboard />;
}

if (currentUser.role === "manager") {
  return <ManagerDashboard />;
}

// Default: Employee view
return <EmployeeDashboard />;
```

### 5. Data Filtering by Role
Located in: `src/app/manager-tasks/page.tsx`

```typescript
// Manager: Get team members
const teamMemberIds = useMemo(() => {
  if (!currentUser) return [];
  return usersList
    .filter((user) => user.teamId === currentUser.teamId)
    .map((user) => user.id);
}, [usersList, currentUser]);

// Get team tasks
const teamTasks = tasks.filter((t) =>
  teamMemberIds.includes(t.assigneeId)
);
```

### 6. Store-Level Access Patterns
Located in: `src/store/task-store.ts`

```typescript
// Admin method - returns all tasks
getTeamTasks: (teamMemberIds) =>
  get().tasksList.filter((t) => 
    teamMemberIds.includes(t.assigneeId)
  ),

// Employee method - returns only own tasks
getTasksByAssignee: (assigneeId) =>
  get().tasksList.filter((t) => t.assigneeId === assigneeId),
```

---

## Use Cases & Workflows

### Use Case 1: Admin Creates and Assigns Task

**Workflow:**
1. Admin logs in → sees "Company Health & Performance" dashboard
2. Admin navigates to "All Tasks"
3. Admin clicks "Create Task"
4. Fills form:
   - Title: "Setup Database Migration"
   - Project: Select from all projects
   - Assignee: Select from all employees
   - Priority: High
   - Deadline: 2026-07-15
5. Adds subtasks and dependencies
6. System records activity
7. Manager & assigned employee see task in their views
8. Admin can later edit, delete, or reassign task

**Permissions Used:**
- ✅ canCreateTask
- ✅ canAssignTasks
- ✅ canViewAllProjects

---

### Use Case 2: Manager Tracks Team Progress

**Workflow:**
1. Manager logs in → sees "Managing [Department] Team" dashboard
2. Sees team delivery trend chart (last 6 weeks)
3. Reviews team activity timeline (4 recent activities)
4. Clicks on "Team Tasks" to see all tasks
5. Can filter by status:
   - Backlog: 5 tasks
   - To Do: 3 tasks
   - In Progress: 2 tasks
   - Review: 1 task
   - Completed: 8 tasks
6. Clicks on an in-progress task, sees:
   - Assigned to: John Doe
   - Subtasks progress: 60% complete
   - Comments: 3 comments
   - No blockers
7. Manager can reassign or change priority if needed

**Permissions Used:**
- ✅ canViewTeamAnalytics
- ✅ canEditTask
- ✅ canAssignTasks

**Cannot Do:**
- ❌ Cannot view other teams' tasks
- ❌ Cannot delete task
- ❌ Cannot view company analytics

---

### Use Case 3: Employee Submits Daily Report

**Workflow:**
1. Employee logs in → sees personalized dashboard
2. Views assigned tasks (only own tasks visible)
3. Sees 5 tasks assigned to them
4. Navigates to "Daily Report" link
5. Fills report form:
   - Date: Today
   - Tasks completed today: 2
   - Tasks in progress: 2
   - Blockers: None
   - Comments: Team meeting scheduled
6. Submits report
7. System records submission
8. Manager can now see this report
9. Employee can view "My Reports" history

**Permissions Used:**
- ✅ canCreateDailyReport
- ✅ View own tasks
- ✅ View own projects

**Cannot Do:**
- ❌ Cannot create tasks
- ❌ Cannot see other employees' tasks
- ❌ Cannot see team analytics
- ❌ Cannot assign tasks
- ❌ Cannot access settings

---

### Use Case 4: Admin Creates New Manager

**Workflow:**
1. Admin navigates to "Create Manager"
2. Fills form:
   - Name: "Jane Smith"
   - Email: jane@company.com
   - Team: Select from all teams
   - Department: Operations
3. System creates user with "manager" role
4. Jane receives login credentials
5. On first login, Jane sees:
   - Manager dashboard (team-specific)
   - Team tasks only
   - Team members' reports
   - Cannot see other teams

**Permissions Used:**
- ✅ canManageEmployees
- ✅ Role assignment capability

---

### Use Case 5: Manager Archives Old Project

**Workflow:**
1. Manager navigates to "Projects"
2. Sees only team's projects:
   - Active projects: 3
   - Completed: 5
3. Clicks on completed project from 6 months ago
4. Wants to clean up, selects "Archive"
5. System moves project to archive
6. Project hidden from main view
7. Can still search for archived projects
8. Only manager or admin can restore

**Permissions Used:**
- ✅ canEditProject (for archiving)
- ✅ Can only archive own team's projects

**Limitation:**
- ❌ Cannot permanently delete (admin only)

---

## Security Considerations

### 1. Frontend Permission Enforcement
- Checks permissions in navigation
- Hides UI elements based on role
- Redirects unauthorized access

### 2. Backend Permission Enforcement
(Should be implemented on backend API)
- Verify role before allowing operation
- Filter data queries by user role
- Log access attempts
- Prevent direct API circumvention

### 3. Data Isolation
- Employees see only own data
- Managers see only team data
- Admins see all data
- No cross-team access

### 4. Role Switching
Located in: `src/store/auth-store.ts`
```typescript
switchRole: (role, allUsers) => {
  const userForRole = allUsers.find((u) => u.role === role);
  if (userForRole) {
    set({ currentUser: userForRole });
  }
};
```
- Used for testing different roles
- Should be restricted to admin/testing only in production

---

## Summary Table

| Aspect | Admin | Manager | Employee |
|--------|-------|---------|----------|
| **Scope** | Company-wide | Team-level | Individual |
| **Teams** | All | Own team | Own team |
| **Projects** | All | Team's | Assigned |
| **Tasks** | All | Team's | Own |
| **Can Create** | Everything | Team items | Reports only |
| **Can Delete** | Everything | Team items | Nothing |
| **Can Assign** | Everyone | Team members | Self only |
| **Reports** | View all | View team | View own |
| **Analytics** | Company + Team | Team only | None |
| **Settings** | Full access | No access | No access |

---

## Conclusion

The RBAC system provides **hierarchical, role-based data access** with:
- Clear separation of concerns
- Granular permission control
- Role-specific dashboards
- Proper data isolation
- Scalable permission management

Each role has appropriate access for their responsibilities without exposing sensitive data or allowing unauthorized operations.
