import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/20 px-[var(--space-6)] py-[var(--space-12)] text-center",
        className,
      )}
    >
      <p className="text-[var(--text-heading-size)] font-semibold">{title}</p>
      {description && (
        <p className="mt-[var(--space-2)] max-w-md text-[var(--text-body-size)] text-[var(--color-muted-foreground)]">
          {description}
        </p>
      )}
      {action && <div className="mt-[var(--space-4)]">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[var(--color-muted)]",
        className,
      )}
      aria-hidden
    />
  );
}
