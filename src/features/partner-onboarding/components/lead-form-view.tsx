"use client";

import { ExternalLink, FileSpreadsheet, FileText } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLeadFormAnalysis } from "@/lib/mock-data/lead-form-analysis";
import type { LeadFormData } from "@/lib/mock-data/lead-forms";
import type { PotentialPartner } from "@/lib/mock-data/potential-partners";
import { EvaluationAnalysisDrawer } from "./evaluation-analysis-drawer";
import { PartnerProfileHeader } from "./partner-profile-header";
import { usePartnerReviewStore } from "../store/partner-review-store";

interface LeadFormViewProps {
  partner: PotentialPartner;
  form: LeadFormData;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-0.5 text-[var(--text-caption-size)] font-medium text-[var(--color-foreground)]">
        {value}
      </p>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--color-border)] px-6 py-5 last:border-0">
      <h3 className="mb-4 text-[var(--text-body-size)] font-semibold">{title}</h3>
      {children}
    </section>
  );
}

export function LeadFormView({ partner, form }: LeadFormViewProps) {
  const setActivePartner = usePartnerReviewStore((s) => s.setActivePartner);
  const analysis = getLeadFormAnalysis(partner.id);

  useEffect(() => {
    setActivePartner(partner.id);
  }, [partner.id, setActivePartner]);

  const isRejected = partner.status === "Rejected";
  const isFutureInterest = partner.status === "Future Interest";
  const isReadOnly = isRejected || isFutureInterest;

  return (
    <div className="space-y-[var(--space-4)]">
      <PartnerProfileHeader partner={partner} />

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between bg-[#c5221f] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <div>
              <p className="text-[var(--text-body-size)] font-semibold">Lead form</p>
              <p className="text-[var(--text-caption-size)] text-white/80">
                Submitted business information
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[var(--text-label-size)] font-medium">
            Read Only
          </span>
        </div>

        <FormSection title="Business Identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Employer Identification Number" value={form.businessIdentity.ein} />
            <ReadOnlyField label="DUNS number" value={form.businessIdentity.duns} />
            <ReadOnlyField label="Business name" value={form.businessIdentity.businessName} />
            <ReadOnlyField label="Business website" value={form.businessIdentity.website} />
            <ReadOnlyField label="Business type" value={form.businessIdentity.businessType} />
          </div>
        </FormSection>

        <FormSection title="Business Address">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Address line 1" value={form.businessAddress.line1} />
            <ReadOnlyField label="City" value={form.businessAddress.city} />
            <ReadOnlyField label="State" value={form.businessAddress.state} />
            <ReadOnlyField label="Zip code" value={form.businessAddress.zip} />
          </div>
        </FormSection>

        <FormSection title="Point of Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Name" value={form.pointOfContact.name} />
            <ReadOnlyField label="Email" value={form.pointOfContact.email} />
            <ReadOnlyField label="Phone number" value={form.pointOfContact.phone} />
          </div>
        </FormSection>

        <FormSection title="Integration Partner and Marketplace Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Current channel partner" value={form.integration.channelPartner} />
            <ReadOnlyField
              label="How did you hear about Target Plus?"
              value={form.integration.referralSource}
            />
          </div>
        </FormSection>

        <FormSection title="Assortment">
          <p className="mb-3 text-[var(--text-caption-size)] text-[var(--color-muted-foreground)]">
            Uploaded assortment file with SKU details, pricing, and category mapping.
          </p>
          <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-[var(--text-caption-size)] font-medium">{form.assortmentFile.name}</p>
              <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                {form.assortmentFile.size}
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection title="W9 Form">
          <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3">
            <FileText className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-[var(--text-caption-size)] font-medium">{form.w9File.name}</p>
              <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                {form.w9File.size}
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection title="Linked Profiles">
          <div className="space-y-3">
            {form.linkedProfiles.map((profile) => (
              <div
                key={profile.platform}
                className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-muted)] px-4 py-3"
              >
                <div>
                  <p className="text-[var(--text-caption-size)] font-medium">{profile.platform}</p>
                  <p className="text-[var(--text-label-size)] text-[var(--color-muted-foreground)]">
                    Connect your business&apos;s {profile.platform} account
                  </p>
                </div>
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[var(--text-caption-size)] text-[var(--color-primary)] hover:underline"
                >
                  {profile.url.replace(/^https?:\/\//, "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </FormSection>

        <div className="border-t border-[var(--color-border)] px-6 py-5">
          <label className="flex items-start gap-2 text-[var(--text-caption-size)]">
            <input type="checkbox" checked={form.contractAccepted} readOnly className="mt-0.5" />
            <span>
              By checking this box, I have reviewed and accepted{" "}
              <button type="button" className="text-[var(--color-primary)] hover:underline">
                Contract terms
              </button>
              .
            </span>
          </label>
          {!isReadOnly && (
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm">
                Reject
              </Button>
              <Button variant="outline" size="sm">
                Future Interest
              </Button>
              <Button size="sm">Accept</Button>
            </div>
          )}
        </div>
      </Card>

      {analysis && <EvaluationAnalysisDrawer partner={partner} analysis={analysis} />}
    </div>
  );
}
