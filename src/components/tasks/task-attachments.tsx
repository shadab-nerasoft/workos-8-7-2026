"use client";

import { useState, useRef } from "react";
import type { TaskAttachment } from "@/src/types";
import { Trash, DocumentDownload } from "iconsax-react";
import { Download } from "lucide-react";

interface TaskAttachmentsProps {
  taskId: string;
  attachments: TaskAttachment[];
  onAddAttachment: (taskId: string, attachment: TaskAttachment) => void;
  onDeleteAttachment?: (taskId: string, attachmentId: string) => void;
  maxFileSize?: number; // in bytes, default 5MB
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  xls: "📊",
  xlsx: "📊",
  ppt: "🎯",
  pptx: "🎯",
  jpg: "🖼️",
  jpeg: "🖼️",
  png: "🖼️",
  gif: "🖼️",
  zip: "📦",
  rar: "📦",
};

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "file";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function TaskAttachments({
  taskId,
  attachments,
  onAddAttachment,
  onDeleteAttachment,
  maxFileSize = 5 * 1024 * 1024,
}: TaskAttachmentsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > maxFileSize) {
        alert(`File "${file.name}" is too large. Maximum size is ${formatFileSize(maxFileSize)}`);
        continue;
      }

      const attachment: TaskAttachment = {
        id: `${Date.now()}-${i}`,
        taskId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file), // In production, upload to server
        uploadedBy: "current-user", // Replace with actual user
        uploadedAt: new Date().toISOString(),
      };

      onAddAttachment(taskId, attachment);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors cursor-pointer ${
          isDragging ? "border-primary-500 bg-primary-50" : "border-slate-300 bg-slate-50 hover:border-slate-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept="*/*"
        />
        <DocumentDownload size={24} className="mx-auto mb-2 text-slate-600" />
        <p className="text-sm font-medium text-slate-700">
          {isDragging ? "Drop files here" : "Drag files here or click to upload"}
        </p>
        <p className="text-xs text-slate-500">Maximum file size: {formatFileSize(maxFileSize)}</p>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Files ({attachments.length})</p>
          <div className="space-y-2">
            {attachments.map((attachment) => {
              const ext = getFileExtension(attachment.fileName);
              const icon = FILE_ICONS[ext] || "📎";

              return (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50"
                >
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center gap-3 min-w-0"
                  >
                    <span className="text-lg">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-primary-600 hover:underline">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-slate-500">{formatFileSize(attachment.fileSize)}</p>
                    </div>
                  </a>

                  <div className="flex gap-2">
                    <a
                      href={attachment.fileUrl}
                      download={attachment.fileName}
                      className="rounded p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      title="Download file"
                    >
                      <Download size={16} />
                    </a>
                    {onDeleteAttachment && (
                      <button
                        onClick={() => onDeleteAttachment(taskId, attachment.id)}
                        className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete file"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
