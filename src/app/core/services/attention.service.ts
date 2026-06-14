import { Injectable, inject } from '@angular/core';

import { MoodEntry } from '../models/mood-entry.model';
import { AppLanguageService } from './app-language.service';

export type AttentionLevel = 'none' | 'medium' | 'high';

export type PatientAttention = {
  needsAttention: boolean;
  level: AttentionLevel;
  reasons: string[];
};

@Injectable({
  providedIn: 'root'
})
export class AttentionService {
  private readonly appLanguageService = inject(AppLanguageService);

  calculatePatientAttention(entries: readonly MoodEntry[]): PatientAttention {
    const sortedEntries = [...entries].sort((first, second) => this.toMillis(second.createdAt) - this.toMillis(first.createdAt));
    const latestEntry = sortedEntries[0];
    const labels = this.appLanguageService.labels().attention;
    const reasons: string[] = [];

    if (latestEntry?.moodLevel === 1) {
      reasons.push(labels.latestMoodOne);
    }

    if (
      sortedEntries.length >= 2 &&
      sortedEntries.slice(0, 2).every((entry) => typeof entry.moodLevel === 'number' && entry.moodLevel <= 2)
    ) {
      reasons.push(labels.lastTwoLow);
    }

    if (reasons.length > 0) {
      return {
        needsAttention: true,
        level: 'high',
        reasons
      };
    }

    if (!latestEntry) {
      return {
        needsAttention: false,
        level: 'none',
        reasons: [labels.noCheckIns]
      };
    }

    const latestCheckInTime = this.toMillis(latestEntry.createdAt);

    if (latestCheckInTime > 0 && latestCheckInTime <= Date.now() - 7 * 24 * 60 * 60 * 1000) {
      return {
        needsAttention: true,
        level: 'medium',
        reasons: [labels.staleCheckIn]
      };
    }

    return {
      needsAttention: false,
      level: 'none',
      reasons: []
    };
  }

  private toMillis(value: unknown): number {
    if (value instanceof Date) {
      return value.getTime();
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Date.parse(value);

      return Number.isNaN(parsed) ? 0 : parsed;
    }

    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      const toDate = (value as { toDate?: unknown }).toDate;

      if (typeof toDate !== 'function') {
        return 0;
      }

      const date = toDate.call(value);

      return date instanceof Date ? date.getTime() : 0;
    }

    if (typeof value === 'object' && value !== null && 'seconds' in value) {
      const seconds = (value as { seconds?: unknown }).seconds;

      return typeof seconds === 'number' ? seconds * 1000 : 0;
    }

    return 0;
  }
}
