import Image from "next/image";
import { Check } from "lucide-react";

import type { OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getProfileSubTaskIconSrc,
  ONBOARDING_ICON_GRAY_FILTER,
  shouldGrayProfileSubTaskIcon,
} from "@/features/partner-onboarding/utils/profile-task-icons";
import type { OnboardingTask as PipelineOnboardingTask, TaskStatus } from "@/lib/mock-data/pipeline-partners";
import type { OnboardingSection } from "@/lib/mock-data/onboarding";
import { getOnboardingForPartner } from "@/lib/mock-data/onboarding";
import type { PartnerPipelineStatus } from "@/lib/mock-data/potential-partners";
import { StatusTag } from "@/components/ui/status-tag";
import { TruncatedText } from "@/components/ui/truncated-text";
import { resolveOnboardingSectionStatusIcon } from "../utils/onboarding-section-status-icon";

const GREY_FILTER =
  "brightness(0) saturate(100%) invert(55%) sepia(8%) saturate(0%) hue-rotate(180deg) brightness(95%) contrast(88%)";

const STATUS_CONFIG: Record<
  PartnerPipelineStatus,
  { bg: string; icon: string; iconFilter?: string }
> = {
  New: {
    bg: "#F0F0F0",
    icon: "/icons/ai-gen-simple.svg",
    iconFilter: GREY_FILTER,
  },
  Rejected: {
    bg: "var(--color-error-light)",
    icon: "/icons/close.svg",
    iconFilter: GREY_FILTER,
  },
  "In Review": {
    bg: "var(--color-warning-light)",
    icon: "/icons/tm-in-progress.svg",
    iconFilter: GREY_FILTER,
  },
  Approved: {
    bg: "var(--color-success-light)",
    icon: "/icons/checkmark-approved.svg",
    iconFilter: GREY_FILTER,
  },
  "Future Interest": {
    bg: "#EFCBDB",
    icon: "/icons/arrow-subdirectory.svg",
    iconFilter: GREY_FILTER,
  },
  Onboarding: {
    bg: "#A5BDEC",
    icon: "/icons/progress.svg",
    iconFilter: GREY_FILTER,
  },
};

export function PartnerStatusBadge({ status }: { status: PartnerPipelineStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <StatusTag
      className="max-w-[140px] gap-1 whitespace-nowrap text-[var(--color-foreground)]"
      style={{ backgroundColor: config.bg }}
    >
      {status === "Approved" ? (
        <Check className="h-3 w-3 shrink-0" aria-hidden />
      ) : (
        <Image
          src={config.icon}
          alt=""
          width={12}
          height={12}
          className="shrink-0"
          style={config.iconFilter ? { filter: config.iconFilter } : undefined}
          aria-hidden
        />
      )}
      <TruncatedText text={status} inline />
    </StatusTag>
  );
}

type ProgressVisual =
  | { kind: "image"; src: string; filter?: string }
  | { kind: "validated" };

function resolveTaskVisual(
  task: PipelineOnboardingTask,
  index: number,
  total: number,
): ProgressVisual {
  let status: TaskStatus = task.status;

  if (status === "locked" && index < total - 2) {
    status = "in_progress";
  }

  switch (status) {
    case "validated":
      return { kind: "validated" };
    case "completed":
      return { kind: "image", src: "/icons/progress-check.svg", filter: GREY_FILTER };
    case "in_progress":
      return { kind: "image", src: "/icons/progress.svg", filter: GREY_FILTER };
    case "in_review":
      return { kind: "image", src: "/icons/clipboard.svg", filter: GREY_FILTER };
    case "locked":
      return { kind: "image", src: "/icons/lock-fill.svg", filter: GREY_FILTER };
    case "error":
      return { kind: "image", src: "/icons/warning-fill.svg" };
    default:
      return { kind: "image", src: "/icons/progress.svg", filter: GREY_FILTER };
  }
}

function ValidatedTaskIcon() {
  return (
    <span
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#1A7F1A]"
      aria-hidden
    >
      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
    </span>
  );
}

export function OnboardingProfileTaskProgressSteps({
  tasks,
  approvedIds = [],
}: {
  tasks: OnboardingTask[];
  approvedIds?: string[];
}) {
  return (
    <div className="flex items-center gap-1">
      {tasks.map((task) => {
        const src = getProfileSubTaskIconSrc(task, approvedIds);
        const gray = shouldGrayProfileSubTaskIcon(task, approvedIds);
        return (
          <Image
            key={task.id}
            src={src}
            alt=""
            width={16}
            height={16}
            className="shrink-0"
            style={gray ? { filter: ONBOARDING_ICON_GRAY_FILTER } : undefined}
            title={task.title}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

export function OnboardingChecklistProgressSteps({
  sections,
  approvedIds = [],
}: {
  sections: OnboardingSection[];
  approvedIds?: string[];
}) {
  return (
    <div className="flex items-center gap-1">
      {sections.map((section) => {
        const { src, gray, title } = resolveOnboardingSectionStatusIcon(
          section,
          sections,
          approvedIds,
        );

        return (
          <Image
            key={section.id}
            src={src}
            alt=""
            width={16}
            height={16}
            className="shrink-0"
            style={gray ? { filter: GREY_FILTER } : undefined}
            title={title}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

/** Table progress column — same 6 section status icons as the profile checklist. */
export function OnboardingPartnerProgressSteps({
  partner,
  approvedIds = [],
}: {
  partner: { id: string; sellerId: string; legalBusinessName: string };
  approvedIds?: string[];
}) {
  const sections = getOnboardingForPartner(partner).sections;
  return <OnboardingChecklistProgressSteps sections={sections} approvedIds={approvedIds} />;
}

export function OnboardingProgressSteps({ tasks }: { tasks: PipelineOnboardingTask[] }) {
  return (
    <div className="flex items-center gap-1">
      {tasks.map((task, index) => {
        const visual = resolveTaskVisual(task, index, tasks.length);
        return visual.kind === "validated" ? (
          <span key={task.id} title={task.name}>
            <ValidatedTaskIcon />
          </span>
        ) : (
          <Image
            key={task.id}
            src={visual.src}
            alt=""
            width={16}
            height={16}
            className="shrink-0"
            style={visual.filter ? { filter: visual.filter } : undefined}
            title={task.name}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

export const ALL_PARTNER_STATUSES: PartnerPipelineStatus[] = [
  "New",
  "In Review",
  "Approved",
  "Rejected",
  "Onboarding",
  "Future Interest",
];
