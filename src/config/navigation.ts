import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  LayoutDashboard,
  PackageSearch,
  Settings,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const mainNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Assortment Gap",
    href: "/assortment/gap",
    icon: PackageSearch,
  },
  {
    label: "Assortment Plan",
    href: "/assortment/plan",
    icon: Store,
  },
  {
    label: "Calendar",
    href: "/assortment/plan",
    icon: Calendar,
  },
  {
    label: "Seller Onboarding",
    href: "/sellers/onboarding",
    icon: Users,
    disabled: true,
  },
  {
    label: "Seller Verification",
    href: "/sellers/verification",
    icon: ShieldCheck,
    disabled: true,
  },
];

export const secondaryNavigation: NavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    disabled: true,
  },
];

export const featureFlags = {
  sellerOnboarding: false,
  sellerVerification: false,
  admin: false,
  settings: false,
} as const;
