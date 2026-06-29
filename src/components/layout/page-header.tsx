import Link from "next/link";
import { ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-[var(--space-4)]", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-1">
          <ol className="flex flex-wrap items-center gap-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            {breadcrumbs.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
                {item.href ? (
                  <Link href={item.href} className="hover:text-[var(--color-foreground)]">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--color-foreground)]" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div>
          <h1 className="text-[var(--text-page-title-size)] font-semibold leading-[var(--text-page-title-line-height)] text-[var(--color-foreground)]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[var(--text-body-size)] text-[var(--color-muted-foreground)]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-[var(--space-2)]">{actions}</div>
        )}
      </div>
    </header>
  );
}
