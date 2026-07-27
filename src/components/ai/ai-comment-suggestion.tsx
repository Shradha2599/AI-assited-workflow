"use client";

import { Button } from "@/components/ui/button";
import { SvgIcon } from "@/components/ui/svg-icon";

export function AiCommentSuggestion({
  text,
  onInsert,
  onDismiss,
}: {
  text: string;
  onInsert: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-ai-insight-border)] bg-[var(--color-ai-insight)] p-3">
      <div className="flex items-start gap-2.5">
        <SvgIcon name="aiSparkle" size={18} variant="primary" className="mt-0.5 shrink-0" alt="" />
        <p className="min-w-0 flex-1 text-[var(--text-caption-size)] text-[var(--color-foreground)]">
          {text}
        </p>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[var(--color-primary)] bg-white text-[var(--color-primary)] hover:bg-white/90"
          onClick={onInsert}
        >
          Insert
        </Button>
      </div>
    </div>
  );
}
