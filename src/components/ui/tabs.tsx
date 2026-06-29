import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-muted)] p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-sm)] px-3 py-1 text-[var(--text-caption-size)] font-medium text-[var(--color-muted-foreground)] transition-colors data-[state=active]:bg-[var(--color-card)] data-[state=active]:text-[var(--color-foreground)] data-[state=active]:shadow-[var(--shadow-low)]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-[var(--space-4)] focus-visible:outline-none", className)}
      {...props}
    />
  );
}
