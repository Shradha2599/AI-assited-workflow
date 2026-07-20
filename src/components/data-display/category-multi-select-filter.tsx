"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CategoryFilterOption {
  id: string;
  name: string;
  hasSubcategories?: boolean;
  hasGapData?: boolean;
  taxonomyId?: string;
}

interface CategoryMultiSelectFilterProps {
  categories: CategoryFilterOption[];
  /** Applied selection — drives page filters and trigger label. */
  selectedIds: string[];
  onApply: (selectedIds: string[]) => void;
  /** All Target taxonomy category ids (21) — used for “All categories”. */
  allTaxonomyIds: string[];
  taxonomyCategoryCount: number;
  /** Treemap-backed ids — used for trigger label context. */
  treemapCategoryIds?: string[];
  treemapTileCount?: number;
  className?: string;
  align?: "start" | "end";
}

export function CategoryMultiSelectFilter({
  categories,
  selectedIds,
  onApply,
  allTaxonomyIds,
  taxonomyCategoryCount,
  treemapCategoryIds = [],
  treemapTileCount,
  className,
  align = "start",
}: CategoryMultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDraftIds(selectedIds);
  }, [open, selectedIds]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function isAllCategoriesSelected(ids: string[]) {
    return (
      allTaxonomyIds.length > 0 &&
      allTaxonomyIds.every((id) =>
        categories.some(
          (category) => category.taxonomyId === id && ids.includes(category.id),
        ),
      )
    );
  }

  const appliedAllSelected = isAllCategoriesSelected(selectedIds);

  const helperSelectedCount = appliedAllSelected
    ? taxonomyCategoryCount
    : selectedIds.length;

  const draftAllSelected = isAllCategoriesSelected(draftIds);

  const draftHelperCount = draftAllSelected ? taxonomyCategoryCount : draftIds.length;

  const triggerLabel = appliedAllSelected
    ? "All categories"
    : selectedIds.length === 0
      ? "Categories (0)"
      : `Categories (${treemapTileCount ?? selectedIds.length})`;

  const hasPendingChanges =
    open &&
    (draftIds.length !== selectedIds.length ||
      draftIds.some((id) => !selectedIds.includes(id)) ||
      selectedIds.some((id) => !draftIds.includes(id)));

  function toggleCategory(categoryId: string) {
    if (draftIds.includes(categoryId)) {
      setDraftIds(draftIds.filter((id) => id !== categoryId));
      return;
    }
    setDraftIds([...draftIds, categoryId]);
  }

  function selectAllTaxonomyCategories() {
    const ids = categories
      .filter(
        (category) => category.taxonomyId && allTaxonomyIds.includes(category.taxonomyId),
      )
      .map((category) => category.id);
    setDraftIds(ids);
  }

  function toggleAllCategories() {
    if (draftAllSelected) {
      setDraftIds([]);
      return;
    }
    selectAllTaxonomyCategories();
  }

  function handleClear() {
    setDraftIds([]);
  }

  function handleApply() {
    onApply(draftIds);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)]",
          "px-2 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]",
          open && "border-[var(--color-primary)] text-[var(--color-foreground)]",
        )}
      >
        {triggerLabel}
        <ChevronDown
          className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable
          aria-label="Filter by category"
          className={cn(
            "absolute top-full z-50 mt-1 min-w-[240px] rounded-[var(--radius-md)]",
            "border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-medium)]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <div className="border-b border-[var(--color-border)] px-3 py-2">
            <p className="text-[var(--text-label-size)] font-medium text-[var(--color-foreground)]">
              Categories
            </p>
            <p className="text-[10px] text-[var(--color-muted-foreground)]">
              {open ? draftHelperCount : helperSelectedCount} of {taxonomyCategoryCount}{" "}
              categories selected
            </p>
          </div>
          <ul className="max-h-[280px] overflow-y-auto py-1">
            <li className="border-b border-[var(--color-border)]">
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-2",
                  "text-[var(--text-caption-size)] hover:bg-[var(--color-muted)]",
                )}
              >
                <input
                  type="checkbox"
                  checked={draftAllSelected}
                  onChange={toggleAllCategories}
                  className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />
                <span className="font-medium text-[var(--color-foreground)]">All categories</span>
              </label>
            </li>
            {categories.map((category) => {
              const checked = draftIds.includes(category.id);
              return (
                <li key={category.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-3 py-2",
                      "text-[var(--text-caption-size)] hover:bg-[var(--color-muted)]",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(category.id)}
                      className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                    />
                    <span
                      className={
                        checked
                          ? "text-[var(--color-foreground)]"
                          : "text-[var(--color-muted-foreground)]"
                      }
                    >
                      {category.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-start gap-2 border-t border-[var(--color-border)] px-3 py-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={cn("h-7 px-3", hasPendingChanges && "font-semibold")}
              onClick={handleApply}
            >
              Apply
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
