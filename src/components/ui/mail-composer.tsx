"use client";

import { FileText, X } from "lucide-react";

import { TruncatedText } from "@/components/ui/truncated-text";
import { markerToneClass } from "@/components/ui/status-tag";
import { cn } from "@/lib/utils";

export interface MailComposerAttachment {
  name: string;
}

export interface MailComposerProps {
  fromName?: string;
  fromEmail?: string;
  to: string;
  subject: string;
  body: string;
  onToChange?: (value: string) => void;
  onSubjectChange?: (value: string) => void;
  onBodyChange?: (value: string) => void;
  attachment?: MailComposerAttachment | null;
  bodyRows?: number;
  fillHeight?: boolean;
  className?: string;
}

export function MailComposer({
  fromName = "Shaun Doe",
  fromEmail = "shaun.doe@target.com",
  to,
  subject,
  body,
  onToChange,
  onSubjectChange,
  onBodyChange,
  attachment = null,
  bodyRows = 14,
  fillHeight = false,
  className,
}: MailComposerProps) {
  const editable = Boolean(onToChange || onSubjectChange || onBodyChange);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)]",
        fillHeight && "flex min-h-0 flex-col",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-[11px] font-bold text-white">
          SD
        </span>
        <div className="min-w-0">
          <p className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
            New Mail
          </p>
          <TruncatedText
            text={fromEmail}
            className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-2.5">
        <span className="w-14 shrink-0 text-[var(--text-caption-size)] font-medium text-[var(--color-muted-foreground)]">
          To
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {to ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 text-[var(--text-caption-size)]",
                markerToneClass.muted,
              )}
            >
              {to}
              {editable && onToChange ? (
                <button
                  type="button"
                  onClick={() => onToChange("")}
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  aria-label="Remove recipient"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </span>
          ) : editable && onToChange ? (
            <input
              type="email"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              placeholder="Add recipient"
              className="min-w-0 flex-1 bg-transparent text-[var(--text-caption-size)] focus:outline-none"
            />
          ) : null}
        </div>
        {editable ? (
          <div className="flex shrink-0 gap-2 text-[var(--text-caption-size)] text-[var(--color-primary)]">
            <button type="button" className="hover:underline">
              Cc
            </button>
            <button type="button" className="hover:underline">
              Bcc
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-2.5">
        <span className="w-14 shrink-0 text-[var(--text-caption-size)] font-medium text-[var(--color-muted-foreground)]">
          Subject
        </span>
        {editable && onSubjectChange ? (
          <input
            type="text"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)] focus:outline-none"
          />
        ) : (
          <span className="min-w-0 flex-1 text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]">
            {subject}
          </span>
        )}
      </div>

      {editable && onBodyChange ? (
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          rows={fillHeight ? undefined : bodyRows}
          spellCheck
          className={cn(
            "w-full resize-none bg-transparent px-4 py-3 text-[var(--text-caption-size)] leading-relaxed text-[var(--color-foreground)] focus:outline-none",
            fillHeight && "min-h-0 flex-1",
          )}
          aria-label="Email message"
        />
      ) : (
        <div className="whitespace-pre-wrap px-4 py-3 text-[var(--text-caption-size)] leading-relaxed text-[var(--color-foreground)]">
          {body}
        </div>
      )}

      {attachment ? (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <div
            className={cn(
              "inline-flex max-w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)]",
              "bg-[var(--color-muted)]/30 px-3 py-2",
            )}
          >
            <FileText className="h-4 w-4 shrink-0 text-[var(--color-error)]" aria-hidden />
            <TruncatedText
              text={attachment.name}
              inline
              className="text-[var(--text-caption-size)] text-[var(--color-foreground)]"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MailComposerShimmer({ withAttachment = false }: { withAttachment?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] animate-pulse">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <div className="h-8 w-8 rounded-full bg-[var(--color-muted)]" />
        <div className="space-y-1.5">
          <div className="h-3 w-16 rounded bg-[var(--color-muted)]" />
          <div className="h-3 w-32 rounded bg-[var(--color-muted)]" />
        </div>
      </div>
      <div className="space-y-3 border-b border-[var(--color-border)] px-4 py-3">
        <div className="h-3 w-3/4 rounded bg-[var(--color-muted)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--color-muted)]" />
      </div>
      <div className="space-y-2 px-4 py-4">
        {[100, 92, 88, 65, 95, 78, 85, 70, 90, 55, 82, 60].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded bg-[var(--color-muted)]"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      {withAttachment ? (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <div className="h-9 w-56 rounded-[var(--radius-md)] bg-[var(--color-muted)]" />
        </div>
      ) : null}
    </div>
  );
}
