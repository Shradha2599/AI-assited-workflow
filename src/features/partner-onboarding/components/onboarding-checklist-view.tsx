"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Files,
  Link2,
  Lock,
  Package,
  Store,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OnboardingPartner, OnboardingSection, OnboardingTask } from "@/lib/mock-data/onboarding";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { OnboardingProfileHeader } from "./onboarding-profile-header";
import { AgentFeedbackModal } from "./agent-feedback-modal";
import { OnboardingCommentsDrawer } from "./onboarding-comments-drawer";
import { useOnboardingReviewStore } from "../store/onboarding-review-store";

interface OnboardingChecklistViewProps {
  partner: PotentialPartner;
  onboarding: OnboardingPartner;
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  profile: Store,
  assortment: BarChart3,
  documentation: Files,
  integrations: Link2,
  "item-listing": Package,
  stripe: CreditCard,
};

const LOCKED_SECTION_IDS = new Set(["item-listing", "stripe"]);

function isSectionLocked(section: OnboardingSection, sections: OnboardingSection[]): boolean {
  if (!LOCKED_SECTION_IDS.has(section.id)) return false;
  const prerequisites = sections.filter((s) => !LOCKED_SECTION_IDS.has(s.id));
  return !prerequisites.every((s) => s.completedSteps >= s.totalSteps);
}

function sectionProgressPercent(section: OnboardingSection): number {
  if (!section.totalSteps) return 0;
  return Math.round((section.completedSteps / section.totalSteps) * 100);
}

function TaskStepDot({ task, locked }: { task: OnboardingTask; locked: boolean }) {
  if (locked) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-muted)]">
        <Lock className="h-2.5 w-2.5 text-[var(--color-muted-foreground)]" />
      </span>
    );
  }
  if (task.status === "complete") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (task.issue || task.status === "blocked") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-warning-light)] text-[var(--color-warning)]">
        <AlertTriangle className="h-3 w-3" />
      </span>
    );
  }
  if (task.status === "in_progress") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-warning-light)] text-[var(--color-warning)]">
        <Clock className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span className="h-5 w-5 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-card)]" />
  );
}

function isSectionReviewable(section: OnboardingSection): boolean {
  if (LOCKED_SECTION_IDS.has(section.id)) return false;
  return section.completedSteps > 0 || section.tasks.some((t) => t.status !== "pending");
}

function SectionRow({
  section,
  sections,
  partnerId,
}: {
  section: OnboardingSection;
  sections: OnboardingSection[];
  partnerId: string;
}) {
  const locked = isSectionLocked(section, sections);
  const reviewable = isSectionReviewable(section);
  const Icon = SECTION_ICONS[section.id] ?? Store;
  const progress = sectionProgressPercent(section);
  const hasActiveProgress = progress > 0 && progress < 100;

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 px-5 py-4",
        locked && "opacity-70",
        reviewable && !locked && "hover:bg-[var(--color-muted)]/50",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
          locked
            ? "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
            : hasActiveProgress || progress === 100
              ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
              : "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
        )}
      >
        {locked ? <Lock className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <p className="min-w-[140px] shrink-0 text-[var(--text-caption-size)] font-semibold">
            {section.title}
          </p>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-muted)]">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                !locked && progress === 100 && "bg-[var(--color-success)]",
                !locked && progress > 0 && progress < 100 && "bg-[var(--color-primary)]",
              )}
              style={{ width: locked || progress === 0 ? "0%" : `${progress}%` }}
            />
          </div>
          <span className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-2.5 py-0.5 text-[var(--text-label-size)] font-medium tabular-nums text-[var(--color-muted-foreground)]">
            {section.completedSteps}/{section.totalSteps} steps
          </span>
          {reviewable && !locked && (
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]" />
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5 pl-0">
          {section.tasks.map((task) => (
            <TaskStepDot key={task.id} task={task} locked={locked} />
          ))}
        </div>
      </div>
    </div>
  );

  if (reviewable && !locked && (section.id === "profile" || section.id === "documentation")) {
    return (
      <Link
        href={`/sellers/onboarding/${partnerId}/review/${section.id}`}
        className="block border-b border-[var(--color-border)] last:border-0"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="border-b border-[var(--color-border)] last:border-0">{content}</div>
  );
}

export function OnboardingChecklistView({ partner, onboarding }: OnboardingChecklistViewProps) {
  const setContext = useOnboardingReviewStore((s) => s.setContext);
  const allTasks = onboarding.sections.flatMap((s) => s.tasks);
  const completedTasks = allTasks.filter((t) => t.status === "complete").length;
  const remainingTasks = allTasks.length - completedTasks;

  useEffect(() => {
    setContext(partner.id);
  }, [partner.id, setContext]);

  return (
    <div className="space-y-[var(--space-4)]">
      <OnboardingProfileHeader partner={partner} launchDate={onboarding.targetLaunchDate} />

      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[var(--text-body-size)] font-semibold">Onboarding Progress</p>
          <p className="text-[var(--text-body-size)] font-semibold tabular-nums">
            {onboarding.overallProgress}%
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-muted)]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all"
            style={{ width: `${onboarding.overallProgress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          <Clock className="h-3.5 w-3.5" />
          <span className="tabular-nums">
            {String(remainingTasks).padStart(2, "0")}/{String(allTasks.length).padStart(2, "0")}{" "}
            Tasks Remaining
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-5 py-3">
          <p className="text-[var(--text-body-size)] font-semibold">Onboarding checklist</p>
        </div>
        {onboarding.sections.map((section) => (
          <SectionRow
            key={section.id}
            section={section}
            sections={onboarding.sections}
            partnerId={partner.id}
          />
        ))}
      </Card>

      <OnboardingCommentsDrawer partner={partner} />
      <AgentFeedbackModal />
    </div>
  );
}
