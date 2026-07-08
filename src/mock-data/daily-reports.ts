import type { DailyReport } from "@/src/types";

export const dailyReports: DailyReport[] = [
  // ── Neha Kapoor Reports (GTF-2210) ──────────────────────
  {
    id: "dr-neha-1",
    employeeId: "GTF-2210",
    managerId: "u-manager-1",
    date: "2026-06-23",
    taskLogs: [
      {
        id: "tl-neha-1",
        title: "Task 1",
        description: "Operations queue reconciliation and vendor follow-ups.",
        category: "Operations",
        priority: "high",
        status: "completed",
        timeSpent: "4.5h 0m",
        expectedDate: "2026-06-23",
        notes: "Cleared the backlog of vendor queries.",
      },
      {
        id: "tl-neha-2",
        title: "Task 2",
        description: "Reviewing daily dispatch log error rates.",
        category: "Operations",
        priority: "medium",
        status: "in-progress",
        timeSpent: "3.0h 0m",
        expectedDate: "2026-06-24",
        notes: "Investigation ongoing.",
      },
    ],
    meetingCalls: [
      {
        id: "mc-neha-1",
        subject: "Vendor Coordination Call",
        withWhom: "Alibaba Ops Team",
        time: "11:00 AM",
        duration: "30",
        type: "call",
      }
    ],
    endOfDayNotes: {
      pending: "Process pending Alibaba invoices.",
      challenges: "Delay in API updates from Alibaba dispatch.",
      planForTomorrow: "Sync with logistics on Alibaba API.",
    },
    status: "submitted",
  },
  {
    id: "dr-neha-2",
    employeeId: "GTF-2210",
    managerId: "u-manager-1",
    date: "2026-06-22",
    taskLogs: [
      {
        id: "tl-neha-3",
        title: "Daily Tasks",
        description: "Daily dispatch verification and ticket processing.",
        category: "Operations",
        priority: "high",
        status: "completed",
        timeSpent: "8h 0m",
        expectedDate: "2026-06-22",
        notes: "No errors logged.",
      },
    ],
    meetingCalls: [],
    endOfDayNotes: {
      pending: "None",
      challenges: "None",
      planForTomorrow: "Carry forward reconciliation.",
    },
    status: "submitted",
  },

  // ── Fatima Khan Reports (GTF-1980) ──────────────────────
  {
    id: "dr-fatima-1",
    employeeId: "GTF-1980",
    managerId: "u-manager-1",
    date: "2026-06-23",
    taskLogs: [
      {
        id: "tl-fatima-1",
        title: "Task 1",
        description: "Oversee operational workflow optimization",
        category: "Operations",
        priority: "medium",
        status: "in-progress",
        timeSpent: "5.5h 0m",
        expectedDate: "2026-06-25",
        notes: "Drafted workflow checklist.",
      },
    ],
    meetingCalls: [
      {
        id: "mc-fatima-1",
        subject: "Weekly Sync",
        withWhom: "Operations Team",
        time: "10:00 AM",
        duration: "30",
        type: "meeting",
      }
    ],
    endOfDayNotes: {
      pending: "Workflow checklist review.",
      challenges: "Getting feedback from all stakeholders.",
      planForTomorrow: "Finalize operations checklist.",
    },
    status: "submitted",
  },

  // ── Kuldeep Reports (GTF-1042) ──────────────────────────
  {
    id: "dr-kuldeep-1",
    employeeId: "GTF-1042",
    managerId: "u-manager-1",
    date: "2026-06-23",
    taskLogs: [
      {
        id: "tl-kuldeep-1",
        title: "Task 1",
        description: "Dispatch documentation mapping",
        category: "Operations",
        priority: "low",
        status: "completed",
        timeSpent: "6.0h 0m",
        expectedDate: "2026-06-23",
        notes: "Uploaded all logs.",
      },
    ],
    endOfDayNotes: {
      pending: "Scan pending packages list.",
      challenges: "Scanner device battery issues.",
      planForTomorrow: "Perform hardware health checks.",
    },
    status: "submitted",
  },

  // ── Standard Seeding for Other Employees ─────────────────
  {
    id: "dr-dev-1",
    employeeId: "GTF-1005",
    managerId: "u-manager-1",
    date: "2026-06-22",
    taskLogs: [
      {
        id: "tl-dev-1",
        title: "Task 1",
        description: "Work on API Gateway migration",
        category: "Development",
        priority: "high",
        status: "completed",
        timeSpent: "4h 0m",
        expectedDate: "2026-06-22",
        notes: "Completed initial setup and basic routing.",
      },
      {
        id: "tl-dev-2",
        title: "Task 2",
        description: "Review pull requests",
        category: "Code Review",
        priority: "medium",
        status: "in-progress",
        timeSpent: "1h 30m",
        expectedDate: "2026-06-23",
        notes: "Reviewed two PRs, provided feedback.",
      },
    ],
    meetingCalls: [
      {
        id: "mc-dev-1",
        subject: "Daily Standup",
        withWhom: "Platform Team",
        time: "09:00 AM",
        duration: "30",
        type: "standup",
      },
    ],
    endOfDayNotes: {
      pending: "Further testing on API Gateway endpoints.",
      challenges: "Some unexpected issues with legacy service integration.",
      planForTomorrow: "Address integration issues, continue PR reviews.",
    },
    status: "submitted",
  },
];
