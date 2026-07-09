"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getLeadFormAnalysis } from "@/lib/mock-data/lead-form-analysis";
import type { LeadFormData } from "@/lib/mock-data/lead-forms";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { EvaluationAnalysisDrawer } from "./evaluation-analysis-drawer";
import { useLeadDecision } from "../hooks/use-lead-decision";

interface LeadFormViewProps {
  partner: PotentialPartner;
  form: LeadFormData;
}

const FORM_HPAD = "px-[120px]";

const PRIMARY_ICON_FILTER =
  "brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1352%) hue-rotate(199deg) brightness(100%) contrast(95%)";

const WHITE_ICON_FILTER = "brightness(0) invert(1)";

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "/images/instagram.png",
  linkedin: "/images/linkedin.png",
  tiktok: "/images/tiktok.png",
};

function downloadBlob(filename: string, content: string | Blob, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadAssortmentTemplate() {
  const csv =
    "SKU,Product Name,Category,Price,Inventory\nSKU-001,Sample Product,Category A,29.99,100\n";
  downloadBlob("Assortment_Template.xlsx", csv, "application/vnd.ms-excel");
}

function downloadAssortmentFile(name: string) {
  const csv =
    "SKU,Product Name,Category,Price,Inventory\nSKU-101,Orange Inc Product A,Home,24.99,250\nSKU-102,Orange Inc Product B,Kitchen,39.99,180\n";
  downloadBlob(name, csv, "application/vnd.ms-excel");
}

function downloadW9File(name: string) {
  const pdfPlaceholder = `%PDF-1.4\n% Mock W9 document for ${name}\n`;
  downloadBlob(name, pdfPlaceholder, "application/pdf");
}

function SectionDivider() {
  return <div className="mx-[120px] border-b border-[var(--color-border)]" aria-hidden />;
}

function ReadOnlyMarker() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-0.5 text-[var(--text-caption-size)] font-semibold text-white"
      style={{ backgroundColor: "rgba(245, 245, 245, 0.15)" }}
    >
      <Image
        src="/icons/visibility.svg"
        alt=""
        width={14}
        height={14}
        className="shrink-0"
        style={{ filter: WHITE_ICON_FILTER }}
        aria-hidden
      />
      Read Only
    </span>
  );
}

function UnderlinedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--color-foreground)] py-4">
      <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-1 text-[var(--text-body-size)] font-medium text-[var(--color-foreground)]">
        {value}
      </p>
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("py-8", FORM_HPAD)}>
      <h3 className="mb-1 text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function FileAttachment({
  iconSrc,
  name,
  size,
  onDownload,
}: {
  iconSrc: string;
  name: string;
  size: string;
  onDownload: () => void;
}) {
  return (
    <div className="flex max-w-[240px] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
      <Image src={iconSrc} alt="" width={24} height={24} className="shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[var(--text-caption-size)] font-semibold text-[var(--color-foreground)]">
          {name}
        </p>
        <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">{size}</p>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="shrink-0 rounded-[var(--radius-sm)] p-1.5 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
        aria-label={`Download ${name}`}
      >
        <Image src="/icons/download.svg" alt="" width={16} height={16} aria-hidden />
      </button>
    </div>
  );
}

function LinkedProfileCard({ platform, url }: { platform: string; url: string }) {
  const iconSrc = PLATFORM_ICONS[platform.toLowerCase().replace(/\s+/g, "")];

  return (
    <div className="flex items-start gap-4 rounded-[var(--radius-md)] bg-[#f5f5f5] px-4 py-4">
      {iconSrc ? (
        <Image
          src={iconSrc}
          alt={platform}
          width={40}
          height={40}
          className="shrink-0 rounded-[var(--radius-sm)] object-contain"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-muted)] text-[var(--text-label-size)] font-semibold">
          {platform.slice(0, 2)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
          Connect your business&apos;s {platform.toLowerCase()} account
        </p>
        <p className="mt-2 border-b border-[var(--color-foreground)] pb-1.5 text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]">
          {url}
        </p>
      </div>
    </div>
  );
}

export function LeadFormView({ partner, form }: LeadFormViewProps) {
  const analysis = getLeadFormAnalysis(partner.id);
  const { accept, reject, markFutureInterest } = useLeadDecision(partner);
  const [contractAccepted, setContractAccepted] = useState(form.contractAccepted);

  useEffect(() => {
    setContractAccepted(form.contractAccepted);
  }, [form.contractAccepted]);

  const isRejected = partner.status === "Rejected";
  const isFutureInterest = partner.status === "Future Interest";
  const isOnboarding = partner.status === "Onboarding";
  const isReadOnly = isRejected || isFutureInterest || isOnboarding;

  return (
    <>
      <Card className="overflow-hidden border-[var(--color-border)] shadow-[var(--shadow-low)]">
        {/* Hero header */}
        <div
          className={cn(FORM_HPAD, "py-8 text-white")}
          style={{
            background:
              "linear-gradient(90deg, #AC0000 0%, var(--color-background-page-brand, #212121) 84%)",
          }}
        >
          <div className="flex items-end justify-between gap-6">
            <div className="flex items-end gap-5">
              <Image
                src="/icons/clipboard-hero.svg"
                alt=""
                width={64}
                height={64}
                className="shrink-0"
                aria-hidden
              />
              <div className="pb-0.5">
                <h2 className="text-[21px] font-semibold leading-tight">Lead form</h2>
                <p className="mt-1 text-[var(--text-caption-size)] text-white/80">
                  Provide your business related information.
                </p>
              </div>
            </div>
            <ReadOnlyMarker />
          </div>
        </div>

        <SectionDivider />

        <FormSection title="Business identity">
          <UnderlinedField
            label="Employer identification number"
            value={form.businessIdentity.ein}
          />
          <UnderlinedField label="DUNS number" value={form.businessIdentity.duns} />
          <UnderlinedField label="Business name" value={form.businessIdentity.businessName} />
          <UnderlinedField label="Business website" value={form.businessIdentity.website} />
          <UnderlinedField label="Business type" value={form.businessIdentity.businessType} />
        </FormSection>

        <SectionDivider />

        <FormSection title="Business address">
          <UnderlinedField label="Address line 1" value={form.businessAddress.line1} />
          <UnderlinedField label="City" value={form.businessAddress.city} />
          <UnderlinedField label="State" value={form.businessAddress.state} />
          <UnderlinedField label="ZIP" value={form.businessAddress.zip} />
        </FormSection>

        <SectionDivider />

        <FormSection title="Point of contact">
          <UnderlinedField label="Name" value={form.pointOfContact.name} />
          <UnderlinedField label="Email" value={form.pointOfContact.email} />
          <UnderlinedField label="Phone" value={form.pointOfContact.phone} />
        </FormSection>

        <SectionDivider />

        <FormSection title="Integration partner and marketplace details">
          <UnderlinedField
            label="Current channel partner"
            value={form.integration.channelPartner}
          />
          <UnderlinedField
            label="How did you hear about Target Plus?"
            value={form.integration.referralSource}
          />
        </FormSection>

        <SectionDivider />

        <section className={cn("py-8", FORM_HPAD)}>
          <p className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
            Share your assortment for review{" "}
            <span className="text-[var(--color-error)]">*</span>
          </p>
          <p className="mt-2 max-w-3xl text-[var(--text-caption-size)] leading-relaxed text-[var(--color-muted-foreground)]">
            Please provide an excel file with only the SKUs you plan to sell on Target Plus —
            specifically those that you can set up, have inventory for, and are ready to list within
            the onboarding timeline. Failure to comply might result in suspension of your account.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5"
            onClick={downloadAssortmentTemplate}
          >
            <Image
              src="/icons/download.svg"
              alt=""
              width={14}
              height={14}
              style={{ filter: PRIMARY_ICON_FILTER }}
              aria-hidden
            />
            Download template
          </Button>
          <p className="mt-6 text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]">
            Upload file
          </p>
          <div className="mt-2">
            <FileAttachment
              iconSrc="/icons/excel.svg"
              name={form.assortmentFile.name}
              size={form.assortmentFile.size}
              onDownload={() => downloadAssortmentFile(form.assortmentFile.name)}
            />
          </div>
        </section>

        <SectionDivider />

        <section className={cn("py-8", FORM_HPAD)}>
          <h3 className="text-[var(--text-body-size)] font-semibold text-[var(--color-foreground)]">
            W9 form
          </h3>
          <p className="mt-4 text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]">
            Signed W9 form<span className="text-[var(--color-error)]">*</span>
          </p>
          <p className="mt-2 max-w-3xl text-[var(--text-caption-size)] leading-relaxed text-[var(--color-muted-foreground)]">
            Upload a completed and signed W9 form. This can be an official tax documents used to
            verify a business&apos;s taxpayer identification details and federal EIN.
          </p>
          <div className="mt-4">
            <FileAttachment
              iconSrc="/icons/file-doc.svg"
              name={form.w9File.name}
              size={form.w9File.size}
              onDownload={() => downloadW9File(form.w9File.name)}
            />
          </div>
        </section>

        <SectionDivider />

        <FormSection title="Linked profiles">
          <div className="mt-4 space-y-3">
            {form.linkedProfiles.map((profile) => (
              <LinkedProfileCard
                key={profile.platform}
                platform={profile.platform}
                url={profile.url}
              />
            ))}
          </div>
        </FormSection>

        <SectionDivider />

        <div className={cn(FORM_HPAD, "py-8")}>
          <label className="flex cursor-pointer items-start gap-2.5 text-[var(--text-caption-size)] leading-relaxed text-[var(--color-foreground)]">
            <input
              type="checkbox"
              checked={contractAccepted}
              onChange={(e) => setContractAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
            />
            <span>
              By checking this box, I have reviewed and accepted{" "}
              <button
                type="button"
                className="font-medium text-[var(--color-primary)] hover:underline"
              >
                Contract terms
              </button>
              .
            </span>
          </label>

          {!isReadOnly && (
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm" onClick={reject}>
                Reject
              </Button>
              <Button variant="outline" size="sm" onClick={markFutureInterest}>
                Future Interest
              </Button>
              <Button size="sm" onClick={accept}>
                Accept
              </Button>
            </div>
          )}
        </div>
      </Card>

      {analysis && <EvaluationAnalysisDrawer partner={partner} analysis={analysis} />}
    </>
  );
}
