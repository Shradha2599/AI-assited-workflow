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
  /** White icon for use on primary / filled buttons */
  variant?: "default" | "onPrimary";
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
      className={cn("shrink-0", variant === "onPrimary" && "brightness-0 invert", className)}
      aria-hidden={!alt}
    />
  );
}
