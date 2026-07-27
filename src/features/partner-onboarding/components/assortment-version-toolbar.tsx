"use client";

import Image from "next/image";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusTag, markerToneClass } from "@/components/ui/status-tag";
import type { AssortmentVersion } from "@/lib/mock-data/assortment-curation-content";
import { cn } from "@/lib/utils";

import { AssortmentVersionPicker } from "./assortment-version-picker";

export function VersionStatusBadge({ status }: { status: AssortmentVersion["status"] }) {
  const labels: Record<AssortmentVersion["status"], string> = {
    draft: "Draft",
    shared: "Shared with seller",
    seller_review: "Seller reviewing",
    approved: "Seller approved",
  };
  const styles: Record<AssortmentVersion["status"], string> = {
    draft: markerToneClass.muted,
    shared: markerToneClass.info,
    seller_review: markerToneClass.review,
    approved: markerToneClass.success,
  };
  return (
    <StatusTag className={cn("font-normal", styles[status])}>{labels[status]}</StatusTag>
  );
}

interface AssortmentVersionToolbarProps {
  versions: AssortmentVersion[];
  activeVersionId: string | null;
  onSelectVersion: (versionId: string) => void;
  onCreateVersion: (name: string) => void;
  onShare?: () => void;
  shareDisabled?: boolean;
  showShare?: boolean;
  showDownload?: boolean;
  tmApprove?: {
    approved: boolean;
    onApprove: () => void;
    onReject: () => void;
    sellerApproved: boolean;
  };
}

export function AssortmentVersionToolbar({
  versions,
  activeVersionId,
  onSelectVersion,
  onCreateVersion,
  onShare,
  shareDisabled,
  showShare = true,
  showDownload = true,
  tmApprove,
}: AssortmentVersionToolbarProps) {
  const activeVersion = versions.find((v) => v.id === activeVersionId) ?? versions[0];
  const tmActionsDisabled =
    !tmApprove || tmApprove.approved || !tmApprove.sellerApproved;
  const showTmActions = tmApprove && !tmApprove.approved;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <AssortmentVersionPicker
          versions={versions}
          activeVersionId={activeVersionId}
          onSelect={onSelectVersion}
          onCreate={onCreateVersion}
        />
        {activeVersion ? <VersionStatusBadge status={activeVersion.status} /> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {showTmActions ? (
          <>
            <Button
              size="sm"
              onClick={tmApprove.onApprove}
              disabled={tmActionsDisabled}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={tmApprove.onReject}
              disabled={tmActionsDisabled}
            >
              Reject
            </Button>
          </>
        ) : null}
        {showShare && onShare ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={onShare}
            disabled={shareDisabled}
          >
            <Send className="h-3.5 w-3.5" />
            Share with seller
          </Button>
        ) : null}
        {showDownload ? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Image src="/icons/download.svg" alt="" width={14} height={14} aria-hidden />
            Download
          </Button>
        ) : null}
      </div>
    </div>
  );
}
