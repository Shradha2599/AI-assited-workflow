"use client";

import Link from "next/link";
import { useEffect } from "react";

import { SvgIcon } from "@/components/ui/svg-icon";
import { cn } from "@/lib/utils";
import { usePageHeaderContext } from "./page-header-context";

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

function PageHeaderContent({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn(className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-1">
          <ol className="flex flex-wrap items-center gap-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            {breadcrumbs.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <span className="text-[var(--color-muted-foreground)]">/</span>}
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
          <h1 className="text-[24px] font-bold leading-[1.2] text-[var(--color-foreground)]">
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

export function PageHeader(props: PageHeaderProps) {
  const { setPageHeader } = usePageHeaderContext();
  const { title, description, breadcrumbs, actions, className } = props;

  useEffect(() => {
    setPageHeader(
      <PageHeaderContent
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
        className={className}
      />,
    );
    return () => setPageHeader(null);
  }, [title, description, breadcrumbs, actions, className, setPageHeader]);

  return null;
}

export function RegisterPageHeader({ children }: { children: React.ReactNode }) {
  const { setPageHeader } = usePageHeaderContext();

  useEffect(() => {
    setPageHeader(children);
    return () => setPageHeader(null);
  }, [children, setPageHeader]);

  return null;
}

export function PageHeaderBreadcrumbChevron() {
  return <SvgIcon name="arrowRight" size={12} className="rotate-0 opacity-40" />;
}
