"use client";

import { useState } from "react";
import type { TaskComment } from "@/src/types";
import { formatDate } from "@/src/lib/utils/format";
import { Send, Trash } from "iconsax-react";

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
  currentUserId: string;
  onAddComment: (taskId: string, content: string) => void;
  onDeleteComment?: (taskId: string, commentId: string) => void;
  onEditComment?: (taskId: string, commentId: string, content: string) => void;
}

export function TaskComments({
  taskId,
  comments,
  currentUserId,
  onAddComment,
  onDeleteComment,
  onEditComment,
}: TaskCommentsProps) {
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(taskId, commentText);
    setCommentText("");
  };

  const handleEditSubmit = (commentId: string) => {
    if (!editText.trim()) return;
    onEditComment?.(taskId, commentId, editText);
    setEditingCommentId(null);
    setEditText("");
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-slate-200 bg-white p-3">
              {/* Comment Header */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-xs font-semibold text-white">
                    {comment.authorName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{comment.authorName}</p>
                    <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                {comment.authorId === currentUserId && (
                  <div className="flex gap-1">
                    {onDeleteComment && (
                      <button
                        onClick={() => onDeleteComment(taskId, comment.id)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete comment"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Comment Content or Edit Form */}
              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSubmit(comment.id)}
                      className="rounded px-3 py-1 text-xs font-medium bg-primary-500 text-white hover:bg-primary-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="rounded px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-700">{comment.content}</p>
                  {comment.edited && <p className="mt-1 text-xs text-slate-500">(edited)</p>}
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 space-y-2 border-l-2 border-slate-200 pl-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="text-sm">
                      <p className="font-medium text-slate-900">{reply.authorName}</p>
                      <p className="text-slate-600">{reply.content}</p>
                      <p className="text-xs text-slate-500">{formatDate(reply.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-slate-500">No comments yet. Start the conversation!</p>
        )}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="rounded-lg bg-primary-500 p-2 text-white hover:bg-primary-600 disabled:opacity-50"
          title="Send comment"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
