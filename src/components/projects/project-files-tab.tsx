"use client";

import { DocumentText, Image as ImageIcon, Link2, Folder } from "iconsax-react";

// Mock files since we don't have a dedicated files store
const mockFiles = [
  {
    id: "f1",
    name: "Homepage Redesign v2",
    type: "figma",
    url: "#",
    size: "External",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    uploadedBy: "Sarah",
  },
  {
    id: "f2",
    name: "Brand_Guidelines.pdf",
    type: "document",
    url: "#",
    size: "2.4 MB",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    uploadedBy: "Michael",
  },
  {
    id: "f3",
    name: "Hero_Image_Options.png",
    type: "image",
    url: "#",
    size: "4.1 MB",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    uploadedBy: "Emma",
  },
  {
    id: "f4",
    name: "API_Documentation.docx",
    type: "document",
    url: "#",
    size: "1.1 MB",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    uploadedBy: "James",
  },
];

const FileIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "figma":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
          <Link2 color="#d946ef" size={20} variant="Bold" />
        </div>
      );
    case "document":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <DocumentText color="#2563eb" size={20} variant="Bold" />
        </div>
      );
    case "image":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <ImageIcon color="#10b981" size={20} variant="Bold" />
        </div>
      );
    default:
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Folder color="#2563eb" size={20} variant="Bold" />
        </div>
      );
  }
};

export function ProjectFilesTab({ projectId }: { projectId: string }) {
  // In a real app, we would fetch files for the given projectId.

  return (
    <div className="flex flex-col gap-6" aria-label={`Files for project ${projectId}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Project Files</h2>
        <button className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius)] bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500">
          Upload File
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockFiles.map((file) => (
          <div
            key={file.id}
            className="group relative flex cursor-pointer flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <FileIcon type={file.type} />
              <button className="text-slate-400 opacity-0 transition-opacity hover:text-slate-600 group-hover:opacity-100">
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>

            <div>
              <h3 className="line-clamp-1 text-sm font-semibold text-slate-900" title={file.name}>
                {file.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {file.size} • {file.uploadedBy}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
