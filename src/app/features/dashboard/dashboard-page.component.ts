import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { AppUser } from '../../core/models/app-user.model';
import { MoodEntry } from '../../core/models/mood-entry.model';
import { AppLanguageService } from '../../core/services/app-language.service';
import { AttentionLevel, AttentionService } from '../../core/services/attention.service';
import { MoodEntriesService } from '../../core/services/firebase/mood-entries.service';
import { UsersService } from '../../core/services/firebase/users.service';

type DashboardMetric = {
  label: string;
  value: string;
  description: string;
};

type RecentMoodEntry = {
  id: string;
  userId: string;
  patientName: string;
  mood: string;
  createdAt: string;
};

type AttentionPatient = {
  patientId: string;
  patientName: string;
  level: AttentionLevel;
  reasons: string[];
  needsAttention: boolean;
};

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="heading">
        <p>{{ labels().dashboard.overview }}</p>
        <h2>{{ labels().pages.dashboardTitle }}</h2>
      </div>

      @if (errorMessage()) {
        <p class="message error" role="alert">{{ errorMessage() }}</p>
      }

      @if (loading()) {
        <p class="message">{{ labels().common.loading }}</p>
      }

      <div class="metrics" [attr.aria-label]="labels().dashboard.overview">
        @for (metric of metrics(); track metric.label) {
          <article class="metric-card">
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
            <p>{{ metric.description }}</p>
          </article>
        }
      </div>

      <div class="dashboard-grid">
        <section class="recent" aria-labelledby="attention-list">
          <div class="section-heading">
            <h3 id="attention-list">{{ labels().dashboard.attentionList }}</h3>
            <a routerLink="/patients">{{ labels().dashboard.viewPatients }}</a>
          </div>

          @if (!loading()) {
            @if (attentionList().length === 0) {
              <p class="attention-empty" role="status">✓ {{ labels().dashboard.noAttention }}</p>
            } @else {
              <div class="recent-list">
                @for (item of attentionList(); track item.patientId) {
                  <a class="recent-row" [routerLink]="['/patients', item.patientId]">
                    <span>
                      <strong>{{ item.patientName }}</strong>
                      <small>{{ item.reasons.join(' ') }}</small>
                    </span>
                    <span class="status-pill" [class.is-high]="item.level === 'high'" [class.is-medium]="item.level === 'medium'">
                      {{ formatAttentionLevel(item.level) }}
                    </span>
                  </a>
                }
              </div>
            }
          }
        </section>

        <section class="recent" aria-labelledby="recent-mood-entries">
          <div class="section-heading">
            <h3 id="recent-mood-entries">{{ labels().dashboard.recentMoodEntries }}</h3>
            <a routerLink="/patients">{{ labels().dashboard.viewPatients }}</a>
          </div>

          @if (!loading()) {
            @if (recentEntries().length === 0) {
              <p class="message">{{ labels().dashboard.noMoodEntries }}</p>
            } @else {
              <div class="recent-list">
                @for (entry of recentEntries(); track entry.id) {
                  <a class="recent-row" [routerLink]="['/patients', entry.userId]">
                    <span>
                      <strong>{{ entry.patientName }}</strong>
                      <small>{{ entry.createdAt }}</small>
                    </span>
                    <span class="mood-chip">{{ entry.mood }}</span>
                  </a>
                }
              </div>
            }
          }
        </section>
      </div>
    </section>
  `,
  styles: `
    .page {
      display: grid;
      gap: 26px;
    }

    .heading p,
    .metric-card span,
    .metric-card p,
    .message,
    small {
      color: var(--muted);
    }

    .heading {
      display: grid;
      gap: 4px;
    }

    .heading p {
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      margin: 0;
      text-transform: uppercase;
    }

    h2 {
      font-size: 1.95rem;
      font-weight: 720;
      letter-spacing: 0;
      margin: 0;
    }

    h3 {
      font-size: 1rem;
      font-weight: 720;
      letter-spacing: 0;
      margin: 0;
    }

    .metrics {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .metric-card {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      display: grid;
      gap: 8px;
      min-height: 126px;
      padding: 16px;
    }

    .metric-card span {
      font-size: 0.78rem;
      font-weight: 650;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    .metric-card strong {
      font-size: 2rem;
      font-weight: 760;
      letter-spacing: 0;
      line-height: 1.05;
    }

    .metric-card p,
    .message {
      margin: 0;
    }

    .metric-card p,
    small {
      line-height: 1.45;
    }

    .message {
      background: color-mix(in srgb, var(--surface) 80%, transparent);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      padding: 13px 15px;
    }

    .section-heading,
    .recent-row {
      align-items: center;
      display: flex;
      gap: 16px;
      justify-content: space-between;
    }

    .section-heading a {
      color: var(--accent-strong);
      font-size: 0.9rem;
      font-weight: 650;
    }

    .recent {
      align-content: start;
      display: grid;
      gap: 14px;
      min-width: 0;
    }

    .dashboard-grid {
      align-items: stretch;
      display: grid;
      gap: 18px;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    .attention-empty {
      align-self: start;
      color: var(--attention-normal);
      font-size: 0.92rem;
      font-weight: 650;
      margin: 0;
      padding: 2px 0;
    }

    .recent-list {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      overflow: hidden;
    }

    .recent-row {
      min-height: 68px;
      padding: 15px 18px;
      text-align: start;
    }

    .recent-row + .recent-row {
      border-top: 1px solid var(--line);
    }

    .recent-row:hover {
      background: color-mix(in srgb, var(--surface-muted) 68%, transparent);
    }

    .recent-row span:first-child {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    .recent-row > span:last-child {
      font-weight: 700;
      text-align: end;
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

    .error {
      background: var(--error-soft);
      border-color: color-mix(in srgb, var(--error) 24%, var(--line));
      color: var(--error);
    }

    @media (max-width: 1080px) {
      .metrics {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 900px) {
      .metrics {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .section-heading,
      .recent-row {
        align-items: flex-start;
        flex-direction: column;
      }

      .recent-row > span:last-child {
        text-align: start;
      }
    }
  `
})
export class DashboardPageComponent {
  private readonly appLanguageService = inject(AppLanguageService);
  private readonly usersService = inject(UsersService);
  private readonly moodEntriesService = inject(MoodEntriesService);
  private readonly attentionService = inject(AttentionService);
  private readonly patientsLoaded = signal(false);
  private readonly moodEntriesLoaded = signal(false);

  protected readonly labels = this.appLanguageService.labels;
  protected readonly errorMessage = signal('');
  protected readonly patients = toSignal(
    this.usersService.listPatients().pipe(
      tap(() => this.patientsLoaded.set(true)),
      catchError(() => {
        this.patientsLoaded.set(true);
        this.errorMessage.set(this.labels().common.firestoreError);

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
        this.errorMessage.set(this.labels().common.firestoreError);

        return of<MoodEntry[]>([]);
      })
    ),
    { initialValue: [] }
  );
  protected readonly loading = computed(() => !this.patientsLoaded() || !this.moodEntriesLoaded());
  protected readonly patientMoodEntries = computed(() => {
    const patientIds = new Set(this.patients().map((patient) => patient.id));

    return this.moodEntries().filter((entry) => patientIds.has(entry.userId));
  });
  protected readonly metrics = computed<DashboardMetric[]>(() => {
    const patients = this.patients();
    const entries = this.patientMoodEntries();
    const latestEntry = entries[0];

    return [
      {
        label: this.labels().dashboard.totalPatients,
        value: String(patients.length),
        description: this.labels().dashboard.patientsDescription
      },
      {
        label: this.labels().dashboard.moodEntries,
        value: String(entries.length),
        description: this.labels().dashboard.recentMoodEntries
      },
      {
        label: this.labels().dashboard.needsAttention,
        value: String(this.attentionList().length),
        description: this.labels().dashboard.attentionDescription
      },
      {
        label: this.labels().dashboard.latestMood,
        value: latestEntry ? this.formatMood(latestEntry.moodLevel) : this.labels().dashboard.noLatestMood,
        description: latestEntry
          ? `${this.labels().dashboard.lastRecorded}: ${this.formatDate(latestEntry.createdAt)}`
          : this.labels().dashboard.noMoodEntries
      }
    ];
  });
  protected readonly attentionList = computed<AttentionPatient[]>(() => {
    const entriesByUser = this.getEntriesByUser(this.patientMoodEntries());

    return this.patients()
      .map((patient) => {
        const attention = this.attentionService.calculatePatientAttention(entriesByUser.get(patient.id) ?? []);

        return {
          patientId: patient.id,
          patientName: this.getPatientName(patient),
          level: attention.level,
          reasons: attention.reasons,
          needsAttention: attention.needsAttention
        };
      })
      .filter((item) => item.needsAttention)
      .sort((first, second) => {
        const levelOrder: Record<AttentionLevel, number> = {
          high: 0,
          medium: 1,
          none: 2
        };

        return levelOrder[first.level] - levelOrder[second.level] || first.patientName.localeCompare(second.patientName);
      });
  });
  protected readonly recentEntries = computed<RecentMoodEntry[]>(() => {
    const patientsById = new Map(this.patients().map((patient) => [patient.id, patient]));

    return this.patientMoodEntries()
      .slice(0, 5)
      .map((entry) => {
        const patient = patientsById.get(entry.userId);

        return {
          id: entry.id,
          userId: entry.userId,
          patientName: this.getPatientName(patient),
          mood: this.formatMood(entry.moodLevel),
          createdAt: this.formatDate(entry.createdAt)
        };
      });
  });

  private getPatientName(patient: AppUser | undefined): string {
    return patient?.displayName ?? patient?.email ?? patient?.id ?? this.labels().patients.unknownPatient;
  }

  private formatMood(moodLevel: MoodEntry['moodLevel']): string {
    if (moodLevel === undefined) {
      return this.labels().patients.noMood;
    }

    return String(moodLevel);
  }

  protected formatAttentionLevel(level: AttentionLevel): string {
    return this.labels().attention[level];
  }

  private getEntriesByUser(entries: MoodEntry[]): Map<string, MoodEntry[]> {
    const entriesByUser = new Map<string, MoodEntry[]>();

    entries.forEach((entry) => {
      const existing = entriesByUser.get(entry.userId) ?? [];

      existing.push(entry);
      entriesByUser.set(entry.userId, existing);
    });

    return entriesByUser;
  }

  private formatDate(value: unknown): string {
    const date = this.toDate(value);

    if (!date) {
      return this.labels().patients.noEntries;
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
