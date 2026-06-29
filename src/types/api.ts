export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export type TrendDirection = "up" | "down" | "neutral";

export interface MetricValue {
  label: string;
  value: number | string;
  change?: number;
  trend?: TrendDirection;
  format?: "number" | "currency" | "percent";
}
