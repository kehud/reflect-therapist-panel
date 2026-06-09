import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { AppUser } from '../../core/models/app-user.model';
import { MoodEntry } from '../../core/models/mood-entry.model';
import { TherapistNote } from '../../core/models/therapist-note.model';
import { AttentionLevel, AttentionService } from '../../core/services/attention.service';
import { MoodEntriesService } from '../../core/services/firebase/mood-entries.service';
import { TherapistNotesService } from '../../core/services/firebase/therapist-notes.service';
import { UsersService } from '../../core/services/firebase/users.service';
import { APP_LABELS } from '../../shared/utils/app-labels';

type HeaderMetric = {
  label: string;
  value: string;
};

type MoodTrendPoint = {
  x: number;
  y: number;
  mood: string;
  label: string;
};

@Component({
  selector: 'app-patient-details-page',
  imports: [FormsModule],
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
          <div class="patient-title">
            <p class="eyebrow">{{ labels.pages.patientDetailsTitle }}</p>
            <h2>{{ patientName() }}</h2>
          </div>

          <div class="patient-summary-grid">
            <dl class="header-grid">
              @for (metric of headerMetrics(); track metric.label) {
                <div class="header-metric">
                  <dt>{{ metric.label }}</dt>
                  <dd>{{ metric.value }}</dd>
                </div>
              }
            </dl>

            <section class="mood-trend" aria-labelledby="mood-trend-title">
              <div class="trend-heading">
                <div>
                  <h3 id="mood-trend-title">{{ labels.patientDetails.moodTrend }}</h3>
                  <p>{{ labels.patientDetails.lastTenMoodEntries }}</p>
                </div>
                @if (latestEntry()) {
                  <strong>{{ formatMood(latestEntry()?.moodLevel) }}</strong>
                }
              </div>

              @if (moodTrendPoints().length === 0) {
                <p class="message compact">{{ labels.patientDetails.noMoodTrend }}</p>
              } @else {
                <svg class="trend-chart" viewBox="0 0 280 92" role="img" [attr.aria-label]="labels.patientDetails.moodTrend">
                  <line class="trend-grid-line" x1="12" y1="16" x2="268" y2="16" />
                  <line class="trend-grid-line" x1="12" y1="46" x2="268" y2="46" />
                  <line class="trend-grid-line" x1="12" y1="76" x2="268" y2="76" />
                  <polyline class="trend-line" [attr.points]="moodTrendLine()" />
                  @for (point of moodTrendPoints(); track point.label + point.x) {
                    <circle class="trend-point" [attr.cx]="point.x" [attr.cy]="point.y" r="3.2">
                      <title>{{ point.label }}: {{ point.mood }}</title>
                    </circle>
                  }
                </svg>
              }
            </section>
          </div>
        </header>

        <section class="attention-card" aria-labelledby="attention-summary">
          <div class="section-heading">
            <h3 id="attention-summary">{{ labels.attention.title }}</h3>
            <span
              class="status-pill"
              [class.is-high]="attentionSummary().level === 'high'"
              [class.is-medium]="attentionSummary().level === 'medium'"
            >
              {{ formatAttentionLevel(attentionSummary().level) }}
            </span>
          </div>

          @if (attentionSummary().reasons.length === 0) {
            <p class="message">{{ labels.attention.noReasons }}</p>
          } @else {
            <ul>
              @for (reason of attentionSummary().reasons; track reason) {
                <li>{{ reason }}</li>
              }
            </ul>
          }
        </section>

        <div class="detail-grid">
          <section class="history" aria-labelledby="mood-history">
            <h3 id="mood-history">{{ labels.patientDetails.moodHistory }}</h3>

            @if (moodEntries().length === 0) {
              <p class="message">{{ labels.patientDetails.noMoodEntries }}</p>
            } @else {
              <div class="entries">
                @for (entry of visibleMoodEntries(); track entry.id) {
                  <article class="entry-card">
                    <div class="entry-heading">
                      <strong>{{ formatDate(entry.createdAt) }}</strong>
                      <span class="mood-chip">{{ labels.patientDetails.moodLevel }}: {{ formatMood(entry.moodLevel) }}</span>
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

              @if (canLoadMoreMoodEntries()) {
                <button class="load-more" type="button" (click)="loadMoreMoodEntries()">{{ labels.common.loadMore }}</button>
              }
            }
          </section>

          <section class="notes" aria-labelledby="therapist-notes">
            <div class="section-heading">
              <h3 id="therapist-notes">{{ labels.patientDetails.therapistNotes }}</h3>
            </div>

            <form class="note-form" (ngSubmit)="saveNote()">
              <textarea
                name="therapistNote"
                rows="4"
                [placeholder]="labels.patientDetails.notePlaceholder"
                [disabled]="savingNote()"
                [ngModel]="noteText()"
                (ngModelChange)="noteText.set($event)"
              ></textarea>

              <button type="submit" [disabled]="saveDisabled()">
                {{ savingNote() ? labels.patientDetails.savingNote : labels.patientDetails.saveNote }}
              </button>
            </form>

            @if (saveNoteErrorMessage()) {
              <p class="message error" role="alert">{{ saveNoteErrorMessage() }}</p>
            }

            @if (notesLoading()) {
              <p class="message">{{ labels.common.loading }}</p>
            } @else if (notesErrorMessage()) {
              <p class="message error" role="alert">{{ notesErrorMessage() }}</p>
            } @else if (therapistNotes().length === 0) {
              <p class="message">{{ labels.patientDetails.noTherapistNotes }}</p>
            } @else {
              <div class="entries">
                @for (note of visibleTherapistNotes(); track note.id) {
                  <article class="entry-card note-card">
                    <div class="entry-heading">
                      <strong>{{ formatDate(note.createdAt) }}</strong>
                      <span>{{ note.therapistName }}</span>
                    </div>
                    <p class="note-text">{{ note.note }}</p>
                  </article>
                }
              </div>

              @if (canLoadMoreTherapistNotes()) {
                <button class="load-more" type="button" (click)="loadMoreTherapistNotes()">{{ labels.common.loadMore }}</button>
              }
            }
          </section>
        </div>
      }
    </section>
  `,
  styles: `
    .page {
      display: grid;
      gap: 18px;
    }

    h2,
    h3,
    p,
    dl,
    dd {
      margin: 0;
    }

    h2 {
      font-size: 1.95rem;
      font-weight: 730;
      letter-spacing: 0;
      margin-top: 4px;
    }

    h3 {
      font-size: 1rem;
      font-weight: 720;
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
    .attention-card,
    .entry-card {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      display: grid;
      gap: 18px;
      padding: 20px;
    }

    .patient-header {
      background:
        linear-gradient(135deg, color-mix(in srgb, var(--accent-soft) 62%, transparent), transparent 72%),
        var(--surface);
      gap: 18px;
      padding: 18px;
    }

    .patient-title {
      min-width: 0;
    }

    .patient-summary-grid {
      align-items: stretch;
      display: grid;
      gap: 14px;
      grid-template-columns: minmax(0, 1fr) minmax(280px, 0.34fr);
    }

    .header-grid,
    .entry-details {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .header-metric {
      background: color-mix(in srgb, var(--surface-muted) 54%, transparent);
      border: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
      border-radius: var(--radius-md);
      padding: 12px;
      min-width: 0;
    }

    .mood-trend {
      background: color-mix(in srgb, var(--surface) 88%, transparent);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      display: grid;
      gap: 8px;
      min-width: 0;
      padding: 12px;
    }

    .trend-heading {
      align-items: center;
      display: flex;
      gap: 12px;
      justify-content: space-between;
    }

    .trend-heading p {
      color: var(--muted);
      font-size: 0.78rem;
      margin-top: 2px;
    }

    .trend-heading strong {
      color: var(--accent-strong);
      font-size: 1.2rem;
      font-weight: 760;
    }

    .trend-chart {
      display: block;
      height: 92px;
      overflow: visible;
      width: 100%;
    }

    .trend-grid-line {
      stroke: color-mix(in srgb, var(--line) 72%, transparent);
      stroke-width: 1;
    }

    .trend-line {
      fill: none;
      stroke: var(--accent);
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 3;
    }

    .trend-point {
      fill: var(--surface);
      stroke: var(--accent-strong);
      stroke-width: 2;
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
    .notes,
    .attention-card,
    .entries,
    .journal {
      display: grid;
      gap: 14px;
    }

    .detail-grid {
      align-items: start;
      display: grid;
      gap: 18px;
      grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.92fr);
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

    .section-heading {
      align-items: center;
      display: flex;
      gap: 16px;
      justify-content: space-between;
    }

    .section-heading span {
      color: var(--accent-strong);
      font-weight: 700;
    }

    .status-pill,
    .mood-chip {
      border: 1px solid color-mix(in srgb, var(--accent) 32%, var(--line));
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--accent-strong);
      font-size: 0.8rem;
      font-weight: 720;
      padding: 6px 10px;
      white-space: nowrap;
    }

    .status-pill {
      background: var(--attention-normal-soft);
      border-color: color-mix(in srgb, var(--attention-normal) 24%, var(--line));
      color: var(--attention-normal);
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

    .entry-details {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .entry-card {
      gap: 16px;
      padding: 18px;
    }

    ul {
      color: var(--muted);
      margin: 0;
      padding-inline-start: 20px;
    }

    li + li {
      margin-top: 6px;
    }

    .journal {
      gap: 6px;
      line-height: 1.55;
    }

    .note-form {
      background: color-mix(in srgb, var(--surface) 82%, transparent);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      display: grid;
      gap: 12px;
      padding: 16px;
    }

    textarea {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      color: var(--text);
      min-height: 112px;
      padding: 12px 14px;
      resize: vertical;
    }

    button {
      background: var(--accent);
      border: 0;
      border-radius: var(--radius-sm);
      color: var(--surface);
      cursor: pointer;
      font-weight: 650;
      justify-self: start;
      min-height: 42px;
      padding: 0 16px;
    }

    .load-more {
      background: var(--surface);
      border: 1px solid var(--line);
      color: var(--accent-strong);
      justify-self: center;
      min-height: 38px;
      padding-inline: 14px;
    }

    .load-more:hover {
      background: var(--accent-soft);
      border-color: color-mix(in srgb, var(--accent) 24%, var(--line));
    }

    button:disabled,
    textarea:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    .note-text {
      color: var(--text);
      line-height: 1.55;
      white-space: pre-wrap;
    }

    .message {
      background: color-mix(in srgb, var(--surface) 80%, transparent);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      padding: 13px 15px;
    }

    .message.compact {
      font-size: 0.85rem;
      padding: 10px 12px;
    }

    .error {
      background: var(--error-soft);
      border-color: color-mix(in srgb, var(--error) 24%, var(--line));
      color: var(--error);
    }

    @media (max-width: 900px) {
      .patient-summary-grid,
      .detail-grid {
        grid-template-columns: 1fr;
      }

      .header-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .entry-heading {
        align-items: flex-start;
        flex-direction: column;
      }

      .section-heading {
        align-items: flex-start;
        flex-direction: column;
      }
    }

    @media (max-width: 640px) {
      .header-grid,
      .entry-details {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class PatientDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly moodEntriesService = inject(MoodEntriesService);
  private readonly therapistNotesService = inject(TherapistNotesService);
  private readonly attentionService = inject(AttentionService);
  private readonly visiblePageSize = 10;
  private readonly patientLoaded = signal(false);
  private readonly moodEntriesLoaded = signal(false);
  private readonly notesLoaded = signal(false);

  protected readonly labels = APP_LABELS;
  protected readonly patientId = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly errorMessage = signal('');
  protected readonly notesErrorMessage = signal('');
  protected readonly saveNoteErrorMessage = signal('');
  protected readonly noteText = signal('');
  protected readonly visibleMoodEntryCount = signal(this.visiblePageSize);
  protected readonly visibleTherapistNoteCount = signal(this.visiblePageSize);
  protected readonly savingNote = signal(false);
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
  protected readonly therapistNotes = toSignal(
    this.therapistNotesService.getPatientNotes(this.patientId).pipe(
      tap(() => this.notesLoaded.set(true)),
      catchError(() => {
        this.notesLoaded.set(true);
        this.notesErrorMessage.set(this.labels.common.firestoreError);

        return of<TherapistNote[]>([]);
      })
    ),
    { initialValue: [] }
  );
  protected readonly loading = computed(() => !this.patientLoaded() || !this.moodEntriesLoaded());
  protected readonly notesLoading = computed(() => !this.notesLoaded());
  protected readonly saveDisabled = computed(() => this.savingNote() || this.noteText().trim().length === 0);
  protected readonly latestEntry = computed<MoodEntry | undefined>(() => this.moodEntries()[0]);
  protected readonly visibleMoodEntries = computed(() => this.moodEntries().slice(0, this.visibleMoodEntryCount()));
  protected readonly visibleTherapistNotes = computed(() => this.therapistNotes().slice(0, this.visibleTherapistNoteCount()));
  protected readonly canLoadMoreMoodEntries = computed(() => this.visibleMoodEntries().length < this.moodEntries().length);
  protected readonly canLoadMoreTherapistNotes = computed(() => this.visibleTherapistNotes().length < this.therapistNotes().length);
  protected readonly moodTrendPoints = computed<MoodTrendPoint[]>(() => {
    const entries = this.moodEntries()
      .filter((entry) => typeof entry.moodLevel === 'number')
      .slice(0, 10)
      .reverse();
    const chart = {
      left: 12,
      right: 268,
      top: 14,
      bottom: 76,
      minMood: 1,
      maxMood: 10
    };

    if (entries.length === 0) {
      return [];
    }

    return entries.map((entry, index) => {
      const x =
        entries.length === 1
          ? (chart.left + chart.right) / 2
          : chart.left + ((chart.right - chart.left) * index) / (entries.length - 1);
      const moodLevel = entry.moodLevel ?? chart.minMood;
      const clampedMood = Math.min(chart.maxMood, Math.max(chart.minMood, moodLevel));
      const y =
        chart.bottom -
        ((clampedMood - chart.minMood) / (chart.maxMood - chart.minMood)) * (chart.bottom - chart.top);

      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        mood: this.formatMood(entry.moodLevel),
        label: this.formatDate(entry.createdAt)
      };
    });
  });
  protected readonly moodTrendLine = computed(() => {
    return this.moodTrendPoints()
      .map((point) => `${point.x},${point.y}`)
      .join(' ');
  });
  protected readonly attentionSummary = computed(() => {
    return this.attentionService.calculatePatientAttention(this.moodEntries());
  });
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

  protected formatAttentionLevel(level: AttentionLevel): string {
    return this.labels.attention[level];
  }

  protected loadMoreMoodEntries(): void {
    this.visibleMoodEntryCount.update((count) => count + this.visiblePageSize);
  }

  protected loadMoreTherapistNotes(): void {
    this.visibleTherapistNoteCount.update((count) => count + this.visiblePageSize);
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

  protected async saveNote(): Promise<void> {
    this.saveNoteErrorMessage.set('');

    if (this.saveDisabled()) {
      if (!this.noteText().trim()) {
        this.saveNoteErrorMessage.set(this.labels.patientDetails.emptyNoteError);
      }

      return;
    }

    this.savingNote.set(true);

    try {
      await this.therapistNotesService.createNote(this.patientId, this.noteText());
      this.noteText.set('');
    } catch {
      this.saveNoteErrorMessage.set(this.labels.patientDetails.saveNoteError);
    } finally {
      this.savingNote.set(false);
    }
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
