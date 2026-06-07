export interface MoodEntry {
  id: string;
  userId: string;
  mood?: number | string;
  note?: string;
  createdAt?: unknown;
}
