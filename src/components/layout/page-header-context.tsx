"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderContextValue {
  pageHeader: ReactNode;
  setPageHeader: (node: ReactNode) => void;
  hasPageHeader: boolean;
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [pageHeader, setPageHeader] = useState<ReactNode>(null);

  const value = useMemo(
    () => ({
      pageHeader,
      setPageHeader,
      hasPageHeader: pageHeader != null,
    }),
    [pageHeader],
  );

  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>;
}

export function usePageHeaderContext() {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) {
    throw new Error("usePageHeaderContext must be used within PageHeaderProvider");
  }
  return ctx;
}

export function PageHeaderSlot() {
  const { pageHeader, hasPageHeader } = usePageHeaderContext();

  return (
    <div
      className={cn(
        "col-span-2",
        hasPageHeader && "px-[var(--space-4)] py-[var(--space-4)]",
      )}
    >
      {pageHeader}
    </div>
  );
}
