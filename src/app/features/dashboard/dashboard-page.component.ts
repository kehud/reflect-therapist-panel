import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_LABELS } from '../../shared/utils/app-labels';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="heading">
        <p>Overview</p>
        <h2>{{ labels.pages.dashboardTitle }}</h2>
      </div>

      <div class="cards" aria-label="Dashboard quick links">
        <a routerLink="/patients">
          <strong>Patients</strong>
          <span>View all patient profiles.</span>
        </a>
        <a routerLink="/notes">
          <strong>Notes</strong>
          <span>Prepare therapist note workflows.</span>
        </a>
        <a routerLink="/templates">
          <strong>Templates</strong>
          <span>Review reflection template placeholders.</span>
        </a>
      </div>
    </section>
  `,
  styles: `
    .page {
      display: grid;
      gap: 24px;
    }

    .heading p,
    .cards span {
      color: var(--muted);
    }

    .heading p {
      margin: 0 0 6px;
    }

    h2 {
      font-size: 2rem;
      letter-spacing: 0;
      margin: 0;
    }

    .cards {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .cards a {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
      display: grid;
      gap: 8px;
      min-height: 132px;
      padding: 20px;
    }

    .cards a:hover {
      border-color: var(--accent);
    }

    @media (max-width: 900px) {
      .cards {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class DashboardPageComponent {
  protected readonly labels = APP_LABELS;
}
