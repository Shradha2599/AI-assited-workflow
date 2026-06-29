import { cn } from "@/lib/utils";

interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No data available.",
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="py-[var(--space-8)] text-center text-[var(--text-body-size)] text-[var(--color-muted-foreground)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]", className)}>
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={cn(
                  "px-[var(--space-4)] py-3 text-[var(--text-label-size)] font-medium text-[var(--color-muted-foreground)]",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-muted)]/50"
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={cn(
                    "px-[var(--space-4)] py-3 text-[var(--text-body-size)]",
                    column.className,
                  )}
                >
                  {column.render
                    ? column.render(row)
                    : String(row[column.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
