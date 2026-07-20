"use client";

import {
  DrawerHeaderShell,
  DrawerPanel,
  DrawerTitleAccent,
} from "@/components/ui/drawer-panel";
import { TruncatedText } from "@/components/ui/truncated-text";
import { getCatalogCategoryForPlanItem } from "@/lib/mock-data/plan-item-matching";

interface ItemTypesDrawerProps {
  title: string;
  accent?: string;
  items: string[];
  onClose: () => void;
}

export function ItemTypesDrawer({ title, accent, items, onClose }: ItemTypesDrawerProps) {
  return (
    <DrawerPanel
      ariaLabel={title}
      onClose={onClose}
      header={
        <DrawerHeaderShell
          onClose={onClose}
          title={
            accent ? (
              <>
                {title}: <DrawerTitleAccent>{accent}</DrawerTitleAccent>
              </>
            ) : (
              title
            )
          }
        />
      }
    >
      <div className="flex items-center justify-between px-[var(--space-4)] pb-[var(--space-4)]">
        <div>
          <p className="text-[var(--text-section-size)] font-semibold text-[var(--color-foreground)]">
            Item types
          </p>
          <p className="mt-0.5 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            {items.length} item {items.length === 1 ? "type" : "types"}
          </p>
        </div>
      </div>

      <ul className="space-y-[var(--space-3)] px-[var(--space-4)] pb-[var(--space-4)]">
        {items.map((item) => {
          const category = getCatalogCategoryForPlanItem(item);
          return (
            <li
              key={item}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-[var(--space-3)]"
            >
              <TruncatedText
                text={item}
                className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]"
              />
              {category && (
                <p className="mt-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
                  {category}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </DrawerPanel>
  );
}
