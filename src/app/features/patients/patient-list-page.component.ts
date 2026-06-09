import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { AppUser } from '../../core/models/app-user.model';
import { MoodEntry } from '../../core/models/mood-entry.model';
import { AttentionLevel, AttentionService } from '../../core/services/attention.service';
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
  statusLevel: AttentionLevel;
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
              <span role="cell" [attr.data-label]="labels.patients.latestMood">{{ row.latestMood }}</span>
              <span role="cell" [attr.data-label]="labels.patients.lastEntry">{{ row.lastEntry }}</span>
              <span role="cell" [attr.data-label]="labels.patients.entries">{{ row.entryCount }}</span>
              <span
                class="status-pill"
                [class.is-high]="row.statusLevel === 'high'"
                [class.is-medium]="row.statusLevel === 'medium'"
                role="cell"
                [attr.data-label]="labels.patients.status"
              >
                {{ row.status }}
              </span>
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
      gap: 14px;
    }

    .page {
      gap: 18px;
    }

    h2,
    p {
      margin: 0;
    }

    h2 {
      font-size: 1.95rem;
      font-weight: 720;
      letter-spacing: 0;
    }

    p,
    .row,
    small,
    .message {
      color: var(--muted);
    }

    .heading p {
      line-height: 1.55;
      max-width: 680px;
    }

    .table {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      overflow: hidden;
    }

    .row {
      align-items: center;
      display: grid;
      gap: 16px;
      grid-template-columns: minmax(240px, 1.55fr) 0.7fr 1fr 0.45fr 0.75fr;
      min-height: 64px;
      padding: 13px 18px;
    }

    .row + .row {
      border-top: 1px solid var(--line);
    }

    .row.header {
      background: color-mix(in srgb, var(--surface-muted) 70%, var(--surface));
      color: var(--text);
      font-size: 0.76rem;
      font-weight: 750;
      letter-spacing: 0.05em;
      min-height: 44px;
      padding-block: 11px;
      text-transform: uppercase;
    }

    a.row:hover {
      background: color-mix(in srgb, var(--surface-muted) 72%, transparent);
    }

    .patient {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    strong {
      color: var(--text);
      font-weight: 720;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    [role='cell']:not(.patient) {
      color: var(--muted-strong);
      font-size: 0.92rem;
    }

    .status-pill {
      justify-self: start;
      border: 1px solid color-mix(in srgb, var(--attention-normal) 24%, var(--line));
      border-radius: 999px;
      background: var(--attention-normal-soft);
      color: var(--attention-normal);
      font-size: 0.78rem;
      font-weight: 750;
      padding: 6px 10px;
      white-space: nowrap;
    }

    .status-pill.is-high {
      background: var(--attention-high-soft);
      border-color: color-mix(in srgb, var(--attention-high) 28%, var(--line));
      color: var(--attention-high);
    }

    .status-pill.is-medium {
      background: var(--attention-medium-soft);
      border-color: color-mix(in srgb, var(--attention-medium) 26%, var(--line));
      color: var(--attention-medium);
    }

    .message {
      background: color-mix(in srgb, var(--surface) 80%, transparent);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      margin: 0;
      padding: 13px 15px;
    }

    .error {
      background: var(--error-soft);
      border-color: color-mix(in srgb, var(--error) 24%, var(--line));
      color: var(--error);
    }

    @media (max-width: 900px) {
      .row.header {
        display: none;
      }

      .row {
        align-items: stretch;
        gap: 10px;
        grid-template-columns: 1fr;
        min-height: 0;
        padding: 16px;
      }

      [role='cell']:not(.patient) {
        align-items: center;
        display: flex;
        justify-content: space-between;
      }

      [role='cell']:not(.patient)::before {
        color: var(--muted);
        content: attr(data-label);
        font-size: 0.76rem;
        font-weight: 750;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .status-pill {
        justify-self: stretch;
      }
    }
  `
})
export class PatientListPageComponent {
  private readonly usersService = inject(UsersService);
  private readonly moodEntriesService = inject(MoodEntriesService);
  private readonly attentionService = inject(AttentionService);
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
      const attention = this.attentionService.calculatePatientAttention(entries);

      return {
        id: patient.id,
        name: this.getPatientName(patient),
        email: patient.email ?? patient.id,
        latestMood: latestEntry ? this.formatMood(latestEntry.moodLevel) : this.labels.patients.noMood,
        lastEntry: latestEntry ? this.formatDate(latestEntry.createdAt) : this.labels.patients.noEntries,
        entryCount: String(entries.length),
        status: this.formatAttentionLevel(attention.level),
        statusLevel: attention.level
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

  private formatAttentionLevel(level: AttentionLevel): string {
    return this.labels.attention[level];
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
