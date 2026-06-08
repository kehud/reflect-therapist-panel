export interface TherapistNote {
  id: string;
  patientId: string;
  therapistId: string;
  therapistName: string;
  note: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}
