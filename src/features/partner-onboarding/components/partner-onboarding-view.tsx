"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  Download,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
} from "lucide-react";

import {
  DashboardKpiStrip,
  type DashboardMetric,
} from "@/components/data-display/dashboard-kpi-card";
import { PipelineHeatmap } from "@/components/data-display/pipeline-heatmap";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  onboardingKpis,
  potentialPartners,
  getPartnerProfilePath,
  showsOnboardingChecklist,
  type PotentialPartner,
  type PartnerPipelineStatus,
} from "@/lib/mock-data/potential-partners";
import { getOnboardingForPartner } from "@/lib/mock-data/onboarding";
import {
  ALL_PARTNER_STATUSES,
  OnboardingProfileTaskProgressSteps,
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

function partnerHref(partner: PotentialPartner): string {
  return getPartnerProfilePath(partner.id);
}

function downloadPartnersReport(partners: PotentialPartner[]) {
  const headers = [
    "Legal Business Name",
    "Display Name",
    "Status",
    "Source",
    "GMV",
    "SKUs",
    "Confidence Score",
    "Created On",
    "Last Activity",
  ];

  const rows = partners.map((partner) => [
    partner.legalBusinessName,
    partner.displayName,
    partner.status,
    partner.source,
    partner.gmv,
    partner.skus,
    partner.confidenceScore,
    partner.createdOn,
    partner.lastActivity,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "potential-partners-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function PartnerOnboardingView({ pipeline }: PartnerOnboardingViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PartnerPipelineStatus | "All">("All");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  const filteredPartners = useMemo(() => {
    if (statusFilter === "All") return potentialPartners;
    return potentialPartners.filter((partner) => partner.status === statusFilter);
  }, [statusFilter]);

  const totalItems = filteredPartners.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredPartners.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const kpiMetrics: DashboardMetric[] = useMemo(
    () =>
      onboardingKpis.map((kpi) => ({
        label: kpi.label,
        value: kpi.value,
        change: kpi.change,
        changeType: kpi.trend === "up" ? "positive" : "negative",
        icon: kpi.icon,
      })),
    [],
  );

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    if (!statusMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setStatusMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [statusMenuOpen]);

  const statusLabel = statusFilter === "All" ? "Status" : statusFilter;

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

      <DashboardKpiStrip metrics={kpiMetrics} className="mb-[var(--space-4)]" />

      <Card className="mb-[var(--space-4)] overflow-hidden">
        <div className="px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] py-3">
            <h2 className="text-[var(--text-body-size)] font-semibold">
              Potential Partners{" "}
              <span className="font-normal text-[var(--color-muted-foreground)]">
                {totalItems}
              </span>
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

              <div className="relative" ref={statusMenuRef}>
                <button
                  type="button"
                  onClick={() => setStatusMenuOpen((open) => !open)}
                  className={cn(
                    "flex items-center gap-1 rounded-[var(--radius-md)] border px-3 py-1.5 text-[var(--text-caption-size)]",
                    statusFilter !== "All"
                      ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)]",
                  )}
                >
                  {statusLabel} <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {statusMenuOpen && (
                  <div className="absolute right-0 z-20 mt-1 min-w-[160px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-[var(--shadow-medium)]">
                    <button
                      type="button"
                      className={cn(
                        "block w-full px-3 py-2 text-left text-[var(--text-caption-size)] hover:bg-[var(--color-muted)]",
                        statusFilter === "All" && "font-semibold text-[var(--color-primary)]",
                      )}
                      onClick={() => {
                        setStatusFilter("All");
                        setStatusMenuOpen(false);
                      }}
                    >
                      All statuses
                    </button>
                    {ALL_PARTNER_STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={cn(
                          "block w-full px-3 py-2 text-left text-[var(--text-caption-size)] hover:bg-[var(--color-muted)]",
                          statusFilter === status && "font-semibold text-[var(--color-primary)]",
                        )}
                        onClick={() => {
                          setStatusFilter(status);
                          setStatusMenuOpen(false);
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-[var(--text-caption-size)]"
              >
                Source <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => downloadPartnersReport(filteredPartners)}
              >
                <Download className="h-3.5 w-3.5" /> Download Report
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[var(--text-caption-size)]">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
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
                      className="py-2.5 text-left text-[var(--text-label-size)] font-semibold text-[var(--color-muted-foreground)]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-[var(--color-muted-foreground)]"
                    >
                      No partners match the selected status.
                    </td>
                  </tr>
                ) : (
                  paginated.map((partner) => (
                    <tr
                      key={partner.id}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20"
                    >
                      <td className="py-2.5 text-left">
                        <Link
                          href={partnerHref(partner)}
                          className="font-medium text-[var(--color-primary)] hover:underline"
                        >
                          {partner.legalBusinessName}
                        </Link>
                      </td>
                      <td className="py-2.5">{partner.displayName}</td>
                      <td className="py-2.5">
                        <PartnerStatusBadge status={partner.status} />
                      </td>
                      <td className="py-2.5 text-[var(--color-muted-foreground)]">
                        {partner.source}
                      </td>
                      <td className="py-2.5">
                        {showsOnboardingChecklist(partner.status) ? (
                          <OnboardingProfileTaskProgressSteps
                            tasks={
                              getOnboardingForPartner(partner).sections.find(
                                (s) => s.id === "profile",
                              )?.tasks ?? []
                            }
                          />
                        ) : (
                          <span className="text-[var(--color-muted-foreground)]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 tabular-nums">{partner.createdOn}</td>
                      <td className="py-2.5 text-[var(--color-muted-foreground)]">
                        {partner.lastActivity}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] py-3 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            <span>
              {totalItems === 0
                ? "0 items"
                : `${(safePage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(safePage * ITEMS_PER_PAGE, totalItems)} of ${totalItems} items`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
              >
                ‹
              </button>
              <span>
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
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
        </div>
      </Card>

      <PipelineHeatmap columns={pipeline.columns} rows={pipeline.rows} />
    </>
  );
}
