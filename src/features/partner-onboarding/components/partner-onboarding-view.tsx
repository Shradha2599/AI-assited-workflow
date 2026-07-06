"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Download,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
} from "lucide-react";

import { PipelineHeatmap } from "@/components/data-display/pipeline-heatmap";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  onboardingKpis,
  potentialPartners,
  getPartnerProfilePath,
} from "@/lib/mock-data/potential-partners";
import {
  OnboardingProgressSteps,
  PartnerStatusBadge,
} from "./partner-status-badge";

interface PipelineData {
  columns: string[];
  rows: { stage: string; values: number[] }[];
}

interface PartnerOnboardingViewProps {
  pipeline: PipelineData;
}

const ITEMS_PER_PAGE = 9;

function OnboardingKpiCard({
  label,
  value,
  change,
  trend,
}: {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}) {
  const isPositive = trend === "up";
  return (
    <Card className="p-[var(--space-4)]">
      <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-1 text-[var(--text-kpi-size)] font-semibold">{value}</p>
      <div
        className={cn(
          "mt-1 flex items-center gap-0.5 text-[var(--text-caption-size)] font-medium",
          isPositive ? "text-[var(--color-success)]" : "text-[var(--color-warning)]",
        )}
      >
        {change}
        {isPositive ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
      </div>
    </Card>
  );
}

function partnerHref(partner: (typeof potentialPartners)[number]): string {
  return getPartnerProfilePath(partner.id);
}

export function PartnerOnboardingView({ pipeline }: PartnerOnboardingViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);

  const totalItems = 256;
  const paginated = potentialPartners.slice(0, ITEMS_PER_PAGE);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <>
      <PageHeader
        title="Partner Onboarding"
        breadcrumbs={[
          { label: "Acquisition & Onboarding", href: "/dashboard" },
          { label: "Partner Onboarding" },
        ]}
        actions={
          <>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Partner
            </Button>
            <Button variant="secondary" size="icon" aria-label="Calendar">
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <section
        aria-label="Onboarding metrics"
        className="mb-[var(--space-4)] grid gap-[var(--space-3)] sm:grid-cols-2 xl:grid-cols-4"
      >
        {onboardingKpis.map((kpi) => (
          <OnboardingKpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <Card className="mb-[var(--space-4)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-[var(--text-body-size)] font-semibold">
            Potential Partners{" "}
            <span className="font-normal text-[var(--color-muted-foreground)]">{totalItems}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-[var(--radius-md)] border border-[var(--color-border)] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-[var(--radius-sm)] p-1.5",
                  viewMode === "grid" && "bg-[var(--color-muted)]",
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-[var(--radius-sm)] p-1.5",
                  viewMode === "list" && "bg-[var(--color-muted)]",
                )}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-[var(--text-caption-size)]"
            >
              Status <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-[var(--text-caption-size)]"
            >
              Source <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Download Report
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[var(--text-caption-size)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40">
                {[
                  "Legal Business Name",
                  "Display Name",
                  "Status",
                  "Source",
                  "Progress",
                  "Created on",
                  "Last Activity",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((partner) => {
                return (
                  <tr
                    key={partner.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20"
                  >
                      <td className="px-4 py-3">
                        <Link
                          href={partnerHref(partner)}
                          className="font-medium text-[var(--color-primary)] hover:underline"
                        >
                          {partner.legalBusinessName}
                        </Link>
                      </td>
                    <td className="px-4 py-3">{partner.displayName}</td>
                    <td className="px-4 py-3">
                      <PartnerStatusBadge status={partner.status} />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted-foreground)]">{partner.source}</td>
                    <td className="px-4 py-3">
                      {partner.progressSteps ? (
                        <OnboardingProgressSteps steps={partner.progressSteps} />
                      ) : (
                        <span className="text-[var(--color-muted-foreground)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{partner.createdOn}</td>
                    <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
                      {partner.lastActivity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-4 py-3 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          <span>
            {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, totalItems)} of{" "}
            {totalItems} items
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
            >
              ‹
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
            >
              ›
            </button>
            <span className="ml-2">Items per page</span>
            <button
              type="button"
              className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1"
            >
              {ITEMS_PER_PAGE} <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </Card>

      <PipelineHeatmap columns={pipeline.columns} rows={pipeline.rows} />
    </>
  );
}
