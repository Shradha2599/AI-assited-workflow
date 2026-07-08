"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CALENDAR_COMMENT_SEED,
  CURRENT_CALENDAR_USER,
  formatCommentTime,
  getAuthorInitials,
  getInternalComments,
  type CalendarComment,
} from "@/lib/mock-data/calendar-comments";
import { cn } from "@/lib/utils";

interface CalendarCommentsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const AVATAR_COLORS: Record<string, string> = {
  "Nina Carter": "bg-[#6366F1] text-white",
  "Jordan Lee": "bg-[var(--color-primary)] text-white",
  "Ava Patel": "bg-[#0EA5E9] text-white",
  "Ethan Brooks": "bg-[#10B981] text-white",
  "Maya Johnson": "bg-[#F59E0B] text-white",
};

function CommentAvatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name] ?? "bg-[var(--color-muted)] text-[var(--color-foreground)]";
  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
        color,
      )}
      aria-hidden
    >
      {getAuthorInitials(name)}
    </span>
  );
}

function CommentMessage({ comment, isOwn }: { comment: CalendarComment; isOwn: boolean }) {
  const label = isOwn ? "You" : comment.author.split(" ")[0];

  return (
    <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
      <div className={cn("flex items-center gap-1.5", isOwn && "flex-row-reverse")}>
        <CommentAvatar name={comment.author} />
        <span className="text-[10px] text-[var(--color-muted-foreground)]">{label}</span>
      </div>

      <div
        className={cn(
          "max-w-[88%] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-caption-size)] leading-relaxed text-[var(--color-foreground)]",
          isOwn
            ? "rounded-[var(--radius-lg)] rounded-tr-sm bg-[#f3f4f6]"
            : "rounded-[var(--radius-lg)] rounded-tl-sm border border-[#e5e7eb] bg-white",
        )}
      >
        {comment.content}
      </div>

      <span className="text-[10px] text-[var(--color-muted-foreground)]">
        {formatCommentTime(comment.createdAt)}
      </span>
    </div>
  );
}

export function CalendarCommentsDrawer({ open, onClose }: CalendarCommentsDrawerProps) {
  const [comments, setComments] = useState<CalendarComment[]>(CALENDAR_COMMENT_SEED);
  const [draft, setDraft] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  const thread = useMemo(() => getInternalComments(comments), [comments]);

  useEffect(() => {
    if (open && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [open, thread.length]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit() {
    const content = draft.trim();
    if (!content) return;

    setComments((prev) => [
      ...prev,
      {
        id: `cal_cmt_${Date.now()}`,
        author: CURRENT_CALENDAR_USER,
        authorRole: "Acquisition Manager",
        visibility: "Internal",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[calc(var(--z-drawer)+1)]"
        style={{ backgroundColor: "var(--color-drawer-overlay)" }}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className="fixed inset-y-0 right-0 z-[calc(var(--z-drawer)+2)] flex w-[var(--drawer-width)] flex-col border-l border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-drawer)]"
        aria-label="Comments"
      >
        <div className="flex h-[var(--topbar-height)] shrink-0 items-center justify-between bg-[#F3F4F6] px-[var(--space-4)]">
          <h2 className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
            Comments
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            onClick={onClose}
            aria-label="Close comments"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div ref={feedRef} className="flex flex-1 flex-col gap-[var(--space-3)] overflow-y-auto p-[var(--space-4)]">
          {thread.length === 0 ? (
            <p className="text-center text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              No comments yet. Add a note for the team below.
            </p>
          ) : (
            thread.map((comment) => (
              <CommentMessage
                key={comment.id}
                comment={comment}
                isOwn={comment.author === CURRENT_CALENDAR_USER}
              />
            ))
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--color-border)] p-[var(--space-3)]">
          <div className="flex items-center gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a note for the team…"
              rows={1}
              className="h-7 min-h-7 flex-1 resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-3)] py-0 text-[var(--text-caption-size)] leading-7 placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="Write a comment"
            />
            <Button size="sm" className="shrink-0" onClick={handleSubmit} disabled={!draft.trim()}>
              Send
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
