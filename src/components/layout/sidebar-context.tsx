"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type SidebarModule = "ao";

interface SidebarContextValue {
  module: SidebarModule;
  setModule: (module: SidebarModule) => void;
  subnavCollapsed: boolean;
  setSubnavCollapsed: (collapsed: boolean) => void;
  showSubnav: boolean;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function isAoPath(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/assortment") ||
    pathname.startsWith("/sellers")
  );
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [module, setModule] = useState<SidebarModule>("ao");
  const [subnavCollapsed, setSubnavCollapsed] = useState(true);

  useEffect(() => {
    if (isAoPath(pathname)) {
      setModule("ao");
    }
  }, [pathname]);

  const showSubnav = module === "ao" && !subnavCollapsed;

  return (
    <SidebarContext.Provider
      value={{ module, setModule, subnavCollapsed, setSubnavCollapsed, showSubnav }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}
