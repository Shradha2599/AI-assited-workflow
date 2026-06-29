import Link from "next/link";
import { Home } from "lucide-react";

import { cn } from "@/lib/utils";

function AoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

interface SidebarProps {
  activeModule?: "home" | "ao";
}

export function Sidebar({ activeModule = "ao" }: SidebarProps) {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-[var(--z-sidebar)] flex w-[var(--sidebar-width)] flex-col items-center border-r border-[var(--color-border)] bg-[var(--color-sidebar)] py-[var(--space-4)]"
      aria-label="Main navigation"
    >
      <nav className="flex flex-col items-center gap-[var(--space-6)]">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-1 rounded-[var(--radius-md)] px-[var(--space-2)] py-[var(--space-2)] text-[var(--text-label-size)] transition-colors",
            activeModule === "home"
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-sidebar-foreground)] hover:text-[var(--color-foreground)]",
          )}
          aria-label="Home"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-1 rounded-[var(--radius-md)] px-[var(--space-2)] py-[var(--space-2)] text-[var(--text-label-size)] transition-colors",
            activeModule === "ao"
              ? "bg-[var(--color-sidebar-active)] text-[var(--color-primary)]"
              : "text-[var(--color-sidebar-foreground)] hover:text-[var(--color-foreground)]",
          )}
          aria-label="Acquisition & Onboarding"
        >
          <AoIcon className="h-5 w-5" />
          <span>A&amp;O</span>
        </Link>
      </nav>
    </aside>
  );
}
