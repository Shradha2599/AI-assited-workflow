import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { OnboardingTask } from "@/lib/mock-data/onboarding";
import {
  getDocumentationSubTaskNavIconSrc,
  getProfileSubTaskNavIconSrc,
  ONBOARDING_ICON_GRAY_FILTER,
  shouldGrayDocumentationSubTaskNavIcon,
  shouldGrayProfileSubTaskNavIcon,
} from "@/features/partner-onboarding/utils/profile-task-icons";
import {
  REVIEW_NAV_PL,
  REVIEW_NAV_PR,
} from "./onboarding-section-review-layout";

export interface OnboardingSubtaskNavItem {
  id: string;
  title: string;
  hint: string;
  href: string;
  task: OnboardingTask;
}

interface OnboardingSubtaskNavProps {
  items: OnboardingSubtaskNavItem[];
  activeId: string;
  /** Profile uses success icons; documentation uses review icons for approve/reject flow. */
  navVariant?: "profile" | "documentation";
  /** TM-approved profile task ids (from onboarding review store). */
  approvedIds?: string[];
}

export function OnboardingSubtaskNav({
  items,
  activeId,
  navVariant = "profile",
  approvedIds = [],
}: OnboardingSubtaskNavProps) {
  return (
    <nav
      className={cn(
        "w-[min(100%,320px)] shrink-0 border-r border-[var(--color-border)] py-6",
        REVIEW_NAV_PL,
        REVIEW_NAV_PR,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        const isDocumentation = navVariant === "documentation";
        const iconSrc = isDocumentation
          ? getDocumentationSubTaskNavIconSrc(item.task, approvedIds)
          : getProfileSubTaskNavIconSrc(item.task, approvedIds);
        const gray = isDocumentation
          ? shouldGrayDocumentationSubTaskNavIcon(item.task, approvedIds)
          : shouldGrayProfileSubTaskNavIcon(item.task, approvedIds);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "mb-2 block rounded-[var(--radius-md)] border px-4 py-3 transition-colors last:mb-0",
              isActive
                ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                : "border-transparent hover:bg-[var(--color-muted)]/40",
            )}
          >
            <div className="flex items-start gap-2">
              <Image
                src={iconSrc}
                alt=""
                width={24}
                height={24}
                className="mt-0.5 shrink-0"
                style={gray ? { filter: ONBOARDING_ICON_GRAY_FILTER } : undefined}
                aria-hidden
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[var(--text-caption-size)] font-semibold leading-snug",
                    isActive ? "text-[var(--color-primary)]" : "text-[var(--color-foreground)]",
                  )}
                >
                  {item.title}
                </p>
                <p className="mt-1 text-[var(--text-label-size)] leading-snug text-[var(--color-muted-foreground)]">
                  {item.hint}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export const PROFILE_SUBTASK_HINTS: Record<string, string> = {
  "Brand profile": "Provide your brand details and assets.",
  "Guest services and reverse logistics": "Provide guest service and reverse logistics contacts.",
  "Business identity and address": "Provide business identity related information and address.",
  "Marketplace users": "Add marketplace user accounts.",
  "Fulfilment details": "Configure fulfilment preferences.",
  "Returns policy": "Upload or link your returns policy.",
  "Privacy policy": "Upload or link your privacy policy.",
};
