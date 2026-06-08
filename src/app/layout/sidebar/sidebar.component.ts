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
        <span>{{ labels.appName }}</span>
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
      background: var(--surface);
      min-height: 100dvh;
    }

    .sidebar {
      display: grid;
      gap: 32px;
      min-height: calc(100dvh - 48px);
      padding: 24px;
      position: sticky;
      top: 0;
    }

    .brand {
      align-items: center;
      display: flex;
      font-weight: 700;
      gap: 12px;
      letter-spacing: 0;
    }

    .brand-mark {
      align-items: center;
      background: var(--accent);
      border-radius: 8px;
      color: var(--surface);
      display: inline-flex;
      height: 36px;
      justify-content: center;
      width: 36px;
    }

    .nav {
      display: grid;
      gap: 6px;
    }

    .nav a {
      border-radius: 8px;
      color: var(--muted);
      font-weight: 600;
      padding: 11px 12px;
    }

    .nav a:hover,
    .nav a.is-active {
      background: var(--surface-muted);
      color: var(--accent-strong);
    }

    .sidebar-actions {
      align-self: end;
      display: grid;
      gap: 10px;
    }

    button {
      background: transparent;
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--accent-strong);
      cursor: pointer;
      font-weight: 650;
      min-height: 42px;
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
      color: #8f2f24;
      font-size: 0.8rem;
      margin: 0;
    }

    @media (max-width: 900px) {
      :host {
        min-height: auto;
      }

      .sidebar {
        gap: 18px;
        min-height: auto;
        position: static;
      }

      .nav {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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
