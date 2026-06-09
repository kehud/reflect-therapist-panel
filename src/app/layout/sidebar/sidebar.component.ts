import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/firebase/auth.service';
import { APP_LABELS, APP_NAV_ITEMS } from '../../shared/utils/app-labels';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <a class="brand" routerLink="/dashboard" aria-label="Reflect dashboard">
        <span class="brand-mark">R</span>
        <span class="brand-copy">
          <strong>Reflect</strong>
          <small>Therapist Panel</small>
        </span>
      </a>

      <nav class="nav" aria-label="Primary navigation">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="is-active"
            [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
          >
            {{ item.label }}
          </a>
        }
      </nav>

      <div class="sidebar-actions">
        <button type="button" [disabled]="logoutDisabled()" (click)="logout()">
          {{ labels.nav.logout }}
        </button>

        @if (logoutError()) {
          <p role="alert">{{ logoutError() }}</p>
        }
      </div>
    </aside>
  `,
  styles: `
    :host {
      border-inline-end: 1px solid var(--line);
      background: color-mix(in srgb, var(--surface) 88%, var(--app-bg));
      min-height: 100dvh;
    }

    .sidebar {
      display: grid;
      gap: 24px;
      grid-template-rows: auto 1fr auto;
      min-height: 100dvh;
      padding: 20px 18px;
      position: sticky;
      top: 0;
    }

    .brand {
      align-items: center;
      display: flex;
      gap: 11px;
      letter-spacing: 0;
      min-height: 50px;
      padding-inline: 4px;
    }

    .brand-mark {
      align-items: center;
      background: linear-gradient(135deg, var(--accent-strong), var(--accent));
      border-radius: var(--radius-sm);
      box-shadow: 0 8px 18px color-mix(in srgb, var(--accent) 12%, transparent);
      color: #ffffff;
      display: inline-flex;
      height: 34px;
      justify-content: center;
      font-weight: 760;
      width: 34px;
    }

    .brand-copy {
      display: grid;
      gap: 1px;
      line-height: 1.1;
    }

    .brand-copy strong {
      color: var(--text);
      font-size: 1rem;
      font-weight: 760;
    }

    .brand-copy small {
      color: var(--muted);
      font-size: 0.78rem;
      font-weight: 650;
    }

    .nav {
      align-content: start;
      display: grid;
      gap: 4px;
    }

    .nav a {
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      color: var(--muted);
      font-size: 0.94rem;
      font-weight: 650;
      padding: 10px 12px;
    }

    .nav a:hover {
      background: color-mix(in srgb, var(--surface-muted) 62%, transparent);
      color: var(--accent-strong);
    }

    .nav a.is-active {
      background: var(--accent-soft);
      border-color: color-mix(in srgb, var(--accent) 18%, var(--line));
      color: var(--accent-strong);
      box-shadow: inset 3px 0 0 var(--accent);
    }

    .sidebar-actions {
      align-self: end;
      border-top: 1px solid var(--line);
      display: grid;
      gap: 10px;
      padding-top: 16px;
    }

    button {
      background: transparent;
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      color: var(--accent-strong);
      cursor: pointer;
      font-weight: 650;
      min-height: 40px;
      padding: 0 12px;
      text-align: start;
    }

    button:hover {
      background: var(--surface-muted);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    p {
      color: var(--error);
      font-size: 0.8rem;
      margin: 0;
    }

    @media (max-width: 900px) {
      :host {
        border-bottom: 1px solid var(--line);
        border-inline-end: 0;
        min-height: auto;
      }

      .sidebar {
        gap: 18px;
        min-height: auto;
        padding: 18px 20px;
        position: static;
      }

      .nav {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }

      .sidebar-actions {
        border-top: 0;
        padding-top: 0;
      }
    }
  `
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly labels = APP_LABELS;
  protected readonly navItems = APP_NAV_ITEMS;
  protected readonly loggingOut = signal(false);
  protected readonly logoutError = signal('');
  protected readonly logoutDisabled = computed(() => this.loggingOut() || this.authService.loading());

  protected async logout(): Promise<void> {
    this.logoutError.set('');
    this.loggingOut.set(true);

    try {
      await this.authService.logout();
      await this.router.navigateByUrl('/login');
    } catch {
      this.logoutError.set(this.labels.auth.logoutError);
    } finally {
      this.loggingOut.set(false);
    }
  }
}
