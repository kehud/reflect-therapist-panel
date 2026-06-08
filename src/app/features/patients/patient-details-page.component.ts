import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { AppUser } from '../../core/models/app-user.model';
import { MoodEntry } from '../../core/models/mood-entry.model';
import { MoodEntriesService } from '../../core/services/firebase/mood-entries.service';
import { UsersService } from '../../core/services/firebase/users.service';
import { APP_LABELS } from '../../shared/utils/app-labels';

type HeaderMetric = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-patient-details-page',
  template: `
    <section class="page">
      @if (errorMessage()) {
        <p class="message error" role="alert">{{ errorMessage() }}</p>
      }

      @if (loading()) {
        <p class="message">{{ labels.common.loading }}</p>
      } @else if (!patient()) {
        <p class="message">{{ labels.patientDetails.noPatient }}</p>
      } @else {
        <header class="patient-header">
          <div>
            <p class="eyebrow">{{ labels.pages.patientDetailsTitle }}</p>
            <h2>{{ patientName() }}</h2>
          </div>

          <dl class="header-grid">
            @for (metric of headerMetrics(); track metric.label) {
              <div>
                <dt>{{ metric.label }}</dt>
                <dd>{{ metric.value }}</dd>
              </div>
            }
          </dl>
        </header>

        <section class="history" aria-labelledby="mood-history">
          <h3 id="mood-history">{{ labels.patientDetails.moodHistory }}</h3>

          @if (moodEntries().length === 0) {
            <p class="message">{{ labels.patientDetails.noMoodEntries }}</p>
          } @else {
            <div class="entries">
              @for (entry of moodEntries(); track entry.id) {
                <article>
                  <div class="entry-heading">
                    <strong>{{ formatDate(entry.createdAt) }}</strong>
                    <span>{{ labels.patientDetails.moodLevel }}: {{ formatMood(entry.moodLevel) }}</span>
                  </div>

                  <dl class="entry-details">
                    <div>
                      <dt>{{ labels.patientDetails.emotions }}</dt>
                      <dd>{{ formatList(entry.emotions) }}</dd>
                    </div>
                    <div>
                      <dt>{{ labels.patientDetails.influences }}</dt>
                      <dd>{{ formatList(entry.influences) }}</dd>
                    </div>
                  </dl>

                  @if (entry.journalNote) {
                    <p class="journal">
                      <strong>{{ labels.patientDetails.journalNote }}</strong>
                      <span>{{ entry.journalNote }}</span>
                    </p>
                  }
                </article>
              }
            </div>
          }
        </section>
      }
    </section>
  `,
  styles: `
    .page {
      display: grid;
      gap: 24px;
    }

    h2,
    h3,
    p,
    dl,
    dd {
      margin: 0;
    }

    h2 {
      font-size: 2rem;
      letter-spacing: 0;
      margin-top: 4px;
    }

    h3 {
      font-size: 1.1rem;
      letter-spacing: 0;
    }

    .eyebrow,
    dt,
    .message,
    .entry-heading span,
    .journal span {
      color: var(--muted);
    }

    .eyebrow {
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .patient-header,
    article {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
      display: grid;
      gap: 18px;
      padding: 20px;
    }

    .header-grid,
    .entry-details {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    dt {
      font-size: 0.8rem;
      font-weight: 650;
      margin-bottom: 4px;
    }

    dd {
      color: var(--text);
      font-weight: 650;
      overflow-wrap: anywhere;
    }

    .history,
    .entries,
    .journal {
      display: grid;
      gap: 14px;
    }

    .entry-heading {
      align-items: center;
      display: flex;
      gap: 16px;
      justify-content: space-between;
    }

    .entry-heading span {
      font-weight: 650;
    }

    .entry-details {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .journal {
      gap: 6px;
    }

    .error {
      color: #8f2f24;
    }

    @media (max-width: 900px) {
      .header-grid,
      .entry-details {
        grid-template-columns: 1fr;
      }

      .entry-heading {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `
})
export class PatientDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly moodEntriesService = inject(MoodEntriesService);
  private readonly patientLoaded = signal(false);
  private readonly moodEntriesLoaded = signal(false);

  protected readonly labels = APP_LABELS;
  protected readonly patientId = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly errorMessage = signal('');
  protected readonly patient = toSignal(
    this.usersService.getUser(this.patientId).pipe(
      tap(() => this.patientLoaded.set(true)),
      catchError(() => {
        this.patientLoaded.set(true);
        this.errorMessage.set(this.labels.common.firestoreError);

        return of<AppUser | null>(null);
      })
    ),
    { initialValue: null }
  );
  protected readonly moodEntries = toSignal(
    this.moodEntriesService.listForUser(this.patientId).pipe(
      tap(() => this.moodEntriesLoaded.set(true)),
      catchError(() => {
        this.moodEntriesLoaded.set(true);
        this.errorMessage.set(this.labels.common.firestoreError);

        return of<MoodEntry[]>([]);
      })
    ),
    { initialValue: [] }
  );
  protected readonly loading = computed(() => !this.patientLoaded() || !this.moodEntriesLoaded());
  protected readonly latestEntry = computed(() => this.moodEntries()[0]);
  protected readonly patientName = computed(() => {
    const patient = this.patient();

    return patient?.displayName ?? patient?.email ?? patient?.id ?? this.labels.patients.unknownPatient;
  });
  protected readonly headerMetrics = computed<HeaderMetric[]>(() => {
    const patient = this.patient();
    const latestEntry = this.latestEntry();

    return [
      {
        label: this.labels.patientDetails.email,
        value: patient?.email ?? this.labels.patientDetails.none
      },
      {
        label: this.labels.patientDetails.role,
        value: patient?.role ? this.labels.roles[patient.role] : this.labels.patientDetails.none
      },
      {
        label: this.labels.patientDetails.latestMood,
        value: latestEntry ? this.formatMood(latestEntry.moodLevel) : this.labels.patients.noMood
      },
      {
        label: this.labels.patientDetails.lastCheckIn,
        value: latestEntry ? this.formatDate(latestEntry.createdAt) : this.labels.patients.noEntries
      }
    ];
  });

  protected formatMood(moodLevel: MoodEntry['moodLevel']): string {
    if (moodLevel === undefined) {
      return this.labels.patients.noMood;
    }

    return String(moodLevel);
  }

  protected formatList(items: string[]): string {
    return items.length > 0 ? items.join(', ') : this.labels.patientDetails.none;
  }

  protected formatDate(value: unknown): string {
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
