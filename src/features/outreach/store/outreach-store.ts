import { create } from "zustand";

import {
  generateOutreachDraft,
  getOutreachPartnerContext,
  getSellerOutreachContext,
  outreachReminderPartners,
  type EmailDraft,
  type OutreachMailType,
  type OutreachPartnerContext,
} from "@/lib/mock-data/outreach-mail";
import { useDiscoveryStore } from "@/features/lead-discovery/store/discovery-store";
import { useToastStore } from "@/stores/toast-store";

interface OpenDrawerOptions {
  mailType: OutreachMailType;
  partnerId?: string;
  sellerId?: string;
  sellerName?: string;
  sellerWebsite?: string;
  multiPartner?: boolean;
}

interface OutreachStore {
  drawerOpen: boolean;
  mailType: OutreachMailType;
  multiPartner: boolean;
  partners: OutreachPartnerContext[];
  selectedPartnerId: string | null;
  /** Seller id when outreach is opened from lead discovery */
  activeSellerId: string | null;
  draft: EmailDraft | null;
  isGenerating: boolean;

  openDrawer: (opts: OpenDrawerOptions) => void;
  closeDrawer: () => void;
  selectPartner: (partnerId: string) => void;
  generateDraft: () => Promise<void>;
  updateDraft: (patch: Partial<EmailDraft>) => void;
  sendMail: () => void;
}

export const useOutreachStore = create<OutreachStore>((set, get) => ({
  drawerOpen: false,
  mailType: "document_reminder",
  multiPartner: false,
  partners: [],
  selectedPartnerId: null,
  activeSellerId: null,
  draft: null,
  isGenerating: false,

  openDrawer: (opts) => {
    const multiPartner = opts.multiPartner ?? opts.mailType === "document_reminder";
    let partners: OutreachPartnerContext[] = [];
    let selectedPartnerId: string | null = opts.partnerId ?? null;

    if (multiPartner) {
      partners = outreachReminderPartners;
      selectedPartnerId = opts.partnerId ?? null;
    } else if (opts.partnerId) {
      const ctx = getOutreachPartnerContext(opts.partnerId);
      if (ctx) {
        partners = [ctx];
        selectedPartnerId = opts.partnerId;
      }
    } else if (opts.sellerId && opts.sellerName && opts.sellerWebsite) {
      const ctx = getSellerOutreachContext(opts.sellerId, opts.sellerName, opts.sellerWebsite);
      partners = [ctx];
      selectedPartnerId = ctx.partnerId;
    }

    set({
      drawerOpen: true,
      mailType: opts.mailType,
      multiPartner,
      partners,
      selectedPartnerId,
      activeSellerId: opts.sellerId ?? null,
      draft: null,
      isGenerating: false,
    });
  },

  closeDrawer: () =>
    set({
      drawerOpen: false,
      draft: null,
      isGenerating: false,
      selectedPartnerId: null,
      activeSellerId: null,
      partners: [],
    }),

  selectPartner: (partnerId) =>
    set({
      selectedPartnerId: partnerId,
      draft: null,
    }),

  generateDraft: async () => {
    const { selectedPartnerId, partners, mailType } = get();
    const context =
      (selectedPartnerId ? partners.find((p) => p.partnerId === selectedPartnerId) : undefined) ??
      partners[0];
    if (!context) return;

    set({ isGenerating: true, draft: null });
    await new Promise((r) => setTimeout(r, 900));
    const draft = generateOutreachDraft(mailType, context);
    set({ draft, isGenerating: false, selectedPartnerId: context.partnerId || selectedPartnerId });
  },

  updateDraft: (patch) =>
    set((s) => ({
      draft: s.draft ? { ...s.draft, ...patch } : null,
    })),

  sendMail: () => {
    const { draft, mailType, activeSellerId } = get();
    if (mailType === "acquisition_outreach" && activeSellerId) {
      useDiscoveryStore.getState().shortlistSeller(activeSellerId);
    }
    get().closeDrawer();
    useToastStore.getState().showToast({
      title: "Mail sent",
      description: draft
        ? `Your email to ${draft.to} has been sent via Outlook.`
        : "Your email has been sent via Outlook.",
    });
  },
}));
