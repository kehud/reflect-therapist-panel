import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { AppUser } from '../../core/models/app-user.model';
import { MoodEntry } from '../../core/models/mood-entry.model';
import { MoodEntriesService } from '../../core/services/firebase/mood-entries.service';
import { UsersService } from '../../core/services/firebase/users.service';
import { APP_LABELS } from '../../shared/utils/app-labels';

type PatientRow = {
  id: string;
  name: string;
  email: string;
  latestMood: string;
  lastEntry: string;
  entryCount: string;
  status: string;
};

@Component({
  selector: 'app-patient-list-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="heading">
        <h2>{{ labels.pages.patientsTitle }}</h2>
        <p>{{ labels.patients.subtitle }}</p>
      </div>

      @if (errorMessage()) {
        <p class="message error" role="alert">{{ errorMessage() }}</p>
      }

      @if (loading()) {
        <p class="message">{{ labels.common.loading }}</p>
      } @else if (rows().length === 0) {
        <p class="message">{{ labels.patients.noPatients }}</p>
      } @else {
        <div class="table" role="table" aria-label="Patients">
          <div class="row header" role="row">
            <span role="columnheader">{{ labels.patients.patient }}</span>
            <span role="columnheader">{{ labels.patients.latestMood }}</span>
            <span role="columnheader">{{ labels.patients.lastEntry }}</span>
            <span role="columnheader">{{ labels.patients.entries }}</span>
            <span role="columnheader">{{ labels.patients.status }}</span>
          </div>

          @for (row of rows(); track row.id) {
            <a class="row" [routerLink]="['/patients', row.id]" role="row">
              <span class="patient" role="cell">
                <strong>{{ row.name }}</strong>
                <small>{{ row.email }}</small>
              </span>
              <span role="cell">{{ row.latestMood }}</span>
              <span role="cell">{{ row.lastEntry }}</span>
              <span role="cell">{{ row.entryCount }}</span>
              <span role="cell">{{ row.status }}</span>
            </a>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .page,
    .heading {
      display: grid;
      gap: 16px;
    }

    h2,
    p {
      margin: 0;
    }

    h2 {
      font-size: 2rem;
      letter-spacing: 0;
    }

    p,
    .row,
    small,
    .message {
      color: var(--muted);
    }

    .table {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
    }

    .row {
      display: grid;
      gap: 16px;
      grid-template-columns: 1.4fr 0.9fr 1fr 0.6fr 0.9fr;
      padding: 16px 18px;
    }

    .row + .row {
      border-top: 1px solid var(--line);
    }

    .row.header {
      background: var(--surface-muted);
      color: var(--text);
      font-weight: 700;
    }

    a.row:hover {
      background: color-mix(in srgb, var(--surface-muted) 72%, transparent);
    }

    .patient {
      display: grid;
      gap: 4px;
    }

    strong {
      color: var(--text);
    }

    .error {
      color: #8f2f24;
    }

    @media (max-width: 900px) {
      .row {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class PatientListPageComponent {
  private readonly usersService = inject(UsersService);
  private readonly moodEntriesService = inject(MoodEntriesService);
  private readonly patientsLoaded = signal(false);
  private readonly moodEntriesLoaded = signal(false);

  protected readonly labels = APP_LABELS;
  protected readonly errorMessage = signal('');
  protected readonly patients = toSignal(
    this.usersService.listPatients().pipe(
      tap(() => this.patientsLoaded.set(true)),
      catchError(() => {
        this.patientsLoaded.set(true);
        this.errorMessage.set(this.labels.common.firestoreError);

        return of<AppUser[]>([]);
      })
    ),
    { initialValue: [] }
  );
  protected readonly moodEntries = toSignal(
    this.moodEntriesService.listAll().pipe(
      tap(() => this.moodEntriesLoaded.set(true)),
      catchError(() => {
        this.moodEntriesLoaded.set(true);
        this.errorMessage.set(this.labels.common.firestoreError);

        return of<MoodEntry[]>([]);
      })
    ),
    { initialValue: [] }
  );
  protected readonly loading = computed(() => !this.patientsLoaded() || !this.moodEntriesLoaded());
  protected readonly rows = computed<PatientRow[]>(() => {
    const entriesByUser = this.getEntriesByUser(this.moodEntries());

    return this.patients().map((patient) => {
      const entries = entriesByUser.get(patient.id) ?? [];
      const latestEntry = entries[0];

      return {
        id: patient.id,
        name: this.getPatientName(patient),
        email: patient.email ?? patient.id,
        latestMood: latestEntry ? this.formatMood(latestEntry.moodLevel) : this.labels.patients.noMood,
        lastEntry: latestEntry ? this.formatDate(latestEntry.createdAt) : this.labels.patients.noEntries,
        entryCount: String(entries.length),
        status: latestEntry && this.isWithinLastDays(latestEntry.createdAt, 7)
          ? this.labels.patients.activeThisWeek
          : this.labels.patients.inactive
      };
    });
  });

  private getEntriesByUser(entries: MoodEntry[]): Map<string, MoodEntry[]> {
    const entriesByUser = new Map<string, MoodEntry[]>();

    entries.forEach((entry) => {
      const existing = entriesByUser.get(entry.userId) ?? [];

      existing.push(entry);
      entriesByUser.set(entry.userId, existing);
    });

    return entriesByUser;
  }

  private getPatientName(patient: AppUser): string {
    return patient.displayName ?? patient.email ?? patient.id;
  }

  private formatMood(moodLevel: MoodEntry['moodLevel']): string {
    if (moodLevel === undefined) {
      return this.labels.patients.noMood;
    }

    return String(moodLevel);
  }

  private formatDate(value: unknown): string {
    const date = this.toDate(value);

    if (!date) {
      return this.labels.patients.noEntries;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }

  private isWithinLastDays(value: unknown, days: number): boolean {
    const date = this.toDate(value);

    if (!date) {
      return false;
    }

    return date.getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
  }

  private toDate(value: unknown): Date | null {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'number') {
      return new Date(value);
    }

    if (typeof value === 'string') {
      const parsed = Date.parse(value);

      return Number.isNaN(parsed) ? null : new Date(parsed);
    }

    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      const toDate = (value as { toDate?: unknown }).toDate;

      return typeof toDate === 'function' ? toDate.call(value) : null;
    }

    if (typeof value === 'object' && value !== null && 'seconds' in value) {
      const seconds = (value as { seconds?: unknown }).seconds;

      return typeof seconds === 'number' ? new Date(seconds * 1000) : null;
    }

    return null;
  }
}
