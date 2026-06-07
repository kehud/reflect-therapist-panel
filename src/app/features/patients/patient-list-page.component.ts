import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_LABELS } from '../../shared/utils/app-labels';

@Component({
  selector: 'app-patient-list-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="heading">
        <h2>{{ labels.pages.patientsTitle }}</h2>
        <p>All therapists can view all patients for the MVP.</p>
      </div>

      <div class="table" role="table" aria-label="Patients placeholder">
        <div class="row header" role="row">
          <span role="columnheader">Patient</span>
          <span role="columnheader">Latest mood</span>
          <span role="columnheader">Status</span>
        </div>
        <a class="row" routerLink="/patients/demo-patient" role="row">
          <span role="cell">Demo patient</span>
          <span role="cell">Pending Firebase</span>
          <span role="cell">Placeholder</span>
        </a>
      </div>
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
    .row {
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
      grid-template-columns: 1.3fr 1fr 1fr;
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

    @media (max-width: 720px) {
      .row {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class PatientListPageComponent {
  protected readonly labels = APP_LABELS;
}
