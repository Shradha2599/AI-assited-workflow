"use client";

import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGapDrawerStore } from "@/features/assortment-gap/store/gap-drawer-store";
import { HALLOWEEN_TRENDING_GAP_COUNT } from "@/lib/mock-data/fy-plan-seeds";

const BANNER_IMAGE_WIDTH = 280;

export function HolidayBanner() {
  const openDrawer = useGapDrawerStore((s) => s.openDrawer);

  return (
    <Card className="relative mb-[var(--space-4)] min-h-[120px] overflow-hidden border-[var(--color-border)] bg-[var(--color-holiday-bg)]">
      <div
        className="relative z-10 p-[var(--space-4)]"
        style={{ paddingRight: BANNER_IMAGE_WIDTH + 8 }}
      >
        <span className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[#ffab66] px-2.5 py-0.5 text-[var(--text-label-size)] font-normal text-[var(--color-foreground)]">
          <Calendar className="h-3 w-3 shrink-0" aria-hidden />
          Oct 31, 2026
        </span>
        <h2 className="mt-2 text-[18px] font-bold leading-tight text-[var(--color-holiday-text)]">
          Plan for Halloween
        </h2>
        <p className="mt-1.5 text-[var(--text-caption-size)] leading-snug text-[var(--color-muted-foreground)]">
          Stay ahead of seasonal demand. {HALLOWEEN_TRENDING_GAP_COUNT} trending Halloween product
          types seen over the last 3 years aren&apos;t in your assortment. Plan before the October
          shopping rush.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => openDrawer("Kitchen & Dining — Halloween", "calendar-update", "Kitchen & Dining")}
        >
          Plan Assortment
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
      <div
        className="pointer-events-none absolute bottom-0 right-0"
        style={{ width: BANNER_IMAGE_WIDTH }}
      >
        <Image
          src="/images/halloween-scene.png"
          alt="Spooky Halloween scene with pumpkins, ghosts, and tombstones"
          width={992}
          height={292}
          unoptimized
          className="block h-auto w-full translate-y-2"
          sizes={`${BANNER_IMAGE_WIDTH}px`}
          priority
        />
      </div>
    </Card>
  );
}
