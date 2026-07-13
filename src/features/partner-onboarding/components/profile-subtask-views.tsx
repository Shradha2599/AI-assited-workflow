"use client";

import { useState } from "react";

import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import {
  getProfileSubTaskContent,
  type BusinessIdentityContent,
  type FulfilmentContent,
  type GuestServicesContent,
  type MarketplaceUserRow,
  type PrivacyPolicyContent,
  type ReturnsContent,
} from "@/lib/mock-data/profile-subtask-content";
import {
  CarrierReadOnlyList,
  DateChip,
  PillTabs,
  SectionDivider,
  SectionHeading,
  TablePagination,
  UnderlinedField,
  CheckedTermsRow,
} from "./profile-review-shared";

function BusinessIdentityView({ data }: { data: BusinessIdentityContent }) {
  return (
    <>
      <section>
        <SectionHeading>Business identity</SectionHeading>
        <UnderlinedField label="Legal business name" value={data.legalBusinessName} />
        <UnderlinedField label="Business structure" value={data.businessStructure} />
        <UnderlinedField label="Tax ID" value={data.taxId} />
        <UnderlinedField label="Diversity information" value={data.diversityInformation} />
        <UnderlinedField label="Other marketplace presence" value={data.otherMarketplacePresence} />
      </section>
      <SectionDivider />
      <section>
        <SectionHeading>Business address</SectionHeading>
        <UnderlinedField label="Address line 1" value={data.addressLine1} />
        <UnderlinedField label="City" value={data.city} />
        <UnderlinedField label="State" value={data.state} />
        <UnderlinedField label="Postal code" value={data.postalCode} />
        <UnderlinedField label="Country code" value={data.countryCode} />
      </section>
    </>
  );
}

function UserTable({
  rows,
  showRole,
}: {
  rows: MarketplaceUserRow[];
  showRole?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            <th className="py-3 pr-4 font-medium">Name</th>
            <th className="py-3 pr-4 font-medium">Email</th>
            <th className="py-3 pr-4 font-medium">Phone number</th>
            {showRole && <th className="py-3 font-medium">Role/responsibility</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.email} className="border-b border-[var(--color-border)]">
              <td className="py-4 pr-4 text-[var(--text-body-size)] font-medium text-[var(--color-foreground)]">
                {row.name}
              </td>
              <td className="py-4 pr-4 text-[var(--text-body-size)] text-[var(--color-foreground)]">
                {row.email}
              </td>
              <td className="py-4 pr-4 text-[var(--text-body-size)] text-[var(--color-foreground)]">
                {row.phone}
              </td>
              {showRole && (
                <td className="py-4 text-[var(--text-body-size)] text-[var(--color-foreground)]">
                  {row.role ?? "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarketplaceUsersView({
  admins,
  users,
}: {
  admins: MarketplaceUserRow[];
  users: MarketplaceUserRow[];
}) {
  return (
    <>
      <section>
        <SectionHeading>Admins</SectionHeading>
        <UserTable rows={admins} />
        <TablePagination showing={admins.length} total={admins.length} />
      </section>
      <SectionDivider />
      <section>
        <SectionHeading>Users</SectionHeading>
        <UserTable rows={users} showRole />
        <TablePagination showing={users.length} total={users.length} />
      </section>
    </>
  );
}

type FulfilmentTab = "warehouse" | "operational" | "carriers";

function FulfilmentWarehouseView({ data }: { data: FulfilmentContent }) {
  return (
    <>
      <section>
        <SectionHeading>Primary contact</SectionHeading>
        <UnderlinedField label="Primary contact" value={data.primaryContact} />
      </section>
      <SectionDivider />
      <section>
        <SectionHeading>Warehouse contact</SectionHeading>
        <UnderlinedField label="Name" value={data.warehouseContactName} />
        <UnderlinedField label="Email" value={data.warehouseContactEmail} />
        <UnderlinedField label="Phone" value={data.warehouseContactPhone} />
      </section>
      <SectionDivider />
      <section>
        <SectionHeading>Warehouse address</SectionHeading>
        <UnderlinedField label="Address line 1" value={data.warehouseAddressLine1} />
        <UnderlinedField label="City" value={data.warehouseCity} />
        <UnderlinedField label="State" value={data.warehouseState} />
        <UnderlinedField label="Postal code" value={data.warehousePostalCode} />
        <UnderlinedField label="Country code" value={data.warehouseCountryCode} />
      </section>
    </>
  );
}

function FulfilmentOperationalView({ data }: { data: FulfilmentContent }) {
  return (
    <>
      <section>
        <SectionHeading>Weekly days of operation</SectionHeading>
        <UnderlinedField label="Days of operation" value={data.daysOfOperation} />
        <div className="grid gap-0 sm:grid-cols-2">
          <UnderlinedField label="Opening time" value={data.openingTime} />
          <UnderlinedField label="Closing time" value={data.closingTime} />
        </div>
        <UnderlinedField label="Site cutoff time" value={data.siteCutoffTime} />
      </section>
      <SectionDivider />
      <section>
        <SectionHeading>Closed dates</SectionHeading>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.closedDates.map((date) => (
            <DateChip key={date} label={date} />
          ))}
        </div>
      </section>
      <SectionDivider />
      <section>
        <SectionHeading>Other settings</SectionHeading>
        <UnderlinedField label="Order capacity per day" value={data.orderCapacityPerDay} />
        <UnderlinedField label="Building lead time" value={data.buildingLeadTime} />
        <UnderlinedField label="Rollover" value={data.rollover} />
        <UnderlinedField label="Maximum rollover" value={data.maximumRollover} />
      </section>
    </>
  );
}

function FulfilmentCarriersView({ data }: { data: FulfilmentContent }) {
  return (
    <section>
      <SectionHeading>Carrier selection</SectionHeading>
      <p className="mt-4 text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
        Carrier<span className="text-[var(--color-error)]">*</span>
      </p>
      <CarrierReadOnlyList carriers={data.carriers} />
    </section>
  );
}

function FulfilmentView({ data }: { data: FulfilmentContent }) {
  const [tab, setTab] = useState<FulfilmentTab>("warehouse");
  const tabs: { id: FulfilmentTab; label: string }[] = [
    { id: "warehouse", label: "Warehouse contact & address" },
    { id: "operational", label: "Operational settings" },
    { id: "carriers", label: "Carrier selection" },
  ];

  return (
    <>
      <div className="mb-8">
        <PillTabs tabs={tabs} active={tab} onChange={setTab} />
      </div>
      {tab === "warehouse" && <FulfilmentWarehouseView data={data} />}
      {tab === "operational" && <FulfilmentOperationalView data={data} />}
      {tab === "carriers" && <FulfilmentCarriersView data={data} />}
    </>
  );
}

function ReturnsView({ data }: { data: ReturnsContent }) {
  return (
    <>
      <section>
        <SectionHeading>Return policy</SectionHeading>
        <UnderlinedField label="Policy type" value={data.policyType} />
      </section>
      <SectionDivider />
      <section>
        <SectionHeading>Return address</SectionHeading>
        <UnderlinedField label="Address line 1" value={data.addressLine1} />
        <UnderlinedField label="City" value={data.city} />
        <UnderlinedField label="State" value={data.state} />
        <UnderlinedField label="Postal code" value={data.postalCode} />
        <UnderlinedField label="Country code" value={data.countryCode} />
      </section>
    </>
  );
}

function PrivacyPolicyView({ data }: { data: PrivacyPolicyContent }) {
  return (
    <>
      <section>
        <SectionHeading>Privacy policy</SectionHeading>
        <div className="mt-4 space-y-4 text-[var(--text-body-size)] leading-relaxed text-[var(--color-foreground)]">
          {data.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>
      {data.accepted && <CheckedTermsRow />}
    </>
  );
}

function GuestServicesView({ data }: { data: GuestServicesContent }) {
  return (
    <>
      <section>
        <SectionHeading>Guest service</SectionHeading>
        <UnderlinedField label="Email" value={data.guestServiceEmail} />
        <UnderlinedField label="Phone" value={data.guestServicePhone} />
      </section>
      <SectionDivider />
      <section>
        <SectionHeading>Reverse logistics</SectionHeading>
        <UnderlinedField label="Email" value={data.reverseLogisticsEmail} />
        <UnderlinedField label="Phone" value={data.reverseLogisticsPhone} />
      </section>
    </>
  );
}

export function ProfileSubTaskContentView({
  partner,
  taskTitle,
}: {
  partner: PotentialPartner;
  taskTitle: string;
}) {
  const content = getProfileSubTaskContent(partner, taskTitle);
  if (!content) return null;

  switch (content.type) {
    case "business-identity":
      return <BusinessIdentityView data={content.data} />;
    case "marketplace-users":
      return <MarketplaceUsersView admins={content.data.admins} users={content.data.users} />;
    case "fulfilment":
      return <FulfilmentView data={content.data} />;
    case "returns":
      return <ReturnsView data={content.data} />;
    case "privacy":
      return <PrivacyPolicyView data={content.data} />;
    case "guest-services":
      return <GuestServicesView data={content.data} />;
    default:
      return null;
  }
}
