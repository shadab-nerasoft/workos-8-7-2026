export type UserRole = "admin" | "manager" | "employee";

export type ProjectStatus = "planning" | "active" | "at-risk" | "completed";

export type TaskStatus = "backlog" | "todo" | "in-progress" | "review" | "completed";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  teamId: string;
  avatar: string;
  utilization: number;
  performance: number;
  department?: string;
  canCreateTeam?: boolean;
  createdBy?: string;
  workingDaysPerWeek?: number;
  designation?: string;
  reportingManager?: string;
  reportingManagerEmail?: string;
  mobileNumber?: string;
}

export interface Team {
  workingDaysPerWeek: number;
  id: string;
  name: string;
  leadId: string;
  memberIds: string[];
  projectIds: string[];
  health: number;
  velocity: number;
  description?: string;
  icon?: string;
  type?: string;
  priority?: string;
  goals?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  teamId: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
  startDate?: string;
  budget: number;
  delayedTasks: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: Priority;
  deadline: string;
  comments: number;
  attachments: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  commentsList?: TaskComment[];
  attachmentsList?: TaskAttachment[];
  labels?: string[];
  watchers?: string[];
  order?: number;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  replies?: TaskComment[];
  edited: boolean;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: "created" | "updated" | "commented" | "assigned" | "status_changed" | "priority_changed" | "deadline_changed" | "attachment_added" | "label_added" | "label_removed" | "subtask_added" | "dependency_added" | "archived" | "restored";
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  createdAt: string;
  createdBy: string;
  order: number;
}

export interface TaskDependency {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  type: "blocks" | "blocked-by" | "relates-to" | "duplicate";
  createdAt: string;
  createdBy: string;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  projectId?: string;
}

export interface TaskSearchFilter {
  id: string;
  name: string;
  conditions: FilterCondition[];
  createdBy: string;
  createdAt: string;
  isDefault?: boolean;
}

export interface FilterCondition {
  field: "status" | "priority" | "assignee" | "label" | "deadline" | "created" | "updated";
  operator: "equals" | "contains" | "greater-than" | "less-than" | "between" | "is-empty";
  value: string | string[] | Date;
}

export interface ArchivedTask {
  id: string;
  task: Task;
  archivedAt: string;
  archivedBy: string;
  reason?: string;
}

export interface BulkOperation {
  id: string;
  taskIds: string[];
  operation: "status" | "priority" | "assign" | "label" | "archive" | "delete";
  value?: string;
  createdAt: string;
  createdBy: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface TaskNotification {
  id: string;
  userId: string;
  taskId: string;
  type: "assigned" | "mentioned" | "status_changed" | "deadline_approaching" | "commented" | "dependency_blocked";
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface KeyboardShortcut {
  key: string;
  modifiers: ("ctrl" | "shift" | "alt" | "cmd")[];
  action: string;
  description: string;
}

export interface Activity {
  id: string;
  actorId: string;
  action: string;
  subject: string;
  timestamp: string;
  projectId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
}

export interface AnalyticsPoint {
  label: string;
  completed: number;
  delayed: number;
  productivity: number;
}

export interface TeamAnalytics {
  teamId: string;
  completionRate: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  avgVelocity: number;
}

export interface DashboardData {
  currentUser: User;
  stats: Stat[];
  projects: Project[];
  tasks: Task[];
  teams: Team[];
  users: User[];
  activity: Activity[];
  analytics: AnalyticsPoint[];
}

export interface Stat {
  label: string;
  value: string;
  change: string;
  tone: "primary" | "success" | "warning" | "error" | "info";
}

export interface DailyReport {
  id: string;
  employeeId: string;
  managerId: string;
  date: string;
  taskLogs: TaskLogEntry[];
  meetingCalls?: MeetingCallEntry[];
  endOfDayNotes: EndOfDayNotes;
  status: "submitted" | "missing" | "draft";
}

export interface TaskLogEntry {
  id: string;
  title?: string;
  description: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  timeSpent: string;
  expectedDate: string;
  notes: string;
}

export interface MeetingCallEntry {
  id: string;
  subject: string;
  withWhom: string;
  time: string;
  duration: string;
  type: "meeting" | "call" | "review" | "standup";
}

export interface EndOfDayNotes {
  pending: string;
  challenges: string;
  planForTomorrow: string;
}

export interface TableColumn<TItem> {
  key: Extract<keyof TItem, string>;
  label: string;
}

export interface Permissions {
  canCreateTeam: boolean;
  canEditTeam: boolean;
  canDeleteTeam: boolean;
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canAssignTasks: boolean;
  canManageEmployees: boolean;
  canViewAllTeams: boolean;
  canViewAllProjects: boolean;
  canViewCompanyAnalytics: boolean;
  canViewTeamAnalytics: boolean;
  canViewSettings: boolean;
  canEditSettings: boolean;
  canCreateDailyReport: boolean;
  canViewTeams: boolean;
}
