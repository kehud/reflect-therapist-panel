import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore, query, where } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

import { MoodEntry } from '../../models/mood-entry.model';

type MoodEntryDocument = Partial<MoodEntry> & Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class MoodEntriesService {
  private readonly firestore = inject(Firestore);

  listAll(): Observable<MoodEntry[]> {
    const entriesRef = collection(this.firestore, 'moodEntries');

    return collectionData(entriesRef, { idField: 'id' }).pipe(
      map((entries) => this.sortByNewest((entries as MoodEntryDocument[]).map((entry) => this.toMoodEntry(entry))))
    );
  }

  listForUser(userId: string): Observable<MoodEntry[]> {
    const entriesRef = collection(this.firestore, 'moodEntries');
    const entriesQuery = query(entriesRef, where('userId', '==', userId));

    return collectionData(entriesQuery, { idField: 'id' }).pipe(
      map((entries) => this.sortByNewest((entries as MoodEntryDocument[]).map((entry) => this.toMoodEntry(entry))))
    );
  }

  private toMoodEntry(data: MoodEntryDocument): MoodEntry {
    return {
      id: this.readString(data['id']) ?? '',
      userId: this.readString(data['userId']) ?? '',
      moodLevel: this.readMoodLevel(data['moodLevel']),
      emotions: this.readStringArray(data['emotions']),
      influences: this.readStringArray(data['influences']),
      journalNote: this.readString(data['journalNote']),
      createdAt: data['createdAt']
    };
  }

  private sortByNewest(entries: MoodEntry[]): MoodEntry[] {
    return entries.sort((first, second) => this.toMillis(second.createdAt) - this.toMillis(first.createdAt));
  }

  private readMoodLevel(value: unknown): number | undefined {
    if (typeof value === 'number') {
      return value;
    }

    return undefined;
  }

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  private readString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
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
