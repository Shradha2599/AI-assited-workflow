import Image from "next/image";
import { Check } from "lucide-react";

import type { OnboardingTask, TaskStatus } from "@/lib/mock-data/pipeline-partners";
import type { OnboardingSection } from "@/lib/mock-data/onboarding";
import {
  getOnboardingSectionProgressPercent,
  getOnboardingSectionStatusIconSrc,
  isOnboardingSectionLocked,
} from "@/lib/mock-data/onboarding";
import type { PartnerPipelineStatus } from "@/lib/mock-data/potential-partners";
import { StatusTag } from "@/components/ui/status-tag";

const GREY_FILTER =
  "brightness(0) saturate(100%) invert(55%) sepia(8%) saturate(0%) hue-rotate(180deg) brightness(95%) contrast(88%)";

const WARNING_FILTER =
  "brightness(0) saturate(100%) invert(58%) sepia(86%) saturate(458%) hue-rotate(359deg) brightness(99%) contrast(92%)";

const STATUS_CONFIG: Record<
  PartnerPipelineStatus,
  { bg: string; text: string; icon: string; iconFilter?: string }
> = {
  New: {
    bg: "#F0F0F0",
    text: "#333333",
    icon: "/icons/ai-gen-simple.svg",
    iconFilter: GREY_FILTER,
  },
  Rejected: {
    bg: "var(--color-error-light)",
    text: "var(--color-error)",
    icon: "/icons/close.svg",
  },
  "In Review": {
    bg: "var(--color-warning-light)",
    text: "var(--color-warning)",
    icon: "/icons/tm-in-progress.svg",
  },
  Approved: {
    bg: "var(--color-success-light)",
    text: "var(--color-success)",
    icon: "/icons/checkmark-approved.svg",
  },
  "Future Interest": {
    bg: "#EFCBDB",
    text: "#8B3A5A",
    icon: "/icons/arrow-subdirectory.svg",
    iconFilter: GREY_FILTER,
  },
  Onboarding: {
    bg: "#A5BDEC",
    text: "#1A4480",
    icon: "/icons/progress.svg",
    iconFilter: GREY_FILTER,
  },
};

export function PartnerStatusBadge({ status }: { status: PartnerPipelineStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <StatusTag
      className="max-w-[140px] gap-1 truncate whitespace-nowrap"
      style={{ backgroundColor: config.bg, color: config.text }}
      title={status}
    >
      {status === "Approved" ? (
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#1A7F1A]">
          <Check className="h-2 w-2 text-white" strokeWidth={3} aria-hidden />
        </span>
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
      <span className="truncate">{status}</span>
    </StatusTag>
  );
}

type ProgressVisual =
  | { kind: "image"; src: string; filter?: string }
  | { kind: "validated" };

function resolveTaskVisual(
  task: OnboardingTask,
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
      return { kind: "image", src: "/icons/warning.svg", filter: WARNING_FILTER };
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

export function OnboardingChecklistProgressSteps({ sections }: { sections: OnboardingSection[] }) {
  return (
    <div className="flex items-center gap-1">
      {sections.map((section) => {
        const locked = isOnboardingSectionLocked(section, sections);
        const progress = getOnboardingSectionProgressPercent(section);
        const src = getOnboardingSectionStatusIconSrc(section, sections);

        return (
          <Image
            key={section.id}
            src={src}
            alt=""
            width={16}
            height={16}
            className="shrink-0"
            style={!locked && progress === 0 ? { filter: GREY_FILTER } : undefined}
            title={section.title}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

export function OnboardingProgressSteps({ tasks }: { tasks: OnboardingTask[] }) {
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
