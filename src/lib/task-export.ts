import type { Task } from "@/src/types";

export function exportTasksToCSV(tasks: Task[], filename = "tasks.csv") {
  const headers = [
    "ID",
    "Title",
    "Description",
    "Status",
    "Priority",
    "Deadline",
    "Assignee",
    "Project",
    "Comments",
    "Attachments",
  ];

  const rows = tasks.map((task) => [
    task.id,
    task.title,
    task.description,
    task.status,
    task.priority,
    task.deadline,
    task.assigneeId,
    task.projectId,
    task.comments,
    task.attachments,
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

  downloadFile(csv, filename, "text/csv");
}

export function exportTasksToJSON(tasks: Task[], filename = "tasks.json") {
  const json = JSON.stringify(tasks, null, 2);
  downloadFile(json, filename, "application/json");
}

export function exportTasksToMarkdown(tasks: Task[], filename = "tasks.md") {
  let markdown = "# Tasks\n\n";

  const grouped = tasks.reduce(
    (acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  Object.entries(grouped).forEach(([status, statusTasks]) => {
    markdown += `## ${status.toUpperCase()}\n\n`;
    statusTasks.forEach((task) => {
      markdown += `### ${task.title}\n`;
      markdown += `- **Priority:** ${task.priority}\n`;
      markdown += `- **Deadline:** ${task.deadline}\n`;
      if (task.description) {
        markdown += `- **Description:** ${task.description}\n`;
      }
      markdown += "\n";
    });
  });

  downloadFile(markdown, filename, "text/markdown");
}

export function exportTasksToHTML(tasks: Task[], filename = "tasks.html") {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tasks Report</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    h1 { color: #333; }
    h2 { color: #666; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
    .task { margin: 15px 0; padding: 10px; border-left: 4px solid #007bff; background: #f9f9f9; }
    .task h3 { margin-top: 0; }
    .info { font-size: 0.9em; color: #666; }
    .priority-urgent { color: #dc3545; }
    .priority-high { color: #fd7e14; }
    .priority-medium { color: #ffc107; }
    .priority-low { color: #28a745; }
  </style>
</head>
<body>
  <h1>Tasks Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
`;

  const grouped = tasks.reduce(
    (acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  Object.entries(grouped).forEach(([status, statusTasks]) => {
    html += `<h2>${status.toUpperCase()}</h2>`;
    statusTasks.forEach((task) => {
      html += `
      <div class="task">
        <h3>${task.title}</h3>
        <div class="info">
          <p><strong>Priority:</strong> <span class="priority-${task.priority}">${task.priority}</span></p>
          <p><strong>Deadline:</strong> ${task.deadline}</p>
          ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ""}
        </div>
      </div>
      `;
    });
  });

  html += `
</body>
</html>
`;

  downloadFile(html, filename, "text/html");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
