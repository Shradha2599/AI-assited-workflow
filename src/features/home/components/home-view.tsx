"use client";

import { PageHeader } from "@/components/layout/page-header";

export function HomeView() {
  return (
    <PageHeader
      title="Marketplace Home"
      breadcrumbs={[{ label: "Home" }]}
    />
  );
}
