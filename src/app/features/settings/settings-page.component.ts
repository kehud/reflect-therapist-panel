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
      gap: 22px;
    }

    h2,
    h3,
    p {
      margin: 0;
    }

    h2 {
      font-size: 1.95rem;
      font-weight: 720;
      letter-spacing: 0;
    }

    .settings-panel {
      background:
        linear-gradient(135deg, color-mix(in srgb, var(--accent-soft) 54%, transparent), transparent 74%),
        var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      display: grid;
      gap: 8px;
      max-width: 680px;
      padding: 22px;
    }

    h3 {
      font-size: 1rem;
    }

    p {
      color: var(--muted);
      line-height: 1.55;
    }
  `
})
export class SettingsPageComponent {
  protected readonly labels = APP_LABELS;
}
