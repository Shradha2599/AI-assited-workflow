import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  title: string;
  description?: string;
  status?: "pending" | "in_progress" | "completed";
  dueDate?: string;
  className?: string;
}

const statusVariant = {
  pending: "default" as const,
  in_progress: "primary" as const,
  completed: "success" as const,
};

const statusLabel = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

export function TaskCard({
  title,
  description,
  status = "pending",
  dueDate,
  className,
}: TaskCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-[var(--space-4)]">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[var(--text-body-size)] font-medium">{title}</p>
          <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
        </div>
        {description && (
          <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            {description}
          </p>
        )}
        {dueDate && (
          <p className="mt-[var(--space-3)] text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Due {dueDate}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
