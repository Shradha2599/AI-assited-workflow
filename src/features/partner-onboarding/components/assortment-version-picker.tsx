"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";

import { TruncatedText } from "@/components/ui/truncated-text";
import type { AssortmentVersion } from "@/lib/mock-data/assortment-curation-content";
import { cn } from "@/lib/utils";

export function AssortmentVersionPicker({
  versions,
  activeVersionId,
  onSelect,
  onCreate,
}: {
  versions: AssortmentVersion[];
  activeVersionId: string | null;
  onSelect: (versionId: string) => void;
  onCreate: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const active = versions.find((v) => v.id === activeVersionId) ?? versions[0];

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  function handleCreate() {
    const name = newName.trim() || `Version ${versions.length + 1}`;
    onCreate(name);
    setNewName("");
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        {active?.name ?? "Version 1"}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-medium)]">
          <ul className="max-h-48 overflow-y-auto py-1">
            {versions.map((version) => (
              <li
                key={version.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[var(--text-caption-size)] hover:bg-[var(--color-muted)]",
                  version.id === activeVersionId &&
                    "bg-[var(--color-primary)]/8 font-medium text-[var(--color-primary)]",
                )}
                onClick={() => {
                  onSelect(version.id);
                  setOpen(false);
                }}
              >
                <TruncatedText text={version.name} className="min-w-0 flex-1" />
                {version.id === activeVersionId && (
                  <Check className="h-3 w-3 shrink-0 text-[var(--color-primary)]" />
                )}
              </li>
            ))}
          </ul>

          <div className="h-px bg-[var(--color-border)]" />

          <div className="p-2">
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              New version
            </p>
            <div className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder={`Version ${versions.length + 1}`}
                className="h-7 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-[var(--text-caption-size)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCreate}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                aria-label="Create version"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
