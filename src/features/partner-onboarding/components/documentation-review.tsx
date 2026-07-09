"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Download,
  Eye,
  FileText,
  Info,
  X,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/status-tag";
import { cn } from "@/lib/utils";
import type { OnboardingPartner } from "@/lib/mock-data/onboarding";
import {
  getDocumentationEvaluation,
  getSectionEvaluation,
} from "@/lib/mock-data/onboarding-evaluation";
import { statusLabel } from "@/lib/mock-data/lead-form-analysis";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingProfileHeader } from "./onboarding-profile-header";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface DocumentationReviewProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
  activeSubSection: "general" | "brands";
}

export function DocumentationReview({
  partner,
  onboarding,
  activeSubSection,
}: DocumentationReviewProps) {
  const setContext = useOnboardingReviewStore((s) => s.setContext);
  const openComments = useOnboardingReviewStore((s) => s.openComments);
  const openFeedback = useOnboardingReviewStore((s) => s.openFeedback);
  const approveItem = useOnboardingReviewStore((s) => s.approveItem);
  const isApproved = useOnboardingReviewStore((s) => s.isApproved);
  const dismissedAlerts = useOnboardingReviewStore((s) => s.dismissedAlerts);
  const dismissAlert = useOnboardingReviewStore((s) => s.dismissAlert);

  const sectionMeta = getSectionEvaluation(partner.sellerId, "documentation");
  const docs = getDocumentationEvaluation(partner.sellerId);
  const invalidBrand = docs?.brands.find((b) => b.validationStatus === "invalid");

  useEffect(() => {
    setContext(partner.id, "documentation");
  }, [partner.id, setContext]);

  if (!sectionMeta || !docs) {
    return (
      <div className="space-y-[var(--space-4)]">
        <OnboardingProfileHeader partner={partner} launchDate={onboarding.targetLaunchDate} />
        <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          No documentation submitted yet for review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <OnboardingProfileHeader partner={partner} launchDate={onboarding.targetLaunchDate} />

      <nav aria-label="Breadcrumb" className="-mt-2">
        <ol className="flex flex-wrap items-center gap-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          <li>
            <Link href={`/sellers/onboarding/${partner.id}`} className="hover:text-[var(--color-foreground)]">
              {partner.legalBusinessName}
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-[var(--color-foreground)]">Documentation</li>
        </ol>
      </nav>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="bg-gradient-to-r from-[#c5221f] to-[#8b1a18] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-body-size)] font-semibold">{sectionMeta.title}</p>
              <p className="text-[var(--text-caption-size)] text-white/80">{sectionMeta.subtitle}</p>
            </div>
            <span className="text-[var(--text-body-size)] font-semibold tabular-nums">
              {sectionMeta.progress}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/30">
            <div className="h-full rounded-full bg-white" style={{ width: `${sectionMeta.progress}%` }} />
          </div>
        </div>

        <div className="flex min-h-[480px]">
          <nav className="w-52 shrink-0 border-r border-[var(--color-border)] py-2">
            <Link
              href={`/sellers/onboarding/${partner.id}/review/documentation?tab=general`}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-[var(--text-caption-size)]",
                activeSubSection === "general"
                  ? "border-l-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] font-medium text-[var(--color-primary)]"
                  : "border-l-2 border-transparent hover:bg-[var(--color-muted)]",
              )}
            >
              <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
              General documents
            </Link>
            <Link
              href={`/sellers/onboarding/${partner.id}/review/documentation?tab=brands`}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-[var(--text-caption-size)]",
                activeSubSection === "brands"
                  ? "border-l-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] font-medium text-[var(--color-primary)]"
                  : "border-l-2 border-transparent hover:bg-[var(--color-muted)]",
              )}
            >
              {invalidBrand ? (
                <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-warning)]" />
              ) : (
                <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
              )}
              Brand documents
            </Link>
          </nav>

          <div className="min-w-0 flex-1 p-6">
            <div className="mb-4 flex items-center gap-2">
              <StatusTag className="bg-amber-100 text-amber-700">
                Review
              </StatusTag>
              <StatusTag className="inline-flex items-center gap-1 bg-[var(--color-success-light)] text-[var(--color-success)]">
                <Check className="h-3 w-3" /> Auto Validated
              </StatusTag>
            </div>

            {activeSubSection === "brands" &&
              invalidBrand?.agentRecommendation &&
              !dismissedAlerts.includes(`brand-${invalidBrand.id}`) && (
                <div className="mb-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-blue-200 bg-blue-50 px-4 py-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[var(--text-caption-size)] font-semibold text-blue-900">
                      {invalidBrand.agentRecommendation.title}
                    </p>
                    <p className="text-[var(--text-caption-size)] text-blue-800">
                      {invalidBrand.agentRecommendation.message}
                    </p>
                    <div className="mt-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 py-0"
                        onClick={() => openComments(`brand-${invalidBrand.id}`)}
                      >
                        Add Comment
                      </Button>
                      <span className="text-[var(--color-border)]">·</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 py-0 text-[var(--color-error)] hover:bg-[var(--color-error-light)] hover:text-[var(--color-error)]"
                        onClick={() =>
                          openFeedback({
                            taskId: `brand-${invalidBrand.id}`,
                            title: invalidBrand.agentRecommendation!.title,
                            agentMessage: invalidBrand.agentRecommendation!.message,
                          })
                        }
                      >
                        Reject recommendation
                      </Button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissAlert(`brand-${invalidBrand.id}`)}
                    className="text-blue-400 hover:text-blue-600"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

            {activeSubSection === "general" ? (
              <div className="space-y-6">
                {docs.general.map((doc) => {
                  const approveId = `doc-${doc.id}`;
                  const approved = isApproved(approveId);
                  return (
                    <div key={doc.id}>
                      <p className="text-[var(--text-body-size)] font-semibold">{doc.label}</p>
                      <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                        {doc.instruction}
                      </p>
                      <div className="mt-3 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="text-[var(--text-caption-size)] font-medium">{doc.fileName}</p>
                            <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                              {doc.fileSize}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]" aria-label="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button type="button" className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]" aria-label="Download">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant={approved ? "primary" : "outline"}
                          onClick={() => approveItem(approveId)}
                          disabled={approved}
                        >
                          {approved ? "Approved" : "Approve"}
                        </Button>
                        <Button size="sm" variant="outline">
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <p className="mb-3 text-[var(--text-caption-size)] font-semibold">
                  {docs.brands.length} Brands added
                </p>
                <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
                  <table className="w-full text-[var(--text-caption-size)]">
                    <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Name</th>
                        <th className="px-4 py-2 text-left font-medium">Brand role</th>
                        <th className="px-4 py-2 text-left font-medium">Document</th>
                        <th className="px-4 py-2 text-left font-medium">Status</th>
                        <th className="px-4 py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docs.brands.map((brand) => {
                        const approveId = `brand-${brand.id}`;
                        const approved = isApproved(approveId);
                        return (
                          <tr key={brand.id} className="border-b border-[var(--color-border)] last:border-0">
                            <td className="px-4 py-3 font-medium">{brand.name}</td>
                            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">{brand.brandRole}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-[var(--color-primary)]">
                                <FileText className="h-3.5 w-3.5" />
                                {brand.documentName}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <StatusTag
                                className={
                                  brand.validationStatus === "valid"
                                    ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                    : "bg-[var(--color-error-light)] text-[var(--color-error)]"
                                }
                              >
                                {statusLabel(brand.validationStatus)}
                              </StatusTag>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {approved ? (
                                  <span className="inline-flex items-center gap-1 text-[var(--text-caption-size)] font-medium text-[var(--color-success)]">
                                    <Check className="h-3 w-3" /> Approved
                                  </span>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto px-0 py-0"
                                    onClick={() => approveItem(approveId)}
                                  >
                                    Approve
                                  </Button>
                                )}
                                {brand.validationStatus === "invalid" && !approved && (
                                  <>
                                    <span className="text-[var(--color-border)]">·</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-auto px-0 py-0"
                                      onClick={() => openComments(`brand-${brand.id}`)}
                                    >
                                      Request change
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </div>
  );
}
