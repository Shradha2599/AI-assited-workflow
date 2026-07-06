"use client";

import { useEffect, useState } from "react";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { resolveItemTypeImageUrl } from "@/lib/mock-data/item-type-images";
import { cn } from "@/lib/utils";

type ProductThumbnailSize = "sm" | "md";

const sizeClasses: Record<ProductThumbnailSize, string> = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
};

interface ProductThumbnailProps {
  src?: string;
  alt: string;
  itemId?: string;
  size?: ProductThumbnailSize;
  className?: string;
}

export function ProductThumbnail({
  src,
  alt,
  itemId,
  size = "sm",
  className,
}: ProductThumbnailProps) {
  const primarySrc = resolveItemTypeImageUrl({ id: itemId, name: alt, imageUrl: src });

  const [failed, setFailed] = useState(!primarySrc);

  useEffect(() => {
    setFailed(!primarySrc);
  }, [primarySrc]);

  if (!primarySrc || failed) {
    return <ImagePlaceholder size={size} rounded="sm" label={alt} className={className} />;
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-muted)]",
        sizeClasses[size],
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={primarySrc}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
