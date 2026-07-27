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

const sellerApprovalTimers = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleSellerApproval(versionId: string) {
  const existing = sellerApprovalTimers.get(versionId);
  if (existing) clearTimeout(existing);

  const delayMs = 30_000 + Math.floor(Math.random() * 30_000);
  const timer = setTimeout(() => {
    sellerApprovalTimers.delete(versionId);
    const { content } = useAssortmentCurationStore.getState();
    if (!content) return;

    const target = content.versions.find((v) => v.id === versionId);
    if (!target || target.status !== "shared") return;

    const updatedVersions = content.versions.map((v) =>
      v.id === versionId ? { ...v, status: "approved" as const } : v,
    );
    useAssortmentCurationStore.setState({
      content: { ...content, versions: updatedVersions },
    });
  }, delayMs);

  sellerApprovalTimers.set(versionId, timer);
}

export const useAssortmentCurationStore = create<AssortmentCurationStore>((set, get) => ({
  partnerId: null,
  content: null,
  activeVersionId: null,
  analysisSourceId: null,

  initForPartner: (partnerId) => {
    const content = getAssortmentCurationContent(partnerId);
    const defaultVersion = content.versions.find((v) => v.status === "draft") ?? content.versions[0];
    const versionId = defaultVersion?.id ?? null;
    set({
      partnerId,
      content,
      activeVersionId: versionId,
      analysisSourceId: versionId ? `version-${versionId}` : content.analysisSources[0]?.id ?? null,
    });
  },

  setActiveVersion: (versionId) =>
    set({
      activeVersionId: versionId,
      analysisSourceId: `version-${versionId}`,
    }),

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
      analysisSourceId: `version-${newVersion.id}`,
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

    scheduleSellerApproval(versionId);
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
        recommendedCount: Math.max(
          0,
          [...new Set([...includedSkuIds, ...removedSkuIds])].filter(
            (id) => !excludedSkuIds.includes(id),
          ).length,
        ),
      };
    });

    set({
      content: { ...content, versions: updatedVersions },
    });
  },

  setAnalysisSource: (sourceId) => set({ analysisSourceId: sourceId }),
}));
