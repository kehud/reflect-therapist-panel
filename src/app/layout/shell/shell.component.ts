import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell">
      <app-sidebar />

      <div class="workspace">
        <app-topbar />
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
    }

    .shell {
      background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--accent-soft) 78%, transparent) 0 260px, transparent 380px),
        var(--app-bg);
      display: grid;
      grid-template-columns: 248px minmax(0, 1fr);
      min-height: 100dvh;
    }

    .workspace {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      min-width: 0;
    }

    .content {
      margin-inline: auto;
      max-width: none;
      padding: 24px 28px 40px;
      width: 100%;
    }

    @media (max-width: 900px) {
      .shell {
        grid-template-columns: 1fr;
      }

      .content {
        padding: 24px 20px 36px;
      }
    }

    @media (max-width: 640px) {
      .content {
        padding-inline: 16px;
      }
    }
  `
})
export class ShellComponent {}
