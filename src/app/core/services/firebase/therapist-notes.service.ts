import { Injectable } from '@angular/core';

import { TherapistNote } from '../../models/therapist-note.model';

@Injectable({
  providedIn: 'root'
})
export class TherapistNotesService {
  listForPatient(_patientId: string): TherapistNote[] {
    // TODO: Read notes from the future therapistNotes collection.
    return [];
  }

  createNote(_note: Omit<TherapistNote, 'id'>): Promise<void> {
    // TODO: Write a note to the future therapistNotes collection.
    return Promise.resolve();
  }
}
