import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BANNER_IMAGE_WIDTH = 280;

export function HolidayBanner() {
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
        <p className="mt-1.5 truncate text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          Spooky-season searches are up 34% YoY — lock in décor, lighting, and party assortments before the October rush.
        </p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href="/assortment/plan">
            Plan Assortment Now
            <ArrowRight className="h-3 w-3" />
          </Link>
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
