export type AppUserRole = 'admin' | 'therapist' | 'patient';

export interface AppUser {
  id: string;
  displayName?: string;
  email?: string;
  role?: AppUserRole;
  createdAt?: unknown;
  updatedAt?: unknown;
}
