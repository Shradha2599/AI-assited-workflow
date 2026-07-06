"use client";

import { CheckCircle2, X } from "lucide-react";

import { useToastStore } from "@/stores/toast-store";

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 z-[var(--z-toast)] flex w-full max-w-sm flex-col gap-2"
      style={{ right: "calc(var(--tasks-panel-width) + 1rem)" }}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-lg"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success)]" />
          <div className="min-w-0 flex-1">
            <p className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
              {toast.title}
            </p>
            {toast.description && (
              <p className="mt-0.5 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                {toast.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
