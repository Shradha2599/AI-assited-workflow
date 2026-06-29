import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

export function HolidayBanner() {
  return (
    <Card className="mb-[var(--space-4)] overflow-hidden border-[var(--color-holiday-badge)] bg-[var(--color-holiday-bg)]">
      <div className="flex items-center justify-between gap-[var(--space-4)] p-[var(--space-4)]">
        <div className="flex-1">
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
        <ImagePlaceholder size="banner" rounded="full" label="Holiday season illustration" />
      </div>
    </Card>
  );
}
