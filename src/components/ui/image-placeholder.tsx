import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ImagePlaceholderSize = "sm" | "md" | "lg" | "banner";

const sizeClasses: Record<ImagePlaceholderSize, string> = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  banner: "h-20 w-20",
};

interface ImagePlaceholderProps {
  size?: ImagePlaceholderSize;
  label?: string;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedClasses = {
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
  full: "rounded-full",
};

export function ImagePlaceholder({
  size = "md",
  label,
  className,
  rounded = "md",
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center border border-dashed border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
        sizeClasses[size],
        roundedClasses[rounded],
        className,
      )}
      aria-hidden={!label}
      aria-label={label}
      title={label ?? "Image placeholder"}
    >
      <ImageIcon className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5")} />
      {size === "banner" && (
        <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide">Image</span>
      )}
    </div>
  );
}
