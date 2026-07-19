import { create } from "zustand";

import {
  buildAnalysisSourceForVersion,
  buildVersionFromSellerBaseline,
  getAssortmentCurationContent,
  type AssortmentCurationContent,
  type AssortmentVersion,
} from "@/lib/mock-data/assortment-curation-content";

interface AssortmentCurationStore {
  partnerId: string | null;
  content: AssortmentCurationContent | null;
  activeVersionId: string | null;
  analysisSourceId: string | null;

  initForPartner: (partnerId: string) => void;
  setActiveVersion: (versionId: string) => void;
  createVersion: (name: string) => AssortmentVersion | null;
  shareVersion: (versionId: string) => void;
  removeSkuFromVersion: (versionId: string, partnerSku: string) => void;
  setAnalysisSource: (sourceId: string) => void;
}

export const useAssortmentCurationStore = create<AssortmentCurationStore>((set, get) => ({
  partnerId: null,
  content: null,
  activeVersionId: null,
  analysisSourceId: null,

  initForPartner: (partnerId) => {
    const content = getAssortmentCurationContent(partnerId);
    const defaultVersion = content.versions.find((v) => v.status === "draft") ?? content.versions[0];
    set({
      partnerId,
      content,
      activeVersionId: defaultVersion?.id ?? null,
      analysisSourceId: content.analysisSources[0]?.id ?? null,
    });
  },

  setActiveVersion: (versionId) => set({ activeVersionId: versionId }),

  createVersion: (name) => {
    const { content } = get();
    if (!content) return null;

    const nextNum = content.versions.length + 1;
    const newVersion = buildVersionFromSellerBaseline(content, nextNum, name);
    const newAnalysisSource = buildAnalysisSourceForVersion(content, newVersion);
    const updatedContent: AssortmentCurationContent = {
      ...content,
      versions: [...content.versions, newVersion],
      analysisSources: [...content.analysisSources, newAnalysisSource],
    };

    set({
      content: updatedContent,
      activeVersionId: newVersion.id,
    });

    return newVersion;
  },

  shareVersion: (versionId) => {
    const { content } = get();
    if (!content) return;

    const updatedVersions = content.versions.map((v) =>
      v.id === versionId
        ? {
            ...v,
            status: "shared" as const,
            sharedAt: new Date().toISOString(),
          }
        : v,
    );

    set({
      content: { ...content, versions: updatedVersions },
    });
  },

  removeSkuFromVersion: (versionId, partnerSku) => {
    const { content } = get();
    if (!content) return;

    const updatedVersions = content.versions.map((version) => {
      if (version.id !== versionId) return version;

      const includedSkuIds = version.includedSkuIds.filter((id) => id !== partnerSku);
      const aiAddedSkuIds = version.aiAddedSkuIds.filter((id) => id !== partnerSku);
      const removedSkuIds = version.removedSkuIds.filter((id) => id !== partnerSku);
      const excludedSkuIds = [...new Set([...(version.excludedSkuIds ?? []), partnerSku])];

      return {
        ...version,
        includedSkuIds,
        aiAddedSkuIds,
        removedSkuIds,
        excludedSkuIds,
        recommendedCount: includedSkuIds.length,
      };
    });

    set({
      content: { ...content, versions: updatedVersions },
    });
  },

  setAnalysisSource: (sourceId) => set({ analysisSourceId: sourceId }),
}));
