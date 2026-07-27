export function subtaskRejectionKey(partnerId: string, taskApproveId: string): string {
  return `${partnerId}:${taskApproveId}`;
}

export interface SubtaskRejectionRecord {
  reason: string;
  rejectedAt: string;
  /** Submission generation at time of reject; cleared when generation increases. */
  submissionGeneration: number;
}
