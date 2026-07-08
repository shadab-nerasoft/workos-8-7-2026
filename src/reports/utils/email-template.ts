interface EmailTemplateData {
  managerEmail?: string;
  employeeName: string;
  reportDate: string;
  day?: string;
  department: string;
  designation: string;
  managerName: string; // Used for "Reporting To" and Signature
  totalHours: number;
  tasks: {
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    status?: string;
    timeSpent?: number | string;
    completion?: number | string;
    plannedBy?: string;
    notes?: string;
  }[];
  meetings: {
    subject?: string;
    withWhom?: string;
    time?: string;
    duration?: number | string;
    type?: string;
    outcome?: string;
  }[];
  pending: string;
  blockers: string;
  tomorrowPlan: string;
  keyAccomplishments?: string;
  overallScore?: string | number;
}

export function escapeHtml(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeHtmlMultiline(str: string | undefined | null): string {
  if (!str) return "";
  return escapeHtml(str).replace(/\r?\n/g, "<br/>");
}

function getPriorityBadge(priority: string | undefined | null): string {
  if (!priority) return "&nbsp;";
  const p = priority.trim().toLowerCase();
  let bg = "#f3f4f6";
  let color = "#374151";
  let border = "#e5e7eb";
  const displayVal = priority.trim();
  
  if (p === "high" || p === "critical" || p === "urgent") {
    bg = "#fef2f2";
    color = "#b91c1c";
    border = "#fca5a5";
  } else if (p === "medium") {
    bg = "#fffbeb";
    color = "#b45309";
    border = "#fcd34d";
  } else if (p === "low") {
    bg = "#f0fdf4";
    color = "#15803d";
    border = "#86efac";
  }
  
  return `<span style="display: inline-block; padding: 2px 6px; font-weight: bold; font-size: 9px; border-radius: 4px; border: 1px solid ${border}; background-color: ${bg}; color: ${color}; text-transform: capitalize;">${escapeHtml(displayVal)}</span>`;
}

function getStatusBadge(status: string | undefined | null): string {
  if (!status) return "&nbsp;";
  const s = status.trim().toLowerCase();
  let bg = "#f3f4f6";
  let color = "#374151";
  let border = "#e5e7eb";
  let displayStatus = status.trim();
  
  if (s === "completed" || s === "done") {
    bg = "#f0fdf4";
    color = "#15803d";
    border = "#86efac";
    displayStatus = "Completed";
  } else if (s === "in-progress" || s === "in progress") {
    bg = "#eff6ff";
    color = "#1d4ed8";
    border = "#93c5fd";
    displayStatus = "In Progress";
  } else if (s === "todo" || s === "to do" || s === "pending") {
    bg = "#f8fafc";
    color = "#475569";
    border = "#cbd5e1";
    displayStatus = "To Do";
  } else if (s === "review") {
    bg = "#faf5ff";
    color = "#6b21a8";
    border = "#e9d5ff";
    displayStatus = "Review";
  } else if (s === "aborted" || s === "abort" || s === "backlog") {
    bg = "#fef2f2";
    color = "#b91c1c";
    border = "#fca5a5";
  }
  
  return `<span style="display: inline-block; padding: 2px 6px; font-weight: bold; font-size: 9px; border-radius: 4px; border: 1px solid ${border}; background-color: ${bg}; color: ${color}; text-transform: capitalize;">${escapeHtml(displayStatus)}</span>`;
}

export function generateHtmlEmail(data: EmailTemplateData): string {
  const validMeetings = data.meetings?.filter(m => 
    (m.subject && m.subject.trim()) || 
    (m.withWhom && m.withWhom.trim()) || 
    (m.outcome && m.outcome.trim())
  ) || [];

  const hasKeyAcc = data.keyAccomplishments && data.keyAccomplishments.trim().length > 0;
  const hasPending = data.pending && data.pending.trim().length > 0;
  const hasBlockers = data.blockers && data.blockers.trim().length > 0;
  const hasTomorrow = data.tomorrowPlan && data.tomorrowPlan.trim().length > 0;
  const hasAnyNotes = hasKeyAcc || hasPending || hasBlockers || hasTomorrow;
  
  const tasksHtml = data.tasks.map((task, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#e8f4f8'};">
      <td style="border: 1px solid #23304c; padding: 6px 4px; text-align: center; font-weight: bold; color: #333333; width: 20px;">${i + 1}</td>
      <td style="border: 1px solid #23304c; padding: 6px 8px; text-align: left; color: #1a73e8;">
        <div style="font-weight: bold; color: #1a73e8; margin-bottom: 2px;">${task.title ? escapeHtml(task.title) : `Task ${i + 1}`}</div>
        <div style="color: #333333; font-size: 9px;">${task.description ? escapeHtml(task.description) : "&nbsp;"}</div>
      </td>
      <td style="border: 1px solid #23304c; padding: 6px 4px; text-align: center; color: #1a73e8; width: 60px; font-weight: 500;">${task.category ? escapeHtml(task.category) : "&nbsp;"}</td>
      <td style="border: 1px solid #23304c; padding: 6px 4px; text-align: center; width: 60px;">${getPriorityBadge(task.priority)}</td>
      <td style="border: 1px solid #23304c; padding: 6px 4px; text-align: center; width: 60px;">${getStatusBadge(task.status)}</td>
      <td style="border: 1px solid #23304c; padding: 6px 4px; text-align: center; color: #1a73e8; width: 40px; font-weight: bold;">${task.timeSpent !== undefined && task.timeSpent !== "" ? task.timeSpent : "0.0"}</td>
      <td style="border: 1px solid #23304c; padding: 6px 4px; text-align: center; color: #1a73e8; width: 60px;">${task.plannedBy ? escapeHtml(task.plannedBy) : "&nbsp;"}</td>
      <td style="border: 1px solid #23304c; padding: 6px 8px; text-align: left; color: #1a73e8;">${task.notes ? escapeHtml(task.notes) : "&nbsp;"}</td>
    </tr>
  `).join("");

  const meetingsHtml = validMeetings.map((meeting, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#e8f4f8'};">
      <td style="border: 1px solid #23304c; padding: 6px 4px; text-align: center; font-weight: bold; color: #333333; width: 20px;">${i + 1}</td>
      <td style="border: 1px solid #23304c; padding: 6px 8px; text-align: left; color: #1a73e8;">${meeting.subject ? escapeHtml(meeting.subject) : "&nbsp;"}</td>
      <td style="border: 1px solid #23304c; padding: 6px 4px; text-align: center; color: #1a73e8;">${meeting.withWhom ? escapeHtml(meeting.withWhom) : "&nbsp;"}</td>
      <td style="border: 1px solid #23304c; padding: 6px 4px; text-align: center; color: #1a73e8; width: 60px;">${meeting.time ? escapeHtml(meeting.time) : "&nbsp;"}</td>
      <td style="border: 1px solid #23304c; padding: 6px 4px; text-align: center; color: #1a73e8; width: 50px;">${meeting.duration !== undefined && meeting.duration !== "" ? meeting.duration : "0"}</td>
      <td style="border: 1px solid #23304c; padding: 6px 4px; text-align: center; color: #1a73e8; width: 60px;">${meeting.type ? escapeHtml(meeting.type) : "&nbsp;"}</td>
      <td style="border: 1px solid #23304c; padding: 6px 8px; text-align: left; color: #1a73e8;">${meeting.outcome ? escapeHtml(meeting.outcome) : "&nbsp;"}</td>
    </tr>
  `).join("");

  const tasksCompleted = data.tasks.filter(t => {
    const s = (t.status || "").toLowerCase();
    return s === "completed" || s === "done";
  }).length;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Report</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
  <div style="background-color: #ffffff; max-width: 700px; margin: 0 auto; font-size: 11px; line-height: 1.4; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
    
    <!-- Top Header -->
    <div style="background-color: #23304c; color: #ffffff; padding: 20px 16px; text-align: center; border-bottom: 4px solid #d8a036;">
      <h1 style="font-size: 18px; font-weight: bold; margin: 0; letter-spacing: 0.5px;">📋 EMPLOYEE DAILY WORK REPORT</h1>
      <div style="margin-top: 8px; font-size: 10px; color: #d8a036; font-style: italic; font-weight: 500;">
        Office: 9:30 AM – 7:00 PM &nbsp;|&nbsp; Lunch: 2:00 PM – 2:30 PM &nbsp;|&nbsp; Net Working Hours: 9 Hrs / Day
      </div>
    </div>

    <!-- Employee Info -->
    <table width="100%" style="border-collapse: collapse; font-size: 11px; margin: 16px 0; padding: 0 16px;">
      <tr>
        <td style="padding: 6px 8px; font-weight: bold; width: 14%; color: #4b5563;">Employee Name</td>
        <td style="width: 20%; padding: 2px 4px;"><div style="border: 1px solid #23304c; background-color: #e8f4f8; padding: 4px 6px; color: #111827; font-weight: bold; min-height: 14px; border-radius: 4px;">${escapeHtml(data.employeeName)}</div></td>
        <td style="padding: 6px 8px; font-weight: bold; width: 8%; color: #4b5563;">Date</td>
        <td style="width: 20%; padding: 2px 4px;"><div style="border: 1px solid #23304c; background-color: #e8f4f8; padding: 4px 6px; color: #111827; font-weight: bold; min-height: 14px; border-radius: 4px;">${escapeHtml(data.reportDate)}</div></td>
        <td style="padding: 6px 8px; font-weight: bold; width: 8%; color: #4b5563;">Day</td>
        <td style="width: 20%; padding: 2px 4px;"><div style="border: 1px solid #23304c; background-color: #e8f4f8; padding: 4px 6px; color: #111827; font-weight: bold; min-height: 14px; border-radius: 4px;">${escapeHtml(data.day || new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()))}</div></td>
      </tr>
      <tr>
        <td style="padding: 6px 8px; font-weight: bold; color: #4b5563;">Department</td>
        <td style="padding: 2px 4px;"><div style="border: 1px solid #23304c; background-color: #e8f4f8; padding: 4px 6px; color: #111827; font-weight: bold; min-height: 14px; border-radius: 4px;">${escapeHtml(data.department)}</div></td>
        <td style="padding: 6px 8px; font-weight: bold; color: #4b5563;">Designation</td>
        <td style="padding: 2px 4px;"><div style="border: 1px solid #23304c; background-color: #e8f4f8; padding: 4px 6px; color: #111827; font-weight: bold; min-height: 14px; border-radius: 4px;">${escapeHtml(data.designation)}</div></td>
        <td style="padding: 6px 8px; font-weight: bold; color: #4b5563;">Reporting To</td>
        <td style="padding: 2px 4px;"><div style="border: 1px solid #23304c; background-color: #e8f4f8; padding: 4px 6px; color: #111827; font-weight: bold; min-height: 14px; border-radius: 4px;">${escapeHtml(data.managerName)}</div></td>
      </tr>
    </table>

    <div style="padding: 0 16px 16px 16px;">
      <!-- Task Log -->
      <div style="background-color: #23304c; color: #ffffff; padding: 8px 12px; font-size: 13px; font-weight: bold; border-top-left-radius: 6px; border-top-right-radius: 6px;">
        📋 TASK LOG
      </div>
      <table width="100%" style="border-collapse: collapse; border: 1px solid #23304c; font-size: 10px; text-align: center; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; overflow: hidden;">
        <thead style="background-color: #157262; color: #ffffff; font-weight: bold;">
          <tr>
            <th style="border: 1px solid #157262; border-right: 1px solid #23304c; padding: 6px 4px;">#</th>
            <th style="border: 1px solid #157262; border-right: 1px solid #23304c; padding: 6px 4px; text-align: left;">Task / Activity Description</th>
            <th style="border: 1px solid #157262; border-right: 1px solid #23304c; padding: 6px 4px;">Category</th>
            <th style="border: 1px solid #157262; border-right: 1px solid #23304c; padding: 6px 4px;">Priority</th>
            <th style="border: 1px solid #157262; border-right: 1px solid #23304c; padding: 6px 4px;">Status</th>
            <th style="border: 1px solid #157262; border-right: 1px solid #23304c; padding: 6px 4px;">Time<br/>Spent</th>
            <th style="border: 1px solid #157262; border-right: 1px solid #23304c; padding: 6px 4px;">Planned<br/>by</th>
            <th style="border: 1px solid #157262; padding: 6px 4px; text-align: left;">Notes / Blockers</th>
          </tr>
        </thead>
        <tbody>
          ${tasksHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #23304c; color: #ffffff; font-weight: bold; font-size: 11px;">
            <td colspan="5" style="border: 1px solid #23304c; padding: 8px; text-align: center; letter-spacing: 0.5px;">TOTALS</td>
            <td style="border: 1px solid #23304c; padding: 8px;">${typeof data.totalHours === 'number' ? data.totalHours.toFixed(1) : parseFloat(data.totalHours || '0').toFixed(1)}</td>
            <td colspan="2" style="border: 1px solid #23304c; padding: 8px; text-align: center;">${tasksCompleted} tasks done today</td>
          </tr>
        </tfoot>
      </table>

      ${validMeetings.length > 0 ? `
      <!-- Meetings & Calls Log -->
      <div style="background-color: #6b2288; color: #ffffff; padding: 8px 12px; font-size: 13px; font-weight: bold; margin-top: 16px; border-top-left-radius: 6px; border-top-right-radius: 6px;">
        📞 MEETINGS & CALLS LOG
      </div>
      <table width="100%" style="border-collapse: collapse; border: 1px solid #23304c; font-size: 10px; text-align: center; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; overflow: hidden;">
        <thead style="background-color: #6b2288; color: #ffffff; font-weight: bold;">
          <tr>
            <th style="border: 1px solid #6b2288; border-right: 1px solid #23304c; padding: 6px 4px;">#</th>
            <th style="border: 1px solid #6b2288; border-right: 1px solid #23304c; padding: 6px 4px; text-align: left;">Subject / Meeting Name</th>
            <th style="border: 1px solid #6b2288; border-right: 1px solid #23304c; padding: 6px 4px;">With Whom</th>
            <th style="border: 1px solid #6b2288; border-right: 1px solid #23304c; padding: 6px 4px;">Time</th>
            <th style="border: 1px solid #6b2288; border-right: 1px solid #23304c; padding: 6px 4px;">Duration<br/>(min)</th>
            <th style="border: 1px solid #6b2288; border-right: 1px solid #23304c; padding: 6px 4px;">Type</th>
            <th style="border: 1px solid #6b2288; padding: 6px 4px; text-align: left;">Outcome / Next Steps</th>
          </tr>
        </thead>
        <tbody>
          ${meetingsHtml}
        </tbody>
      </table>
      ` : ""}

      ${hasAnyNotes ? `
      <!-- End of Day Notes -->
      <div style="background-color: #df7622; color: #ffffff; padding: 8px 12px; font-size: 13px; font-weight: bold; margin-top: 16px; border-top-left-radius: 6px; border-top-right-radius: 6px;">
        📝 END OF DAY NOTES
      </div>
      
      <table width="100%" style="border-collapse: collapse; font-size: 11px; border: 1px solid #23304c; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; overflow: hidden;">
        ${hasKeyAcc ? `
        <tr>
          <td style="background-color: #df7622; color: #ffffff; padding: 6px 10px; font-weight: bold; border: 1px solid #df7622;">
            Key Accomplishments Today:
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #23304c; border-top: 0; background-color: #e8f4f8; padding: 8px 10px; min-height: 24px; color: #333;">
            ${escapeHtmlMultiline(data.keyAccomplishments)}
          </td>
        </tr>
        <tr><td style="height: 4px; background-color: #ffffff;"></td></tr>
        ` : ""}
        
        ${hasPending ? `
        <tr>
          <td style="background-color: #df7622; color: #ffffff; padding: 6px 10px; font-weight: bold; border: 1px solid #df7622;">
            Pending / Carry Forward:
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #23304c; border-top: 0; background-color: #e8f4f8; padding: 8px 10px; min-height: 24px; color: #333;">
            ${escapeHtmlMultiline(data.pending)}
          </td>
        </tr>
        <tr><td style="height: 4px; background-color: #ffffff;"></td></tr>
        ` : ""}
        
        ${hasBlockers ? `
        <tr>
          <td style="background-color: #df7622; color: #ffffff; padding: 6px 10px; font-weight: bold; border: 1px solid #df7622;">
            Blockers / Challenges Faced:
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #23304c; border-top: 0; background-color: #e8f4f8; padding: 8px 10px; min-height: 24px; color: #333;">
            ${escapeHtmlMultiline(data.blockers)}
          </td>
        </tr>
        <tr><td style="height: 4px; background-color: #ffffff;"></td></tr>
        ` : ""}
        
        ${hasTomorrow ? `
        <tr>
          <td style="background-color: #df7622; color: #ffffff; padding: 6px 10px; font-weight: bold; border: 1px solid #df7622;">
            Plan for Tomorrow:
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #23304c; border-top: 0; background-color: #e8f4f8; padding: 8px 10px; min-height: 24px; color: #333;">
            ${escapeHtmlMultiline(data.tomorrowPlan)}
          </td>
        </tr>
        ` : ""}
      </table>
      ` : ""}

      <!-- Productivity Scores -->
      <div style="background-color: #157262; color: #ffffff; padding: 8px 12px; font-size: 13px; font-weight: bold; margin-top: 16px; border-top-left-radius: 6px; border-top-right-radius: 6px;">
        📊 TODAY'S PRODUCTIVITY SCORE
      </div>
      <table width="100%" style="border-collapse: collapse; border: 1px solid #23304c; font-size: 11px; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; overflow: hidden;">
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #23304c; width: 40%; color: #333;">Tasks Completed</td>
          <td style="padding: 8px 12px; border: 1px solid #23304c; background-color: #e8f4f8; color: #157262; font-weight: bold; text-align: center;">${tasksCompleted} / ${data.tasks.length || 0}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #23304c; color: #333;">Total Hrs Logged</td>
          <td style="padding: 8px 12px; border: 1px solid #23304c; background-color: #e8f4f8; color: #157262; font-weight: bold; text-align: center;">${typeof data.totalHours === 'number' ? data.totalHours.toFixed(1) : parseFloat(data.totalHours || '0').toFixed(1)} hrs</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #23304c; color: #333;">Meetings Today</td>
          <td style="padding: 8px 12px; border: 1px solid #23304c; background-color: #e8f4f8; color: #157262; font-weight: bold; text-align: center;">${validMeetings.length} meetings</td>
        </tr>
      </table>

      <!-- Footer Signatures -->
      <table width="100%" style="text-align: center; font-style: italic; font-size: 10px; color: #555555; margin-top: 24px; padding: 16px 0;">
        <tr>
          <td width="13%" style="text-align: right; padding-right: 8px; font-weight: bold;">Employee Signature:</td>
          <td width="13%" style="border-bottom: 1px solid #999999; font-size: 9px; color: #111827; font-weight: 600; padding-bottom: 2px;">${escapeHtml(data.employeeName)}</td>
          <td width="13%" style="text-align: right; padding-right: 8px; font-weight: bold;">Date:</td>
          <td width="13%" style="border-bottom: 1px solid #999999; font-size: 9px; color: #111827; font-weight: 600; padding-bottom: 2px;">${escapeHtml(data.reportDate)}</td>
          <td width="13%" style="text-align: right; padding-right: 8px; font-weight: bold;">Manager Sign:</td>
          <td width="13%" style="border-bottom: 1px solid #999999; font-size: 9px; color: #111827; font-weight: 600; padding-bottom: 2px;">${escapeHtml(data.managerName)}</td>
        </tr>
      </table>
      <div style="height: 12px;"></div>

    </div>
  </div>
</body>
</html>
  `;
}
