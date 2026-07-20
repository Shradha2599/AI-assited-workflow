"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

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
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  /** All Target taxonomy category ids (21) — used for “All categories”. */
  allTaxonomyIds: string[];
  taxonomyCategoryCount: number;
  /** Treemap-backed ids — at least one must stay selected; used when unchecking “All”. */
  treemapCategoryIds?: string[];
  treemapTileCount?: number;
  className?: string;
  align?: "start" | "end";
}

export function CategoryMultiSelectFilter({
  categories,
  selectedIds,
  onChange,
  allTaxonomyIds,
  taxonomyCategoryCount,
  treemapCategoryIds = [],
  treemapTileCount,
  className,
  align = "start",
}: CategoryMultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const allCategoriesSelected =
    allTaxonomyIds.length > 0 &&
    allTaxonomyIds.every((id) =>
      categories.some(
        (category) => category.taxonomyId === id && selectedIds.includes(category.id),
      ),
    );

  const helperSelectedCount = allCategoriesSelected
    ? taxonomyCategoryCount
    : selectedIds.length;

  const triggerLabel = allCategoriesSelected
    ? "All categories"
    : `Categories (${treemapTileCount ?? selectedIds.length})`;

  function countSelectedTreemapIds(ids: string[]) {
    return treemapCategoryIds.filter((id) => ids.includes(id)).length;
  }

  function toggleCategory(categoryId: string, hasGapData?: boolean) {
    if (selectedIds.includes(categoryId)) {
      const nextIds = selectedIds.filter((id) => id !== categoryId);
      if (hasGapData && countSelectedTreemapIds(nextIds) === 0) return;
      if (nextIds.length === 0) return;
      onChange(nextIds);
      return;
    }
    onChange([...selectedIds, categoryId]);
  }

  function selectAllTaxonomyCategories() {
    const ids = categories
      .filter(
        (category) => category.taxonomyId && allTaxonomyIds.includes(category.taxonomyId),
      )
      .map((category) => category.id);
    onChange(ids);
  }

  function toggleAllCategories() {
    if (allCategoriesSelected) {
      onChange(treemapCategoryIds.length > 0 ? [...treemapCategoryIds] : []);
      return;
    }
    selectAllTaxonomyCategories();
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
            "border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-[var(--shadow-medium)]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <div className="border-b border-[var(--color-border)] px-3 py-2">
            <p className="text-[var(--text-label-size)] font-medium text-[var(--color-foreground)]">
              Categories
            </p>
            <p className="text-[10px] text-[var(--color-muted-foreground)]">
              {helperSelectedCount} of {taxonomyCategoryCount} categories selected
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
                  checked={allCategoriesSelected}
                  onChange={toggleAllCategories}
                  className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />
                <span className="font-medium text-[var(--color-foreground)]">All categories</span>
              </label>
            </li>
            {categories.map((category) => {
              const checked = selectedIds.includes(category.id);
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
                      onChange={() => toggleCategory(category.id, category.hasGapData)}
                      className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                    />
                    <span className={checked ? "text-[var(--color-foreground)]" : "text-[var(--color-muted-foreground)]"}>
                      {category.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
