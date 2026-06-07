import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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

    @media (max-width: 900px) {
      :host {
        min-height: auto;
      }

      .sidebar {
        gap: 18px;
        position: static;
      }

      .nav {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }
    }
  `
})
export class SidebarComponent {
  protected readonly labels = APP_LABELS;
  protected readonly navItems = APP_NAV_ITEMS;
}
