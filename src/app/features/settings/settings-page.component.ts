import { Component, inject } from '@angular/core';

import { type AppTheme, ThemeService } from '../../core/services/theme.service';
import { APP_LABELS } from '../../shared/utils/app-labels';

@Component({
  selector: 'app-settings-page',
  template: `
    <section class="page">
      <h2>{{ labels.pages.settingsTitle }}</h2>
      <div class="settings-panel">
        <h3>{{ labels.settings.panelSettings }}</h3>
        <p>{{ labels.settings.panelDescription }}</p>

        <div class="setting-row">
          <span class="setting-copy">
            <strong>{{ labels.settings.theme }}</strong>
            <small>{{ labels.settings.themeDescription }}</small>
          </span>

          <span class="theme-toggle" role="group" [attr.aria-label]="labels.settings.theme">
            <button
              type="button"
              [class.is-active]="currentTheme() === 'light'"
              [attr.aria-pressed]="currentTheme() === 'light'"
              (click)="setTheme('light')"
            >
              {{ labels.settings.light }}
            </button>
            <button
              type="button"
              [class.is-active]="currentTheme() === 'dark'"
              [attr.aria-pressed]="currentTheme() === 'dark'"
              (click)="setTheme('dark')"
            >
              {{ labels.settings.dark }}
            </button>
          </span>
        </div>
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

    .setting-row {
      align-items: center;
      background: color-mix(in srgb, var(--surface-raised) 82%, transparent);
      border: 1px solid color-mix(in srgb, var(--line) 78%, transparent);
      border-radius: var(--radius-md);
      display: flex;
      gap: 18px;
      justify-content: space-between;
      margin-top: 10px;
      padding: 14px;
    }

    .setting-copy {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    h3 {
      font-size: 1rem;
    }

    strong {
      color: var(--text);
      font-size: 0.95rem;
      font-weight: 700;
    }

    p {
      color: var(--muted);
      line-height: 1.55;
    }

    small {
      color: var(--muted);
      line-height: 1.45;
    }

    .theme-toggle {
      background: color-mix(in srgb, var(--surface-muted) 72%, transparent);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      display: inline-grid;
      flex: 0 0 auto;
      gap: 4px;
      grid-template-columns: repeat(2, minmax(78px, 1fr));
      padding: 4px;
    }

    button {
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      color: var(--muted-strong);
      cursor: pointer;
      font-weight: 650;
      min-height: 36px;
      padding: 0 12px;
    }

    button:hover {
      background: color-mix(in srgb, var(--surface) 72%, transparent);
      color: var(--accent-strong);
    }

    button.is-active {
      background: var(--surface);
      border-color: color-mix(in srgb, var(--accent) 28%, var(--line));
      box-shadow: 0 6px 14px color-mix(in srgb, var(--accent) 10%, transparent);
      color: var(--accent-strong);
    }

    @media (max-width: 640px) {
      .setting-row {
        align-items: stretch;
        flex-direction: column;
      }

      .theme-toggle {
        width: 100%;
      }
    }
  `
})
export class SettingsPageComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly labels = APP_LABELS;
  protected readonly currentTheme = this.themeService.theme;

  protected setTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
  }
}
