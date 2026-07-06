import Image from "next/image";
import { cn } from "@/lib/utils";

const ICONS = {
  logo: "/icons/targetplus-mark-tm.svg",
  home: "/icons/house.svg",
  ao: "/icons/tm-in-progress.svg",
  search: "/icons/search.svg",
  help: "/icons/help.svg",
  bell: "/icons/bell.svg",
  aiSparkle: "/icons/ai-gen-fill.svg",
  menuAction: "/icons/menu-action.svg",
  arrowRight: "/icons/arrow-right.svg",
  mail: "/icons/mail.svg",
  calendar: "/icons/calendar.svg",
  chevronLeft: "/icons/chevron-left-double.svg",
  chevronRight: "/icons/chevron-right-double.svg",
  infoFill: "/icons/info-fill.svg",
} as const;

export type SvgIconName = keyof typeof ICONS;

interface SvgIconProps {
  name: SvgIconName;
  size?: number;
  className?: string;
  alt?: string;
  /**
   * default   – renders as-is (dark fill)
   * onPrimary – white icon (for filled primary buttons)
   * primary   – tinted to match --color-primary (#1a73e8)
   */
  variant?: "default" | "onPrimary" | "primary";
}

export function SvgIcon({
  name,
  size = 20,
  className,
  alt = "",
  variant = "default",
}: SvgIconProps) {
  return (
    <Image
      src={ICONS[name]}
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "shrink-0",
        variant === "onPrimary" && "brightness-0 invert",
        className,
      )}
      style={
        variant === "primary"
          ? {
              filter:
                "brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1352%) hue-rotate(199deg) brightness(100%) contrast(95%)",
            }
          : undefined
      }
      aria-hidden={!alt}
    />
  );
}
