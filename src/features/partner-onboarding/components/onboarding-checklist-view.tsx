"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Clock } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { StatusTag } from "@/components/ui/status-tag";
import { cn } from "@/lib/utils";
import type { OnboardingPartner, OnboardingSection, OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getChecklistSubTaskIconSrc,
  shouldGrayChecklistSubTaskIcon,
} from "@/features/partner-onboarding/utils/onboarding-subtask-icons";
import {
  countOnboardingSectionProgress,
  computeOnboardingOverallProgress,
  getAssortmentTaskIconSrc,
  isOnboardingSectionLocked,
  LOCKED_ONBOARDING_SECTION_IDS,
} from "@/lib/mock-data/onboarding";
import {
  resolveOnboardingSectionStatusIcon,
  resolveSectionCompletedSteps,
  resolveSectionProgressPercent,
} from "@/features/partner-onboarding/utils/onboarding-section-status-icon";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { PartnerProfileHeader } from "./partner-profile-header";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface OnboardingChecklistViewProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
}

const SECTION_ICON_SRC: Record<string, string> = {
  profile: "/icons/marketplace.svg",
  assortment: "/icons/chart-bar-stacked.svg",
  documentation: "/icons/files.svg",
  integrations: "/icons/join-inner.svg",
  "item-listing": "/icons/box-closed.svg",
  stripe: "/icons/card.svg",
};

const LOCKED_SECTION_IDS = LOCKED_ONBOARDING_SECTION_IDS;

const GRAY_ICON_FILTER =
  "brightness(0) saturate(100%) invert(55%) sepia(8%) saturate(0%) hue-rotate(180deg) brightness(95%) contrast(88%)";

function isSectionLocked(
  section: OnboardingSection,
  sections: OnboardingSection[],
  approvedIds: string[],
): boolean {
  return isOnboardingSectionLocked(section, sections, approvedIds);
}

function countSectionProgress(sections: OnboardingSection[], approvedIds: string[]) {
  return countOnboardingSectionProgress(sections, approvedIds);
}

function getSubTaskIconSrc(
  sectionId: string,
  task: OnboardingTask,
  approvedIds?: string[],
): string {
  return getChecklistSubTaskIconSrc(sectionId, task, approvedIds);
}

function isSectionReviewable(section: OnboardingSection): boolean {
  if (LOCKED_SECTION_IDS.has(section.id)) return false;
  if (section.id === "assortment") return true;
  return section.completedSteps > 0 || section.tasks.some((t) => t.status !== "pending");
}

const TM_REVIEW_SECTIONS = new Set(["profile", "documentation", "integrations", "assortment"]);

function isSectionLinkable(
  section: OnboardingSection,
  sections: OnboardingSection[],
  approvedIds: string[],
): boolean {
  if (!TM_REVIEW_SECTIONS.has(section.id)) return false;
  if (isSectionLocked(section, sections, approvedIds)) return false;
  if (section.id === "assortment") return true;
  return isSectionReviewable(section);
}

function ChecklistIcon({
  src,
  size,
  className,
  gray = false,
}: {
  src: string;
  size: number;
  className?: string;
  gray?: boolean;
}) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      style={gray ? { filter: GRAY_ICON_FILTER } : undefined}
      aria-hidden
    />
  );
}

function SectionRow({
  section,
  sections,
  partnerId,
  approvedIds = [],
}: {
  section: OnboardingSection;
  sections: OnboardingSection[];
  partnerId: string;
  approvedIds?: string[];
}) {
  const locked = isSectionLocked(section, sections, approvedIds);
  const reviewable = isSectionReviewable(section);
  const linkable = isSectionLinkable(section, sections, approvedIds);
  const progress = resolveSectionProgressPercent(section, approvedIds);
  const profileCompletedSteps = resolveSectionCompletedSteps(section, approvedIds);
  const sectionIcon = SECTION_ICON_SRC[section.id] ?? "/icons/marketplace.svg";
  const statusIcon = resolveOnboardingSectionStatusIcon(section, sections, approvedIds);

  const content = (
    <div
      className={cn(
        "flex items-start px-5 py-5",
        locked && "opacity-70",
        reviewable && !locked && "hover:bg-[var(--color-muted)]/40",
        linkable && "cursor-pointer",
      )}
    >
      <ChecklistIcon
        src={statusIcon.src}
        size={24}
        gray={statusIcon.gray}
        className="self-center"
      />
      <div className="ml-3 flex min-w-0 flex-1 items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <ChecklistIcon src={sectionIcon} size={40} />
          <div className="min-w-0">
            <h3 className="text-[18px] font-semibold leading-snug text-[var(--color-foreground)]">
              {section.title}
            </h3>
            <div className="mt-2 flex items-center gap-1">
              <div className="h-1.5 w-[200px] shrink-0 overflow-hidden rounded-full bg-[var(--color-progress-track)]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    !locked && progress === 100 && "bg-[var(--color-success)]",
                    !locked && progress > 0 && progress < 100 && "bg-[var(--color-primary)]",
                  )}
                  style={{ width: locked || progress === 0 ? "0%" : `${progress}%` }}
                />
              </div>
              <span className="shrink-0 text-[var(--text-caption-size)] font-semibold tabular-nums text-[var(--color-foreground)]">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusTag className="inline-flex items-center gap-1.5 border border-[var(--color-border)] bg-[var(--color-card)] tabular-nums text-[var(--color-muted-foreground)]">
            <ChecklistIcon src="/icons/list-partial.svg" size={16} />
            {profileCompletedSteps}/{section.totalSteps} steps
          </StatusTag>
          <div className="flex flex-wrap justify-end gap-1.5">
            {section.tasks.map((task) => {
              const lockedTask = locked;
              const iconSrc = lockedTask
                ? "/icons/lock-fill.svg"
                : section.id === "assortment"
                  ? getAssortmentTaskIconSrc(task)
                  : getSubTaskIconSrc(section.id, task, approvedIds);
              return (
              <ChecklistIcon
                key={task.id}
                src={iconSrc}
                size={16}
                gray={
                  !locked &&
                  section.id !== "assortment" &&
                  shouldGrayChecklistSubTaskIcon(section.id, task, approvedIds)
                }
              />
            );})}
          </div>
        </div>
      </div>
    </div>
  );

  if (linkable) {
    return (
      <Link href={`/sellers/onboarding/${partnerId}/review/${section.id}`} className="block">
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}

export function OnboardingChecklistView({ partner, onboarding }: OnboardingChecklistViewProps) {
  const setContext = useOnboardingReviewStore((s) => s.setContext);
  const approvedIds = useOnboardingReviewStore((s) => s.approvedIds);
  const { total: totalSections, remaining: remainingSections } = countSectionProgress(
    onboarding.sections,
    approvedIds,
  );
  const overallProgress = computeOnboardingOverallProgress(onboarding.sections, approvedIds);

  useEffect(() => {
    setContext(partner.id);
  }, [partner.id, setContext]);

  return (
    <div className="space-y-[var(--space-4)]">
      <PartnerProfileHeader
        partner={partner}
        launchDate={onboarding.targetLaunchDate}
        outreachMailType="onboarding_kickoff"
      />

      <section>
        <h2 className="mb-2 text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
          Onboarding Progress
        </h2>
        <div className="flex items-center gap-1">
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-progress-track)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="shrink-0 text-[var(--text-body-size)] font-semibold tabular-nums text-[var(--color-foreground)]">
            {overallProgress}%
          </p>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="tabular-nums">
            {String(remainingSections).padStart(2, "0")}/
            {String(totalSections).padStart(2, "0")} Tasks Remaining
          </span>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-[20px] font-semibold text-[var(--color-foreground)]">
          Onboarding checklist
        </h2>
        <Card className="overflow-hidden border-[var(--color-border)] shadow-[var(--shadow-low)]">
          {onboarding.sections.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              sections={onboarding.sections}
              partnerId={partner.id}
              approvedIds={approvedIds}
            />
          ))}
        </Card>
      </section>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </div>
  );
}
