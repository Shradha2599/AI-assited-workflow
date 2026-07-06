"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  Sparkles,
  Star,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  FieldValidation,
  LeadFormAnalysis,
  MarketplaceValidation,
  SectionValidation,
  ValidationStatus,
} from "@/lib/mock-data/lead-form-analysis";
import { statusLabel } from "@/lib/mock-data/lead-form-analysis";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { usePartnerReviewStore } from "../store/partner-review-store";

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function StatusBadge({ status }: { status: ValidationStatus }) {
  const styles: Record<ValidationStatus, string> = {
    valid: "bg-[var(--color-success-light)] text-[var(--color-success)]",
    invalid: "bg-[var(--color-error-light)] text-[var(--color-error)]",
    partial: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
    unverified: "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[var(--text-label-size)] font-semibold",
        styles[status],
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

function FieldStatusIcon({ status }: { status: ValidationStatus }) {
  if (status === "valid") return <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />;
  if (status === "invalid") return <XCircle className="h-3.5 w-3.5 text-[var(--color-error)]" />;
  if (status === "partial") return <CircleDashed className="h-3.5 w-3.5 text-[var(--color-warning)]" />;
  return <CircleDashed className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />;
}

function ValidationFieldRow({ field }: { field: FieldValidation }) {
  return (
    <div className="border-b border-[var(--color-border)] py-3 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <FieldStatusIcon status={field.status} />
          <div>
            <p className="text-[var(--text-caption-size)] font-medium">{field.label}</p>
            <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-foreground)]">
              {field.submittedValue}
            </p>
          </div>
        </div>
        <StatusBadge status={field.status} />
      </div>
      <p className="mt-1.5 pl-5 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
        Source: {field.source} · {field.detail}
      </p>
    </div>
  );
}

function SectionValidationCard({ section }: { section: SectionValidation }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <p className="text-[var(--text-caption-size)] font-semibold">{section.title}</p>
        <StatusBadge status={section.status} />
      </div>
      <div className="px-4 pb-1">
        {section.fields.map((field) => (
          <ValidationFieldRow key={`${section.id}-${field.label}`} field={field} />
        ))}
      </div>
      <p className="border-t border-[var(--color-border)] px-4 py-2 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
        Checked on {section.checkedOn}
      </p>
    </div>
  );
}

function MarketplaceCard({ marketplace }: { marketplace: MarketplaceValidation }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-caption-size)] font-semibold">{marketplace.name}</span>
          <ExternalLink className="h-3 w-3 text-[var(--color-muted-foreground)]" />
        </div>
        <StatusBadge status={marketplace.status} />
      </div>
      {(marketplace.skus || marketplace.rating) && (
        <div className="mb-2 flex gap-4 text-[var(--text-caption-size)]">
          {marketplace.skus && (
            <span>
              <span className="text-[var(--color-muted-foreground)]">SKUs </span>
              <span className="font-semibold">{marketplace.skus.toLocaleString()}</span>
            </span>
          )}
          {marketplace.rating && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{marketplace.rating}</span>
            </span>
          )}
        </div>
      )}
      <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
        Source: {marketplace.source} · {marketplace.detail}
      </p>
    </div>
  );
}

interface EvaluationAnalysisDrawerProps {
  partner: PotentialPartner;
  analysis: LeadFormAnalysis;
}

export function EvaluationAnalysisDrawer({ partner, analysis }: EvaluationAnalysisDrawerProps) {
  const analysisOpen = usePartnerReviewStore((s) => s.analysisOpen);
  const closeAnalysis = usePartnerReviewStore((s) => s.closeAnalysis);

  if (!analysisOpen) return null;

  const initials = getInitials(partner.legalBusinessName);
  const scoreColor =
    analysis.confidenceScore >= 9
      ? "bg-green-600"
      : analysis.confidenceScore >= 8
        ? "bg-green-500"
        : analysis.confidenceScore >= 7
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <>
      <div className="fixed inset-0 z-[var(--z-drawer)] bg-black/30" onClick={closeAnalysis} aria-hidden />

      <aside
        className="fixed bottom-0 top-[var(--topbar-height)] right-[var(--tasks-panel-width)] z-[calc(var(--z-drawer)+1)] flex w-[440px] flex-col border-l border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl"
        aria-label={`Evaluation analysis: ${partner.legalBusinessName}`}
      >
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <div className="mb-3 flex items-start justify-between">
            <h2 className="text-[var(--text-section-size)] font-bold">{partner.legalBusinessName}</h2>
            <button
              type="button"
              onClick={closeAnalysis}
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              aria-label="Close analysis"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{partner.legalBusinessName}</span>
                <ExternalLink className="h-3 w-3 text-[var(--color-muted-foreground)]" />
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[var(--text-caption-size)]">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>{partner.confidenceScore.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-[var(--text-label-size)]">
            <div>
              <p className="text-[var(--color-muted-foreground)]">Avg. annual GMV</p>
              <p className="font-semibold">{formatCurrency(partner.gmv)}</p>
            </div>
            <div>
              <p className="text-[var(--color-muted-foreground)]">Largest Category</p>
              <p className="font-semibold">{partner.categories[0]}</p>
            </div>
            <div>
              <p className="text-[var(--color-muted-foreground)]">SKUs</p>
              <p className="font-semibold">{partner.skus.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-ai-insight-border)] bg-[var(--color-ai-insight)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                <span className="text-[var(--text-caption-size)] font-semibold">Partner summary</span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[var(--text-label-size)] font-semibold text-white",
                  scoreColor,
                )}
              >
                {analysis.confidenceScore.toFixed(1)}/10
              </span>
            </div>
            <p className="text-[var(--text-caption-size)] leading-relaxed">{analysis.summary}</p>

            {analysis.strengths.length > 0 && (
              <ul className="mt-3 space-y-1">
                {analysis.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-1.5 text-[var(--text-caption-size)]">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                    {s}
                  </li>
                ))}
              </ul>
            )}

            {analysis.risks.length > 0 && (
              <ul className="mt-2 space-y-1">
                {analysis.risks.map((r) => (
                  <li key={r} className="flex items-start gap-1.5 text-[var(--text-caption-size)]">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3">
            {analysis.sections.map((section) => (
              <SectionValidationCard key={section.id} section={section} />
            ))}
          </div>

          {analysis.marketplaces.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[var(--text-caption-size)] font-semibold">E-commerce presence</p>
              <div className="space-y-2">
                {analysis.marketplaces.map((mp) => (
                  <MarketplaceCard key={mp.name} marketplace={mp} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-[var(--color-border)] p-4">
          <Button variant="outline" size="sm" className="flex-1">
            Reject
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Future Interest
          </Button>
          <Button size="sm" className="flex-1">
            Accept
          </Button>
        </div>
      </aside>
    </>
  );
}
