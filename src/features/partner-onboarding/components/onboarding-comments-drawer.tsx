"use client";

import { Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AiCommentSuggestion } from "@/components/ai/ai-comment-suggestion";
import { Button } from "@/components/ui/button";
import { DrawerPanel } from "@/components/ui/drawer-panel";
import { getTaskEvaluation } from "@/lib/mock-data/onboarding-evaluation";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface OnboardingCommentsDrawerProps {
  partner: PotentialPartner;
}

const REVIEWER_NAME = "John Doe";
const REVIEWER_INITIALS = "JD";

type PostedComment = {
  id: string;
  text: string;
  postedAt: Date;
};

function formatCommentTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function OnboardingCommentsDrawer({ partner }: OnboardingCommentsDrawerProps) {
  const commentsOpen = useOnboardingReviewStore((s) => s.commentsOpen);
  const activeTaskId = useOnboardingReviewStore((s) => s.activeTaskId);
  const commentPrefill = useOnboardingReviewStore((s) => s.commentPrefill);
  const closeComments = useOnboardingReviewStore((s) => s.closeComments);
  const clearCommentPrefill = useOnboardingReviewStore((s) => s.clearCommentPrefill);
  const [message, setMessage] = useState("");
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [postedComments, setPostedComments] = useState<PostedComment[]>([]);

  const evaluation = activeTaskId
    ? getTaskEvaluation(partner.sellerId, activeTaskId)
    : undefined;

  const suggestedComment = useMemo(() => {
    const fromPrefill = commentPrefill?.trim();
    if (fromPrefill) return fromPrefill;
    return evaluation?.agentRecommendation?.suggestedComment?.trim() ?? "";
  }, [commentPrefill, evaluation]);

  const showSuggestion = Boolean(suggestedComment) && !suggestionDismissed;

  useEffect(() => {
    if (!commentsOpen) {
      setPostedComments([]);
      return;
    }
    setMessage("");
    setSuggestionDismissed(false);
  }, [commentsOpen, activeTaskId]);

  if (!commentsOpen) return null;

  function handleSend() {
    const text = message.trim();
    if (!text) return;

    setPostedComments((prev) => [
      ...prev,
      { id: `${Date.now()}`, text, postedAt: new Date() },
    ]);
    setMessage("");
    setSuggestionDismissed(true);
    clearCommentPrefill();
  }

  function handleInsertSuggestion() {
    setMessage(suggestedComment);
  }

  return (
    <DrawerPanel
      title="Comments"
      ariaLabel="Comments"
      onClose={closeComments}
      widthClassName="w-[380px]"
      bodyClassName="flex flex-col"
      footerClassName="pt-0"
      footer={
        <div className="space-y-3">
          {showSuggestion ? (
            <AiCommentSuggestion
              text={suggestedComment}
              onInsert={handleInsertSuggestion}
              onDismiss={() => {
                setSuggestionDismissed(true);
                clearCommentPrefill();
              }}
            />
          ) : null}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Write a comment to the seller…"
            className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-caption-size)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
            aria-label="Comment message"
          />
          <Button
            size="sm"
            className="w-full gap-1.5"
            onClick={handleSend}
            disabled={!message.trim()}
          >
            <Send className="h-3.5 w-3.5" />
            Send to seller
          </Button>
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col p-[var(--space-4)]">
        <div className="mb-4 shrink-0">
          <label className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
            Visibility
          </label>
          <select className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[var(--text-caption-size)]">
            <option>External</option>
            <option>Internal</option>
          </select>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
          <div className="flex gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-muted)] text-[var(--text-label-size)] font-semibold">
              JD
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[var(--color-muted-foreground)]">
                John Doe · 9:12 AM
              </p>
              <div className="mt-0.5 rounded-[var(--radius-md)] bg-[var(--color-muted)] px-3 py-2 text-[var(--text-caption-size)]">
                Will the brand description appear on display page on Target.com?
              </div>
            </div>
          </div>
          <div className="flex flex-row-reverse gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-semibold text-white">
              TM
            </span>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[10px] text-[var(--color-muted-foreground)]">Target Merchandiser · 9:18 AM</p>
              <div className="mt-0.5 inline-block rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-left text-[var(--text-caption-size)]">
                Yes, that is right John.
              </div>
            </div>
          </div>

          {postedComments.map((comment) => (
            <div key={comment.id} className="flex flex-row-reverse gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-semibold text-white">
                {REVIEWER_INITIALS}
              </span>
              <div className="min-w-0 flex-1 text-right">
                <p className="text-[10px] text-[var(--color-muted-foreground)]">
                  {REVIEWER_NAME} · {formatCommentTime(comment.postedAt)}
                </p>
                <div className="mt-0.5 inline-block max-w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-left text-[var(--text-caption-size)]">
                  {comment.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DrawerPanel>
  );
}
