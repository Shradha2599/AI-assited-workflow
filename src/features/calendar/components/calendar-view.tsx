"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { useBeaconContext } from "@/features/beacon/hooks/use-beacon-context";
import { calendarBeaconContext } from "@/services/beacon.service";
import type { CalendarEvent } from "@/types";

const eventVariant = {
  onboarding: "primary" as const,
  review: "warning" as const,
  launch: "success" as const,
};

interface CalendarViewProps {
  events: CalendarEvent[];
}

export function CalendarView({ events }: CalendarViewProps) {
  useBeaconContext(calendarBeaconContext);

  return (
    <>
      <PageHeader
        title="Onboarding Calendar"
        description="Schedule and track seller onboarding events."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Calendar" },
        ]}
        actions={<Button>Generate Calendar</Button>}
      />

      <div className="space-y-[var(--space-3)]">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-[var(--space-4)] shadow-[var(--shadow-low)]"
          >
            <div>
              <p className="text-[var(--text-body-size)] font-medium">{event.title}</p>
              <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                {event.date}
              </p>
            </div>
            <Badge variant={eventVariant[event.type]}>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </Badge>
          </div>
        ))}
      </div>
    </>
  );
}
