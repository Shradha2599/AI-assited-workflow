export interface ChannelPartnerInfo {
  name: string;
  description: string;
  services: string[];
}

export interface IntegrationsContent {
  integrationType: "channel-partner" | "direct-integrator";
  channelPartner: ChannelPartnerInfo;
}

const ASCENDA: ChannelPartnerInfo = {
  name: "Ascenda",
  description:
    "Ascenda is a certified marketplace integration partner that connects seller systems for order routing, inventory sync, and fulfilment workflows. Partners using Ascenda benefit from pre-built connectors and dedicated onboarding support.",
  services: ["Onboarding", "Item listing", "Order management", "Shipping", "Returns"],
};

export function getIntegrationsContent(_sellerId: string): IntegrationsContent {
  return {
    integrationType: "channel-partner",
    channelPartner: ASCENDA,
  };
}
