import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BANNER_IMAGE_WIDTH = 168;

export function HolidayBanner() {
  return (
    <Card className="relative mb-[var(--space-4)] overflow-hidden border-[var(--color-holiday-badge)] bg-[var(--color-holiday-bg)]">
      <div
        className="relative z-10 p-[var(--space-4)]"
        style={{ paddingRight: BANNER_IMAGE_WIDTH + 16 }}
      >
        <span className="inline-block rounded-[var(--radius-sm)] bg-[var(--color-holiday-badge)] px-2 py-0.5 text-[var(--text-label-size)] font-medium text-[var(--color-success)]">
          26 Nov-25 Dec, 2026
        </span>
        <h2 className="mt-2 text-[var(--text-section-size)] font-semibold text-[var(--color-holiday-text)]">
          Plan for the Holiday Season
        </h2>
        <p className="mt-1 max-w-xl text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          Based on the data of last 3 years, now is the right time to prepare your
          assortment and maximize revenue for Thanksgiving &amp; Christmas
        </p>
        <Button variant="outline" size="sm" className="mt-3">
          Plan Assortment Now
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
      <div
        className="absolute bottom-0 right-0 top-0 flex items-center justify-end"
        style={{ width: BANNER_IMAGE_WIDTH }}
      >
        <Image
          src="/images/holiday-santa.png"
          alt="Santa Claus with reindeer"
          width={168}
          height={168}
          className="h-full w-auto max-w-full object-contain object-right"
          sizes={`${BANNER_IMAGE_WIDTH}px`}
          priority
        />
      </div>
    </Card>
  );
}
