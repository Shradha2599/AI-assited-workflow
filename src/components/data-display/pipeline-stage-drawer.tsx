"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DrawerHeaderShell,
  DrawerPanel,
  DrawerTitleAccent,
} from "@/components/ui/drawer-panel";
import {
  getPartnersByStageAndCategory,
  type PipelinePartner,
  type PartnerStage,
} from "@/lib/mock-data/pipeline-partners";

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const PIPELINE_CARD_BG = "#fafbfc";

// ── Avatar ────────────────────────────────────────────────────────────────────

const AVG_GMV_PER_SELLER: Record<string, number> = {
  Established: 3_400_000,
  Onboarding:    278_000,
  "New Lead":    180_000,
  Contacted:     140_000,
  Shortlisted:   110_000,
  Discovered:     70_000,
};

function formatGmv(stage: string, count: number): string {
  const avg = AVG_GMV_PER_SELLER[stage] ?? 200_000;
  return `$${((count * avg) / 1_000_000).toFixed(1)}M`;
}

function pipelineHealth(count: number): { label: string; cls: string } {
  if (count >= 6) return { label: "On Track",        cls: "text-green-700" };
  if (count >= 3) return { label: "Needs Attention", cls: "text-amber-600" };
  return               { label: "At Risk",           cls: "text-red-600" };
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8EDF7] text-[12px] font-bold text-[#3B5CA8]">
      {initials(name)}
    </div>
  );
}

// ── Stage-specific card body content ─────────────────────────────────────────

function DiscoveredBody() {
  return (
    <Button variant="ghost" size="sm" className="mt-2 h-auto px-0 py-0 text-[var(--color-primary)]">
      + Shortlist
    </Button>
  );
}

function ShortlistedBody() {
  return (
    <Button variant="ghost" size="sm" className="mt-2 h-auto px-0 py-0 text-[var(--color-primary)]">
      ✉ Send Intro Mail
    </Button>
  );
}

function ContactedBody({ partner }: { partner: PipelinePartner }) {
  return (
    <div className="mt-2 space-y-1.5">
      {partner.lastContactDate && (
        <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          Last contacted:{" "}
          <span className="font-medium text-[var(--color-foreground)]">
            {formatDate(partner.lastContactDate)}
            {partner.lastContactTime ? ` · ${partner.lastContactTime}` : ""}
          </span>
        </p>
      )}
      <Button variant="ghost" size="sm" className="h-auto px-0 py-0 text-[var(--color-primary)]">
        ↩ Send Follow-up Mail
      </Button>
    </div>
  );
}

function NewLeadBody({ partner }: { partner: PipelinePartner }) {
  return (
    <div className="mt-2 flex items-center justify-between">
      {partner.confidenceScore != null && (
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">Confidence</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${
              partner.confidenceScore >= 9 ? "bg-green-600" : partner.confidenceScore >= 8 ? "bg-green-500" : "bg-amber-500"
            }`}
          >
            {partner.confidenceScore.toFixed(1)}
          </span>
        </div>
      )}
      <Button variant="ghost" size="sm" className="h-auto px-0 py-0 text-[var(--color-primary)]">
        View Form →
      </Button>
    </div>
  );
}

function OnboardingBody({ partner }: { partner: PipelinePartner }) {
  const tasks = partner.tasks ?? [];
  const completed = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]">
          Onboarding Progress
        </span>
        <span className="text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
          {progress}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-muted)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function EstablishedBody({ partner }: { partner: PipelinePartner }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      {partner.joinedDate && (
        <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          Active since{" "}
          <span className="font-medium text-[var(--color-foreground)]">{partner.joinedDate}</span>
        </p>
      )}
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
        ✓ Live
      </span>
    </div>
  );
}

// ── Partner card ──────────────────────────────────────────────────────────────

function PartnerCard({ partner, stage }: { partner: PipelinePartner; stage: PartnerStage }) {
  return (
    <div
      className="flex gap-3 rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-4)]"
      style={{ backgroundColor: PIPELINE_CARD_BG }}
    >
      <Avatar name={partner.name} />
      <div className="min-w-0 flex-1">
        {/* Row 1: name · GMV + link */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
            {partner.name}
            <span className="ml-2 text-[var(--text-caption-size)] font-normal text-[var(--color-muted-foreground)]">
              · GMV{" "}
              <span className="font-semibold text-[var(--color-foreground)]">{partner.gmv}</span>
            </span>
          </p>
          <Link
            href={stage === "Onboarding" ? "/sellers/onboarding" : "/sellers/discovery"}
            className="shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
            aria-label={`Open ${partner.name}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Row 2: categories */}
        <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          Categories{" "}
          <span className="font-medium text-[var(--color-foreground)]">
            {partner.categories.join(", ")}
          </span>
        </p>

        {/* Stage-specific body */}
        {stage === "Discovered"   && <DiscoveredBody />}
        {stage === "Shortlisted"  && <ShortlistedBody />}
        {stage === "Contacted"    && <ContactedBody partner={partner} />}
        {stage === "New Lead"     && <NewLeadBody partner={partner} />}
        {stage === "Onboarding"   && <OnboardingBody partner={partner} />}
        {stage === "Established"  && <EstablishedBody partner={partner} />}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PipelineStageDrawerProps {
  category: string;
  stage: string;
  count: number;
  colIndex: number;
  rowIndex: number;
  onClose: () => void;
}

export function PipelineStageDrawer({
  category,
  stage,
  count,
  onClose,
}: PipelineStageDrawerProps) {
  const partners = getPartnersByStageAndCategory(stage as PartnerStage, category);
  const displayPartners = partners.slice(0, 8);
  const totalInCell = partners.length > 0 ? partners.length : count;
  const gmv = formatGmv(stage, totalInCell);
  const health = pipelineHealth(totalInCell);

  return (
    <DrawerPanel
      ariaLabel={`${category}: ${stage} stage pipeline`}
      onClose={onClose}
      header={
        <DrawerHeaderShell
          onClose={onClose}
          title={
            <>
              {category}:{" "}
              <DrawerTitleAccent>{stage} Stage</DrawerTitleAccent>
            </>
          }
        />
      }
    >
      <div className="p-[var(--space-4)]">
        {/* Summary cards */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3"
            style={{ backgroundColor: PIPELINE_CARD_BG }}
          >
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Potential GMV
            </p>
            <p className="mt-1 text-[var(--text-section-size)] font-bold text-[var(--color-foreground)]">
              {gmv}
            </p>
          </div>
          <div
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3"
            style={{ backgroundColor: PIPELINE_CARD_BG }}
          >
            <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              Pipeline Health
            </p>
            <p className={`mt-1 text-[var(--text-section-size)] font-bold ${health.cls}`}>
              {health.label}
            </p>
          </div>
        </div>

        {/* Section header */}
        <div className="mb-3">
          <h3 className="text-[var(--text-section-size)] font-semibold text-[var(--color-foreground)]">
            Partners in {stage} Stage
          </h3>
          <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Showing {displayPartners.length} of {totalInCell} partner{totalInCell !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Partner cards */}
        <div className="space-y-[var(--space-3)]">
          {displayPartners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} stage={stage as PartnerStage} />
          ))}
          {displayPartners.length === 0 && (
            <p className="py-8 text-center text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
              No partner data available for this category and stage.
            </p>
          )}
        </div>
      </div>
    </DrawerPanel>
  );
}
