"use client";

import { useEffect, useMemo } from "react";

import { PipelineHeatmap } from "@/components/data-display/pipeline-heatmap";
import {
  useDiscoveryStore,
  useFYDiscoverySnapshot,
} from "@/features/lead-discovery/store/discovery-store";
import { usePlanStore } from "@/features/assortment-plan/store/plan-store";
import {
  mergePipelineWithDiscovery,
  type PipelineData,
} from "@/lib/pipeline-discovery-sync";

interface PipelineHeatmapSyncedProps {
  baseline: PipelineData;
  fyLabel?: string;
  categoryFilterLabel?: string;
  className?: string;
}

/** Pipeline heatmap with live Discovered / Shortlisted / Contacted counts from Lead Discovery */
export function PipelineHeatmapSynced({
  baseline,
  ...props
}: PipelineHeatmapSyncedProps) {
  const syncLeadPoolVersion = useDiscoveryStore((s) => s.syncLeadPoolVersion);
  const syncFYDiscoverySeed = useDiscoveryStore((s) => s.syncFYDiscoverySeed);
  const fiscalYear = usePlanStore((s) => s.fiscalYear);
  const snap = useFYDiscoverySnapshot(fiscalYear);

  useEffect(() => {
    syncLeadPoolVersion();
    syncFYDiscoverySeed();
  }, [syncLeadPoolVersion, syncFYDiscoverySeed]);

  const pipeline = useMemo(
    () =>
      mergePipelineWithDiscovery(baseline, {
        discovered: snap.discoveredIds.length,
        shortlisted: snap.shortlistedIds.length,
        contacted: snap.contactedIds.length,
        hasUserInitiatedDiscovery: snap.hasUserInitiatedDiscovery,
      }),
    [baseline, snap],
  );

  return (
    <PipelineHeatmap
      stageColumns={pipeline.stageColumns}
      categoryRows={pipeline.categoryRows}
      {...props}
    />
  );
}
