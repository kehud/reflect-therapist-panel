export interface MoodEntry {
  id: string;
  userId: string;
  moodLevel?: number;
  emotions: string[];
  influences: string[];
  journalNote?: string;
  createdAt?: unknown;
}
