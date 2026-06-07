import { Component } from '@angular/core';

import { APP_LABELS } from '../../shared/utils/app-labels';

@Component({
  selector: 'app-topbar',
  template: `
    <header class="topbar">
      <div>
        <p>{{ labels.shell.workspace }}</p>
        <h1>{{ labels.appName }}</h1>
      </div>
      <span>{{ labels.shell.role }}</span>
    </header>
  `,
  styles: `
    :host {
      background: color-mix(in srgb, var(--app-bg) 84%, transparent);
      border-bottom: 1px solid var(--line);
      display: block;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .topbar {
      align-items: center;
      display: flex;
      justify-content: space-between;
      min-height: 76px;
      padding: 18px 28px;
    }

    p {
      color: var(--muted);
      font-size: 0.8rem;
      font-weight: 650;
      letter-spacing: 0.04em;
      margin: 0 0 4px;
      text-transform: uppercase;
    }

    h1 {
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 0;
      margin: 0;
    }

    span {
      border: 1px solid var(--line);
      border-radius: 999px;
      color: var(--muted);
      font-size: 0.875rem;
      padding: 8px 12px;
      white-space: nowrap;
    }

    @media (max-width: 640px) {
      .topbar {
        align-items: flex-start;
        flex-direction: column;
        gap: 12px;
        padding: 18px 20px;
      }
    }
  `
})
export class TopbarComponent {
  protected readonly labels = APP_LABELS;
}
