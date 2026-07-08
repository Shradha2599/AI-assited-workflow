"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const LEGACY_PLAN_STORAGE_KEYS = [
  "assortment-plan-v5",
  "assortment-plan-v4",
  "assortment-plan-v3",
  "assortment-plan-v2",
  "assortment-plan-v1",
  "assortment-plan",
];

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    for (const key of LEGACY_PLAN_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
