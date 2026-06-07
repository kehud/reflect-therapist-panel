import { Injectable } from '@angular/core';

import { MoodEntry } from '../../models/mood-entry.model';

@Injectable({
  providedIn: 'root'
})
export class MoodEntriesService {
  listForUser(_userId: string): MoodEntry[] {
    // TODO: Read mood entries from the existing moodEntries collection.
    return [];
  }
}
