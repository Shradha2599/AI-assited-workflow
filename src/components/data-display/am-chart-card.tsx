import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AmChartCardProps {
  title: string;
  filterLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function AmChartCard({
  title,
  filterLabel = "Categories (8)",
  children,
  className,
}: AmChartCardProps) {
  return (
    <Card className={cn("flex min-h-0 flex-col overflow-hidden", className)}>
      <CardHeader className="shrink-0 flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-[var(--text-section-size)] font-semibold">{title}</h3>
        <button
          type="button"
          className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]"
        >
          {filterLabel} ▾
        </button>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden pt-0">
        {children}
      </CardContent>
    </Card>
  );
}
