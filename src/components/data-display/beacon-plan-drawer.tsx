"use client";

import { useEffect, useRef, useState } from "react";

import { BeaconPlanDrawerShimmer } from "@/components/data-display/beacon-plan-shimmer";
import { DrawerRevenueSummary } from "@/components/data-display/drawer-revenue-summary";
import type { GapItem } from "@/components/data-display/gaps-drawer";
import { GapItemCard } from "@/components/data-display/gap-item-card";
import { Button } from "@/components/ui/button";
import { DrawerHeaderShell, DrawerPanel } from "@/components/ui/drawer-panel";
import { SvgIcon } from "@/components/ui/svg-icon";

function parseRevM(r: string): number {
  const m = r.match(/\$?([\d.]+)([MK]?)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2]?.toUpperCase() === "K" ? n / 1000 : n;
}

interface BeaconPlanDrawerProps {
  open: boolean;
  existingPlanItems: string[];
  revenueGoal: string;
  revenuePlanned: string;
  revenuePlannedPercent: number;
  plannedMessage: string;
  onClose: () => void;
  onAddToPlan: (items: Array<{ name: string; revenueM: number }>) => void;
}

export function BeaconPlanDrawer({
  open,
  existingPlanItems,
  revenueGoal,
  revenuePlanned,
  revenuePlannedPercent,
  plannedMessage,
  onClose,
  onAddToPlan,
}: BeaconPlanDrawerProps) {
  const [items, setItems]           = useState<GapItem[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const abortRef                    = useRef<AbortController | null>(null);

  // Fetch recommendations whenever the drawer opens (or revenue goal changes)
  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      return;
    }

    // Abort any in-flight request
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    setItems([]);

    fetch("/api/plan-with-beacon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revenueGoal, existingPlanItems }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<GapItem[]>;
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        console.error("[BeaconPlanDrawer]", err);
        setError("Something went wrong analysing your assortment. Please try again.");
        setLoading(false);
      });

    return () => ctrl.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, revenueGoal]);

  if (!open) return null;

  const availableItems = items.filter((item) => !existingPlanItems.includes(item.name));

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === availableItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableItems.map((item) => item.id)));
    }
  }

  function handleAddSelected() {
    if (selectedIds.size === 0) return;
    const selectedItems = availableItems
      .filter((item) => selectedIds.has(item.id))
      .map((item) => ({ name: item.name, revenueM: parseRevM(item.estimatedRevenue) }));
    onAddToPlan(selectedItems);
    setSelectedIds(new Set());
    onClose();
  }

  return (
    <DrawerPanel
      ariaLabel="Plan with Beacon"
      onClose={onClose}
      header={
        <DrawerHeaderShell
          onClose={onClose}
          title={
            <span className="inline-flex items-center gap-2">
              <SvgIcon name="aiSparkle" size={20} />
              Plan with Beacon
            </span>
          }
        />
      }
      footer={
        !loading && !error && availableItems.length > 0 ? (
          <Button className="w-full" disabled={selectedIds.size === 0} onClick={handleAddSelected}>
            Add to Plan{selectedIds.size > 0 ? ` (${selectedIds.size} selected)` : ""}
          </Button>
        ) : undefined
      }
    >
      <div className="px-[var(--space-4)] pb-[var(--space-4)] pt-[var(--space-4)]">
        <DrawerRevenueSummary
          revenueGoal={revenueGoal}
          revenuePlanned={revenuePlanned}
          revenuePlannedPercent={revenuePlannedPercent}
          plannedMessage={plannedMessage}
        />
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading && (
        <>
          <div className="px-[var(--space-4)] pb-[var(--space-4)]">
            <div className="h-4 w-56 rounded-[var(--radius-sm)] bg-shimmer" />
            <div className="mt-2 h-3 w-36 rounded-[var(--radius-sm)] bg-shimmer" />
          </div>
          <BeaconPlanDrawerShimmer count={5} />

          {/* Status message */}
          <p className="mt-2 px-[var(--space-4)] text-center text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Beacon is analysing the assortment gap for{" "}
            <span className="font-semibold text-[var(--color-foreground)]">{revenueGoal}</span>…
          </p>
        </>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="px-[var(--space-4)] py-12 text-center">
          <p className="text-[var(--text-body-size)] text-[var(--color-error)]">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => {
              // Re-trigger by toggling open (parent manages this)
              setError(null);
              setLoading(true);
              fetch("/api/plan-with-beacon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ revenueGoal, existingPlanItems }),
              })
                .then((r) => r.json() as Promise<GapItem[]>)
                .then((data) => { setItems(data); setLoading(false); })
                .catch(() => { setError("Something went wrong. Please try again."); setLoading(false); });
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <>
          <div className="flex items-center justify-between px-[var(--space-4)] pb-[var(--space-4)]">
            <div>
              <p className="text-[var(--text-section-size)] font-semibold text-[var(--color-foreground)]">
                Item type recommendations
              </p>
              <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                {availableItems.length} item types selected to meet your {revenueGoal} goal
              </p>
            </div>
            {availableItems.length > 0 && (
              <Button variant="ghost" size="sm" className="h-auto px-0 py-0" onClick={toggleAll}>
                {selectedIds.size === availableItems.length ? "Deselect all" : "Select all"}
              </Button>
            )}
          </div>

          <ul className="space-y-[var(--space-3)] px-[var(--space-4)] pb-[var(--space-4)]">
            {availableItems.map((item) => (
              <li key={item.id}>
                <GapItemCard
                  item={item}
                  selectable
                  selected={selectedIds.has(item.id)}
                  onToggleSelect={() => toggleItem(item.id)}
                />
              </li>
            ))}
            {availableItems.length === 0 && (
              <li className="py-8 text-center text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                All recommended item types are already in your plan.
              </li>
            )}
          </ul>
        </>
      )}
    </DrawerPanel>
  );
}
