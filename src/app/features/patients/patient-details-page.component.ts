import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { APP_LABELS } from '../../shared/utils/app-labels';

@Component({
  selector: 'app-patient-details-page',
  template: `
    <section class="page">
      <div>
        <p class="eyebrow">Patient ID</p>
        <h2>{{ labels.pages.patientDetailsTitle }}</h2>
        <p class="patient-id">{{ patientId }}</p>
      </div>

      <div class="sections">
        <article>
          <h3>Mood entries</h3>
          <p>Will read from the existing moodEntries collection.</p>
        </article>
        <article>
          <h3>Moments</h3>
          <p>Will read from the existing moments collection.</p>
        </article>
        <article>
          <h3>Assignments</h3>
          <p>Will use the future therapistAssignments collection.</p>
        </article>
      </div>
    </section>
  `,
  styles: `
    .page {
      display: grid;
      gap: 24px;
    }

    h2,
    h3,
    p {
      margin: 0;
    }

    h2 {
      font-size: 2rem;
      letter-spacing: 0;
      margin: 4px 0 8px;
    }

    .eyebrow,
    .patient-id,
    article p {
      color: var(--muted);
    }

    .eyebrow {
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .sections {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    article {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
      display: grid;
      gap: 8px;
      padding: 20px;
    }

    @media (max-width: 900px) {
      .sections {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class PatientDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly labels = APP_LABELS;
  protected readonly patientId = this.route.snapshot.paramMap.get('id') ?? 'unknown';
}
