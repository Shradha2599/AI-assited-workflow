export type SellerStatus =
  | "prospect"
  | "onboarding"
  | "pending_verification"
  | "verified"
  | "rejected";

export interface Seller {
  id: string;
  name: string;
  category: string;
  status: SellerStatus;
  contactEmail: string;
  onboardedAt?: string;
}
