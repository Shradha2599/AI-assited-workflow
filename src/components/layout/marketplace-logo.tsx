import { SvgIcon } from "@/components/ui/svg-icon";

export function MarketplaceLogo() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <SvgIcon name="logo" size={32} alt="Target Plus" />
      <span className="text-[var(--text-section-size)] font-bold text-[var(--color-foreground)]">
        Marketplace
      </span>
    </div>
  );
}
