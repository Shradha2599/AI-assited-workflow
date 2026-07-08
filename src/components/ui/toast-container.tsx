"use client";

import { Check, X } from "lucide-react";

import { useToastStore } from "@/stores/toast-store";

export function ToastContainer() {
  const toasts       = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[var(--z-toast)] flex flex-col gap-2"
      style={{ width: 360 }}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-start gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-green-200 bg-green-50 pl-4 pr-4 py-3 shadow-md"
          style={{ borderLeft: "4px solid #16a34a" }}
        >
          {/* Green circle check icon */}
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-[var(--text-body-size)] font-bold text-[var(--color-foreground)]">
              {toast.title}
            </p>
            {toast.description && (
              <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                {toast.description}
              </p>
            )}
          </div>

          {/* Dismiss */}
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="mt-0.5 shrink-0 rounded text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
