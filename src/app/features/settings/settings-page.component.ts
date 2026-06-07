import { Component } from '@angular/core';

import { APP_LABELS } from '../../shared/utils/app-labels';

@Component({
  selector: 'app-settings-page',
  template: `
    <section class="page">
      <h2>{{ labels.pages.settingsTitle }}</h2>
      <div class="settings-panel">
        <h3>Panel settings</h3>
        <p>Language, RTL, and admin controls will be added in later phases.</p>
      </div>
    </section>
  `,
  styles: `
    .page {
      display: grid;
      gap: 20px;
    }

    h2,
    h3,
    p {
      margin: 0;
    }

    h2 {
      font-size: 2rem;
      letter-spacing: 0;
    }

    .settings-panel {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
      display: grid;
      gap: 8px;
      padding: 24px;
    }

    p {
      color: var(--muted);
    }
  `
})
export class SettingsPageComponent {
  protected readonly labels = APP_LABELS;
}
