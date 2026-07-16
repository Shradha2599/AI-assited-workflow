import { create } from "zustand";

import {
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
  createVersion: () => AssortmentVersion | null;
  shareVersion: (versionId: string) => void;
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

  createVersion: () => {
    const { content } = get();
    if (!content) return null;

    const nextNum = content.versions.length + 1;
    const newVersion = buildVersionFromSellerBaseline(content, nextNum);
    const updatedContent: AssortmentCurationContent = {
      ...content,
      versions: [...content.versions, newVersion],
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

  setAnalysisSource: (sourceId) => set({ analysisSourceId: sourceId }),
}));
