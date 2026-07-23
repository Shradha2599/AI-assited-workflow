"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DrawerPanelProps {
  title?: ReactNode;
  header?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  ariaLabel: string;
  className?: string;
  widthClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

export function DrawerPanel({
  title,
  header,
  onClose,
  children,
  footer,
  ariaLabel,
  className,
  widthClassName = "w-[var(--drawer-width)]",
  bodyClassName,
  footerClassName,
}: DrawerPanelProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-[var(--z-drawer)] h-dvh min-h-screen w-full transition-opacity duration-300 ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        style={{ backgroundColor: "var(--color-drawer-overlay)" }}
        aria-label="Close drawer"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[calc(var(--z-drawer)+1)] flex h-dvh min-h-screen flex-col bg-[var(--color-card)] shadow-[var(--shadow-drawer)] transition-transform duration-300 ease-out",
          widthClassName,
          visible ? "translate-x-0" : "translate-x-full",
          className,
        )}
        aria-label={ariaLabel}
      >
        {header ?? <DrawerHeaderShell title={title} onClose={onClose} />}

        <div className={cn("min-h-0 flex-1 overflow-y-auto", bodyClassName)}>{children}</div>

        {footer && (
          <div className={cn("shrink-0 border-t border-[var(--color-border)] p-[var(--space-4)]", footerClassName)}>
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}

/** Light gray title bar — title + close only, no border */
export function DrawerHeaderShell({
  title,
  onClose,
}: {
  title?: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-3 bg-[var(--color-drawer-header)] px-[var(--space-4)] py-[var(--space-4)]">
      <div className="min-w-0 text-[var(--text-page-title-size)] font-semibold leading-tight text-[var(--color-foreground)]">
        {title}
      </div>
      <DrawerCloseButton onClose={onClose} />
    </div>
  );
}

export function DrawerCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
      aria-label="Close drawer"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

/** Purple underline accent for category name in drawer titles */
export function DrawerTitleAccent({ children }: { children: ReactNode }) {
  return (
    <span className="border-b-2 border-[var(--color-drawer-accent)] pb-0.5">{children}</span>
  );
}
