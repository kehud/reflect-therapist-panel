import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, Firestore, query, serverTimestamp, where } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

import { TherapistNote } from '../../models/therapist-note.model';
import { AuthService } from './auth.service';

type TherapistNoteDocument = Partial<TherapistNote> & Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class TherapistNotesService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);

  getPatientNotes(patientId: string): Observable<TherapistNote[]> {
    const notesRef = collection(this.firestore, 'therapistNotes');
    const patientNotesQuery = query(notesRef, where('patientId', '==', patientId));

    return collectionData(patientNotesQuery, { idField: 'id' }).pipe(
      map((notes) => this.sortByNewest((notes as TherapistNoteDocument[]).map((note) => this.toTherapistNote(note))))
    );
  }

  async createNote(patientId: string, noteText: string): Promise<void> {
    const note = noteText.trim();

    if (!note) {
      throw new Error('Cannot create an empty therapist note.');
    }

    const therapist = this.authService.currentAppUser();
    const firebaseUser = this.authService.currentFirebaseUser();

    if (!therapist || !firebaseUser || !this.authService.isTherapistOrAdmin()) {
      throw new Error('Only authenticated therapists or admins can create notes.');
    }

    await addDoc(collection(this.firestore, 'therapistNotes'), {
      patientId,
      therapistId: firebaseUser.uid,
      therapistName: therapist.displayName ?? therapist.email ?? firebaseUser.displayName ?? firebaseUser.email ?? 'Therapist',
      note,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  private toTherapistNote(data: TherapistNoteDocument): TherapistNote {
    return {
      id: this.readString(data['id']) ?? '',
      patientId: this.readString(data['patientId']) ?? '',
      therapistId: this.readString(data['therapistId']) ?? '',
      therapistName: this.readString(data['therapistName']) ?? '',
      note: this.readString(data['note']) ?? '',
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt']
    };
  }

  private sortByNewest(notes: TherapistNote[]): TherapistNote[] {
    return notes.sort((first, second) => this.toMillis(second.createdAt) - this.toMillis(first.createdAt));
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
