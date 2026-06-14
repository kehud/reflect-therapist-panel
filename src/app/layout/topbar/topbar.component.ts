import { Component, computed, inject } from '@angular/core';

import { AppLanguageService } from '../../core/services/app-language.service';
import { AuthService } from '../../core/services/firebase/auth.service';

@Component({
  selector: 'app-topbar',
  template: `
    <header class="topbar">
      <div>
        <p>{{ labels().shell.workspace }}</p>
        <h1>{{ labels().appName }}</h1>
      </div>
      <div class="user-summary" [attr.aria-label]="labels().shell.signedIn">
        <strong>{{ userLabel() }}</strong>
        <span aria-hidden="true">|</span>
        <span>{{ roleLabel() }}</span>
      </div>
    </header>
  `,
  styles: `
    :host {
      backdrop-filter: blur(18px);
      background: color-mix(in srgb, var(--app-bg) 86%, transparent);
      border-bottom: 1px solid var(--line);
      display: block;
      position: sticky;
      top: 0;
      z-index: 3;
    }

    .topbar {
      align-items: center;
      display: flex;
      justify-content: space-between;
      min-height: 64px;
      padding: 13px 28px;
    }

    p {
      color: var(--muted);
      font-size: 0.76rem;
      font-weight: 650;
      letter-spacing: 0.06em;
      margin: 0 0 4px;
      text-transform: uppercase;
    }

    h1 {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: 0;
      margin: 0;
    }

    .user-summary {
      align-items: center;
      background: color-mix(in srgb, var(--surface) 76%, transparent);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      display: flex;
      gap: 8px;
      max-width: min(48vw, 520px);
      min-width: 0;
      padding: 8px 12px;
      white-space: nowrap;
    }

    strong {
      color: var(--muted-strong);
      font-size: 0.92rem;
      font-weight: 700;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-summary span {
      color: var(--muted);
      font-size: 0.88rem;
      font-weight: 650;
      white-space: nowrap;
    }

    @media (max-width: 640px) {
      .topbar {
        align-items: flex-start;
        flex-direction: column;
        gap: 12px;
        padding: 16px 20px;
      }

      .user-summary {
        max-width: 100%;
      }
    }

    @media (max-width: 420px) {
      .user-summary {
        width: 100%;
      }
    }
  `
})
export class TopbarComponent {
  private readonly appLanguageService = inject(AppLanguageService);
  private readonly authService = inject(AuthService);

  protected readonly labels = this.appLanguageService.labels;
  protected readonly userLabel = computed(() => {
    const appUser = this.authService.currentAppUser();
    const firebaseUser = this.authService.currentFirebaseUser();

    return (
      appUser?.displayName ??
      appUser?.email ??
      firebaseUser?.displayName ??
      firebaseUser?.email ??
      this.labels().shell.signedIn
    );
  });
  protected readonly roleLabel = computed(() => {
    const role = this.authService.currentAppUser()?.role;

    return role ? this.labels().roles[role] : this.labels().shell.role;
  });
}
