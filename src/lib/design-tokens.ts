export const spacing = {
  1: "var(--space-1)",
  2: "var(--space-2)",
  3: "var(--space-3)",
  4: "var(--space-4)",
  6: "var(--space-6)",
  8: "var(--space-8)",
  10: "var(--space-10)",
  12: "var(--space-12)",
} as const;

export const radius = {
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
} as const;

export const colors = {
  primary: "var(--color-primary)",
  primaryForeground: "var(--color-primary-foreground)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  error: "var(--color-error)",
  background: "var(--color-background)",
  foreground: "var(--color-foreground)",
  muted: "var(--color-muted)",
  mutedForeground: "var(--color-muted-foreground)",
  border: "var(--color-border)",
  card: "var(--color-card)",
  cardForeground: "var(--color-card-foreground)",
} as const;

export const elevation = {
  low: "var(--shadow-low)",
  medium: "var(--shadow-medium)",
  drawer: "var(--shadow-drawer)",
} as const;
