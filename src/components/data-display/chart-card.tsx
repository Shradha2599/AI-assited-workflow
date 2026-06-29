import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children ?? (
          <div
            className="flex h-48 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/30 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
            aria-label={`${title} chart placeholder`}
          >
            Chart will render here
          </div>
        )}
      </CardContent>
    </Card>
  );
}
