import { Bell, CircleHelp, Search } from "lucide-react";

import { MarketplaceLogo } from "@/components/layout/marketplace-logo";

export function Topbar() {
  return (
    <header className="sticky top-0 z-[var(--z-topbar)] flex h-[var(--topbar-height)] items-center gap-[var(--space-4)] border-b border-[var(--color-border)] bg-[var(--color-card)] px-[var(--space-4)]">
      <MarketplaceLogo />

      <div className="relative mx-auto w-full max-w-xl flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search"
          aria-label="Search"
          className="h-9 w-full rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-muted)] pl-9 pr-4 text-[var(--text-body-size)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        />
      </div>

      <div className="flex shrink-0 items-center gap-[var(--space-3)]">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
          aria-label="Help"
        >
          <CircleHelp className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 pl-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-success-light)] text-xs font-semibold text-[var(--color-success)]">
            JD
          </div>
          <span className="hidden text-[var(--text-body-size)] font-medium text-[var(--color-foreground)] sm:inline">
            John Doe
          </span>
        </div>
      </div>
    </header>
  );
}
