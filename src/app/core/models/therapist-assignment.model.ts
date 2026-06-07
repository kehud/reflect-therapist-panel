export interface TherapistAssignment {
  id: string;
  patientId: string;
  therapistId: string;
  templateId?: string;
  note?: string;
  isActive?: boolean;
  createdAt?: unknown;
  createdBy?: string;
}
