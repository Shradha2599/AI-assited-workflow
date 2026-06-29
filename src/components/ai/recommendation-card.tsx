import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { BeaconRecommendation } from "@/types";

interface RecommendationCardProps {
  recommendation: BeaconRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <Card>
      <CardContent className="p-[var(--space-4)]">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[var(--text-body-size)] font-medium">
            {recommendation.title}
          </p>
          {recommendation.confidence !== undefined && (
            <Badge variant="primary">{recommendation.confidence}%</Badge>
          )}
        </div>
        <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          {recommendation.description}
        </p>
        {recommendation.actionLabel && recommendation.actionHref && (
          <Link
            href={recommendation.actionHref}
            className="mt-[var(--space-3)] inline-block text-[var(--text-caption-size)] font-medium text-[var(--color-primary)] hover:underline"
          >
            {recommendation.actionLabel}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
