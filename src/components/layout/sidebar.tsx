"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SvgIcon, type SvgIconName } from "@/components/ui/svg-icon";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/sidebar-context";

const AO_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", match: (path: string) => path === "/dashboard" },
  {
    label: "Assortment Gap Analysis",
    href: "/assortment/gap",
    match: (path: string) => path.startsWith("/assortment"),
  },
  {
    label: "Lead Discovery",
    href: "/sellers/discovery",
    match: (path: string) => path.startsWith("/sellers/discovery"),
  },
  {
    label: "Partner Onboarding",
    href: "/sellers/onboarding",
    match: (path: string) => path.startsWith("/sellers/onboarding") || path.startsWith("/sellers/verification"),
  },
] as const;

function PrimaryNavItem({
  href,
  label,
  iconName,
  isActive,
  onClick,
  asButton,
}: {
  href?: string;
  label: string;
  iconName: SvgIconName;
  isActive: boolean;
  onClick?: () => void;
  asButton?: boolean;
}) {
  const className = cn(
    "relative flex w-full cursor-pointer flex-col items-center gap-1 px-[var(--space-2)] py-[var(--space-3)] text-[var(--text-label-size)] font-medium transition-colors",
    isActive
      ? "text-[var(--color-primary)]"
      : "text-[var(--color-sidebar-foreground)] hover:text-[var(--color-foreground)]",
  );

  const content = (
    <>
      {isActive && (
        <span
          className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[var(--color-primary)]"
          aria-hidden
        />
      )}
      <SvgIcon
        name={iconName}
        size={24}
        className={cn(isActive && "icon-tint-primary")}
      />
      <span>{label}</span>
    </>
  );

  if (asButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        aria-current={isActive ? "page" : undefined}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href ?? "/home"}
      onClick={onClick}
      className={className}
      aria-current={isActive ? "page" : undefined}
    >
      {content}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { module, setModule, subnavCollapsed, setSubnavCollapsed, showSubnav } = useSidebar();

  return (
    <div
      className="fixed inset-y-0 left-0 z-[var(--z-sidebar)] flex"
      aria-label="Application navigation"
    >
      <aside className="flex w-[var(--sidebar-width)] flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)]">
        <nav className="flex flex-col pt-[var(--space-4)]">
          <div
            className="flex w-full flex-col items-center gap-1 px-[var(--space-2)] py-[var(--space-3)] text-[var(--text-label-size)] font-medium opacity-30 cursor-default select-none"
            aria-hidden="true"
          >
            <SvgIcon name="home" size={24} />
            <span>Home</span>
          </div>
          <PrimaryNavItem
            label="A&O"
            iconName="ao"
            isActive={module === "ao"}
            asButton
            onClick={() => {
              setModule("ao");
              setSubnavCollapsed(false);
            }}
          />
        </nav>

        {module === "ao" && subnavCollapsed && (
          <div className="mt-auto border-t border-[var(--color-border)] p-[var(--space-2)]">
            <button
              type="button"
              onClick={() => setSubnavCollapsed(false)}
              className="flex h-8 w-full items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              aria-label="Expand Acquisition & Onboarding navigation"
            >
              <SvgIcon name="chevronRight" size={16} />
            </button>
          </div>
        )}
      </aside>

      {showSubnav && (
        <aside className="flex w-[var(--sidebar-subnav-width)] flex-col border-r border-[var(--color-border)] bg-[var(--color-subnav)]">
          <div className="px-[var(--space-4)] pb-[var(--space-4)] pt-[var(--space-5)]">
            <p className="text-[18px] font-bold leading-[1.3] text-[var(--color-subnav-heading)]">
              Acquisition &amp;
              <br />
              Onboarding
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 px-[var(--space-2)]">
            {AO_NAV_ITEMS.map((item) => {
              const isActive = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-subnav-active-bg)] text-[var(--color-primary)]"
                      : "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[var(--color-border)] p-[var(--space-3)]">
            <button
              type="button"
              onClick={() => setSubnavCollapsed(true)}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
              aria-label="Collapse Acquisition & Onboarding navigation"
            >
              <SvgIcon name="chevronLeft" size={16} />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
