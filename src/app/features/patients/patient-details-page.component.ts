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
  axisLabel: string;
  tooltip: string;
};

type TimelineItem =
  | {
      id: string;
      type: 'mood';
      date: unknown;
      sortTime: number;
      entry: MoodEntry;
    }
  | {
      id: string;
      type: 'note';
      date: unknown;
      sortTime: number;
      note: TherapistNote;
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
                <div
                  class="header-metric"
                  [class.is-email]="metric.label === labels.patientDetails.email"
                  [class.is-date]="metric.label === labels.patientDetails.lastCheckIn"
                >
                  <dt>{{ metric.label }}</dt>
                  <dd [attr.title]="metric.value">{{ metric.value }}</dd>
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
                <svg class="trend-chart" viewBox="0 0 900 180" role="img" [attr.aria-label]="labels.patientDetails.moodTrend">
                  <line class="trend-grid-line" x1="45" y1="30" x2="855" y2="30" />
                  <line class="trend-grid-line" x1="45" y1="78" x2="855" y2="78" />
                  <line class="trend-grid-line" x1="45" y1="126" x2="855" y2="126" />
                  <line class="trend-axis-line" x1="45" y1="142" x2="855" y2="142" />
                  <polyline class="trend-line" [attr.points]="moodTrendLine()" />
                  @for (point of moodTrendPoints(); track point.label + point.x) {
                    <g class="trend-point-group" tabindex="0" [attr.aria-label]="point.tooltip">
                      <title>{{ point.tooltip }}</title>
                      <circle class="trend-hit-area" [attr.cx]="point.x" [attr.cy]="point.y" r="11" />
                      <circle class="trend-point" [attr.cx]="point.x" [attr.cy]="point.y" r="5" />
                    </g>
                    @if (point.axisLabel) {
                      <text class="trend-axis-label" [attr.x]="point.x" y="168" text-anchor="middle">{{ point.axisLabel }}</text>
                    }
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

        <section class="timeline-panel" aria-labelledby="patient-timeline">
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

          <div class="timeline-heading">
            <h3 id="patient-timeline">Patient Timeline</h3>
            <p>Mood entries and therapist notes in chronological order.</p>
          </div>

          @if (timelineLoading()) {
            <p class="message">{{ labels.common.loading }}</p>
          } @else if (notesErrorMessage()) {
            <p class="message error" role="alert">{{ notesErrorMessage() }}</p>
          } @else if (timelineItems().length === 0) {
            <p class="message">{{ labels.patientDetails.noMoodEntries }} {{ labels.patientDetails.noTherapistNotes }}</p>
          } @else {
            <div class="timeline">
              @for (item of visibleTimelineItems(); track item.id) {
                @if (item.type === 'mood') {
                  <article class="timeline-card is-mood">
                    <div class="timeline-card-header">
                      <div class="timeline-title-group">
                        <p class="timeline-type">Mood Check-in</p>
                        <time [attr.datetime]="formatDateTimeAttribute(item.date)">{{ formatDate(item.date) }}</time>
                      </div>
                      <span class="mood-chip">{{ labels.patientDetails.moodLevel }}: {{ formatMood(item.entry.moodLevel) }}</span>
                    </div>

                    <dl class="entry-details">
                      <div>
                        <dt>{{ labels.patientDetails.emotions }}</dt>
                        <dd>{{ formatList(item.entry.emotions) }}</dd>
                      </div>
                      <div>
                        <dt>{{ labels.patientDetails.influences }}</dt>
                        <dd>{{ formatList(item.entry.influences) }}</dd>
                      </div>
                    </dl>

                    @if (item.entry.journalNote) {
                      <p class="journal">
                        <strong>{{ labels.patientDetails.journalNote }}</strong>
                        <span>{{ item.entry.journalNote }}</span>
                      </p>
                    }
                  </article>
                } @else {
                  <article class="timeline-card is-note">
                    <div class="timeline-card-header">
                      <div class="timeline-title-group">
                        <p class="timeline-type">Therapist Note</p>
                        <time [attr.datetime]="formatDateTimeAttribute(item.date)">{{ formatDate(item.date) }}</time>
                      </div>
                      @if (item.note.therapistName) {
                        <span class="author-name">{{ item.note.therapistName }}</span>
                      }
                    </div>
                    <p class="note-text">{{ item.note.note }}</p>
                  </article>
                }
              }
            </div>

            @if (canLoadMoreTimelineItems()) {
              <button class="load-more" type="button" (click)="loadMoreTimelineItems()">{{ labels.common.loadMore }}</button>
            }
          }
        </section>
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
    .timeline-card time,
    .author-name,
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
    .attention-card {
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
      grid-template-columns: minmax(240px, 0.42fr) minmax(0, 1.58fr);
    }

    .header-grid,
    .entry-details {
      display: grid;
      gap: 14px;
    }

    .header-grid {
      grid-template-columns: 1fr;
    }

    .header-metric {
      background: color-mix(in srgb, var(--surface-muted) 54%, transparent);
      border: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
      border-radius: var(--radius-md);
      display: grid;
      gap: 6px;
      min-height: 74px;
      min-width: 0;
      padding: 13px 14px;
    }

    .header-metric dd {
      font-size: 1rem;
      line-height: 1.25;
    }

    .header-metric.is-email dd,
    .header-metric.is-date dd {
      display: block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header-metric.is-email dd {
      font-size: 0.9rem;
    }

    .header-metric.is-date dd {
      font-size: 0.94rem;
    }

    .mood-trend {
      --trend-color: color-mix(in srgb, #14b8a6 58%, #64748b);
      --trend-soft: color-mix(in srgb, #14b8a6 14%, var(--surface));
      background: color-mix(in srgb, var(--surface) 88%, transparent);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      display: grid;
      gap: 8px;
      min-width: 0;
      padding: 10px 10px 8px;
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
      height: 180px;
      justify-self: stretch;
      max-width: none;
      min-width: 0;
      overflow: visible;
      width: 100%;
    }

    .trend-grid-line,
    .trend-axis-line {
      stroke: color-mix(in srgb, var(--line) 42%, transparent);
      stroke-width: 1;
    }

    .trend-axis-line {
      stroke: color-mix(in srgb, var(--line) 58%, transparent);
    }

    .trend-line {
      fill: none;
      stroke: var(--trend-color);
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 4.4;
    }

    .trend-point-group {
      cursor: pointer;
      outline: none;
    }

    .trend-hit-area {
      fill: transparent;
    }

    .trend-point {
      fill: var(--surface);
      stroke: var(--trend-color);
      stroke-width: 3.2;
      transition:
        fill 140ms ease,
        stroke-width 140ms ease;
    }

    .trend-point-group:hover .trend-point,
    .trend-point-group:focus-visible .trend-point {
      fill: var(--trend-soft);
      stroke-width: 3.8;
    }

    .trend-axis-label {
      fill: color-mix(in srgb, var(--muted) 88%, var(--text));
      font-size: 8.8px;
      font-weight: 650;
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

    .attention-card,
    .timeline-panel,
    .timeline,
    .journal {
      display: grid;
      gap: 14px;
    }

    .timeline-heading {
      display: grid;
      gap: 4px;
      padding-top: 2px;
    }

    .timeline-heading p {
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.45;
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

    .timeline-card {
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--surface-muted) 32%, transparent), transparent 58%),
        var(--surface);
      border: 1px solid color-mix(in srgb, var(--line) 86%, transparent);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      display: grid;
      gap: 16px;
      padding: 18px;
      position: relative;
    }

    .timeline-card.is-mood {
      border-color: color-mix(in srgb, var(--accent) 18%, var(--line));
    }

    .timeline-card.is-note {
      border-color: color-mix(in srgb, var(--muted) 20%, var(--line));
    }

    .timeline {
      padding-left: 44px;
      position: relative;
    }

    .timeline::before {
      background: color-mix(in srgb, var(--line) 78%, transparent);
      bottom: 24px;
      content: '';
      left: 12px;
      position: absolute;
      top: 24px;
      width: 1px;
    }

    .timeline-card::before {
      background: var(--surface);
      border: 1px solid color-mix(in srgb, var(--line) 88%, transparent);
      content: '';
      height: 24px;
      left: -44px;
      position: absolute;
      top: 15px;
      width: 24px;
      z-index: 1;
    }

    .timeline-card::after {
      content: '';
      position: absolute;
      z-index: 2;
    }

    .timeline-card.is-mood::before {
      background: color-mix(in srgb, #14b8a6 12%, var(--surface));
      border-color: color-mix(in srgb, #14b8a6 36%, var(--line));
      border-radius: 999px;
      box-shadow: 0 0 0 5px color-mix(in srgb, #14b8a6 10%, transparent);
    }

    .timeline-card.is-mood::after {
      background: #14b8a6;
      clip-path: polygon(50% 90%, 13% 56%, 8% 34%, 21% 18%, 38% 18%, 50% 30%, 62% 18%, 79% 18%, 92% 34%, 87% 56%);
      height: 11px;
      left: -38px;
      top: 21px;
      width: 12px;
    }

    .timeline-card.is-note::before {
      background: color-mix(in srgb, var(--surface-muted) 86%, var(--surface));
      border-color: color-mix(in srgb, #64748b 34%, var(--line));
      border-radius: 7px;
      box-shadow: 0 0 0 5px color-mix(in srgb, var(--surface-muted) 44%, transparent);
    }

    .timeline-card.is-note::after {
      border: 1.5px solid #64748b;
      border-radius: 2px;
      box-shadow: inset 0 4px 0 -3px color-mix(in srgb, #64748b 68%, transparent);
      height: 11px;
      left: -37px;
      top: 21px;
      width: 9px;
    }

    .timeline-card-header {
      align-items: flex-start;
      display: flex;
      gap: 16px;
      justify-content: space-between;
    }

    .timeline-title-group {
      display: grid;
      gap: 5px;
      min-width: 0;
    }

    .timeline-type {
      align-items: center;
      color: var(--accent-strong);
      display: inline-flex;
      font-size: 0.76rem;
      font-weight: 760;
      gap: 8px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .timeline-card time,
    .author-name {
      font-size: 0.9rem;
      font-weight: 650;
    }

    .author-name {
      overflow-wrap: anywhere;
      text-align: right;
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
      .patient-summary-grid {
        grid-template-columns: 1fr;
      }

      .header-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .timeline-card-header {
        align-items: flex-start;
        flex-direction: column;
      }

      .author-name {
        text-align: left;
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
  protected readonly visibleTimelineItemCount = signal(this.visiblePageSize);
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
  protected readonly timelineLoading = computed(() => !this.moodEntriesLoaded() || !this.notesLoaded());
  protected readonly saveDisabled = computed(() => this.savingNote() || this.noteText().trim().length === 0);
  protected readonly latestEntry = computed<MoodEntry | undefined>(() => this.moodEntries()[0]);
  protected readonly timelineItems = computed<TimelineItem[]>(() => {
    const moodItems: TimelineItem[] = this.moodEntries().map((entry, index) => ({
      id: `mood-${entry.id || index}`,
      type: 'mood',
      date: entry.createdAt,
      sortTime: this.toMillis(entry.createdAt),
      entry
    }));
    const noteItems: TimelineItem[] = this.therapistNotes().map((note, index) => ({
      id: `note-${note.id || index}`,
      type: 'note',
      date: note.createdAt,
      sortTime: this.toMillis(note.createdAt),
      note
    }));

    return [...moodItems, ...noteItems].sort((first, second) => second.sortTime - first.sortTime);
  });
  protected readonly visibleTimelineItems = computed(() => this.timelineItems().slice(0, this.visibleTimelineItemCount()));
  protected readonly canLoadMoreTimelineItems = computed(() => this.visibleTimelineItems().length < this.timelineItems().length);
  protected readonly moodTrendPoints = computed<MoodTrendPoint[]>(() => {
    const entries = this.moodEntries()
      .filter((entry) => typeof entry.moodLevel === 'number')
      .slice(0, 10)
      .reverse();
    const chart = {
      left: 45,
      right: 855,
      top: 30,
      bottom: 126,
      minMood: 1,
      maxMood: 10
    };

    if (entries.length === 0) {
      return [];
    }

    let lastVisibleAxisLabel = '';

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
      const axisLabel = this.formatShortDate(entry.createdAt);
      const showAxisLabel = entries.length <= 5 || index === 0 || index === entries.length - 1 || index % 2 === 0;
      const visibleAxisLabel = showAxisLabel && axisLabel !== lastVisibleAxisLabel ? axisLabel : '';

      if (visibleAxisLabel) {
        lastVisibleAxisLabel = visibleAxisLabel;
      }

      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        mood: this.formatMood(entry.moodLevel),
        label: this.formatDate(entry.createdAt),
        axisLabel: visibleAxisLabel,
        tooltip: `Date: ${this.formatDate(entry.createdAt)} | Mood: ${this.formatMood(entry.moodLevel)}`
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

  protected loadMoreTimelineItems(): void {
    this.visibleTimelineItemCount.update((count) => count + this.visiblePageSize);
  }

  protected formatDate(value: unknown): string {
    const date = this.toDate(value);

    if (!date || Number.isNaN(date.getTime())) {
      return this.labels.patients.noEntries;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }

  protected formatDateTimeAttribute(value: unknown): string | null {
    const date = this.toDate(value);

    return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
  }

  protected formatShortDate(value: unknown): string {
    const date = this.toDate(value);

    if (!date || Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric'
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

  private toMillis(value: unknown): number {
    const date = this.toDate(value);

    if (!date) {
      return 0;
    }

    const time = date.getTime();

    return Number.isNaN(time) ? 0 : time;
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
