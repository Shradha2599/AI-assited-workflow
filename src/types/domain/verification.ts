export type VerificationStatus =
  | "submitted"
  | "ocr_processing"
  | "field_extraction"
  | "validation"
  | "risk_analysis"
  | "ai_reasoning"
  | "approved"
  | "pending_review"
  | "rejected";

export interface VerificationDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  url?: string;
}

export interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
  validated: boolean;
}

export interface VerificationResult {
  id: string;
  sellerId: string;
  status: VerificationStatus;
  confidenceScore: number;
  explanation: string;
  documents: VerificationDocument[];
  extractedFields: ExtractedField[];
  riskFlags: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: string;
  verificationId: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
}
