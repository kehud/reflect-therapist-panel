import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/firebase/auth.service';
import { APP_LABELS } from '../../../shared/utils/app-labels';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <section class="login-page">
      <div class="login-panel">
        <p class="eyebrow">{{ labels.appName }}</p>
        <h1>{{ labels.pages.loginTitle }}</h1>
        <p class="intro">{{ labels.pages.loginSubtitle }}</p>

        <form class="login-form" (ngSubmit)="login()" novalidate>
          <label>
            {{ labels.auth.email }}
            <input
              type="email"
              name="email"
              autocomplete="email"
              [placeholder]="labels.auth.emailPlaceholder"
              [disabled]="isBusy()"
              [ngModel]="email()"
              (ngModelChange)="email.set($event)"
            />
          </label>
          <label>
            {{ labels.auth.password }}
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              [placeholder]="labels.auth.passwordPlaceholder"
              [disabled]="isBusy()"
              [ngModel]="password()"
              (ngModelChange)="password.set($event)"
            />
          </label>
          <button type="submit" [disabled]="isBusy()">
            {{ submitting() ? labels.auth.signingIn : labels.auth.signIn }}
          </button>
        </form>

        <button class="link-button" type="button" [disabled]="isBusy()" (click)="sendPasswordReset()">
          {{ sendingReset() ? labels.auth.sendingReset : labels.auth.forgotPassword }}
        </button>

        @if (errorMessage()) {
          <p class="message error" role="alert">{{ errorMessage() }}</p>
        }

        @if (successMessage()) {
          <p class="message success" role="status">{{ successMessage() }}</p>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
    }

    .login-page {
      display: grid;
      min-height: 100dvh;
      place-items: center;
      padding: 32px;
    }

    .login-panel {
      width: min(100%, 420px);
      padding: 32px;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow-soft);
    }

    .eyebrow,
    .message {
      color: var(--muted);
      font-size: 0.875rem;
      margin: 0;
    }

    h1 {
      font-size: 2rem;
      font-weight: 650;
      letter-spacing: 0;
      margin: 12px 0 8px;
    }

    .intro {
      color: var(--muted);
      line-height: 1.55;
      margin: 0;
    }

    .login-form {
      display: grid;
      gap: 16px;
      margin: 28px 0 12px;
    }

    label {
      color: var(--muted);
      display: grid;
      gap: 8px;
      font-size: 0.875rem;
    }

    input {
      border-radius: 8px;
      min-height: 44px;
      padding: 0 14px;
    }

    input {
      background: var(--surface-muted);
      border: 1px solid var(--line);
      color: var(--text);
    }

    .login-form button {
      background: var(--accent);
      border: 0;
      color: var(--surface);
      cursor: pointer;
      font-weight: 650;
      min-height: 44px;
      border-radius: 8px;
      padding: 0 14px;
    }

    button:disabled,
    input:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    .link-button {
      background: transparent;
      border: 0;
      color: var(--accent-strong);
      cursor: pointer;
      font-weight: 650;
      padding: 0;
    }

    .message {
      border-radius: 8px;
      margin-top: 16px;
      padding: 12px 14px;
    }

    .error {
      background: color-mix(in srgb, #c0392b 12%, var(--surface));
      color: #8f2f24;
    }

    .success {
      background: color-mix(in srgb, var(--accent) 12%, var(--surface));
      color: var(--accent-strong);
    }
  `
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly labels = APP_LABELS;
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly submitting = signal(false);
  protected readonly sendingReset = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isBusy = computed(() => {
    return this.submitting() || this.sendingReset() || this.authService.loading();
  });

  protected async login(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');

    const email = this.email().trim();
    const password = this.password();

    if (!email || !password) {
      this.errorMessage.set(this.labels.auth.missingCredentials);
      return;
    }

    this.submitting.set(true);

    try {
      await this.authService.login(email, password);

      if (!this.authService.isTherapistOrAdmin()) {
        await this.authService.logout().catch(() => undefined);
        this.errorMessage.set(this.labels.auth.accessDenied);
        return;
      }

      await this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.errorMessage.set(this.mapAuthError(error));
    } finally {
      this.submitting.set(false);
    }
  }

  protected async sendPasswordReset(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');

    const email = this.email().trim();

    if (!email) {
      this.errorMessage.set(this.labels.auth.missingEmail);
      return;
    }

    this.sendingReset.set(true);

    try {
      await this.authService.forgotPassword(email);
      this.successMessage.set(this.labels.auth.resetSent);
    } catch (error) {
      this.errorMessage.set(this.mapAuthError(error));
    } finally {
      this.sendingReset.set(false);
    }
  }

  private mapAuthError(error: unknown): string {
    const code = this.getErrorCode(error);

    switch (code) {
      case 'auth/invalid-email':
        return this.labels.auth.invalidEmail;
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return this.labels.auth.invalidCredentials;
      case 'auth/too-many-requests':
        return this.labels.auth.tooManyRequests;
      case 'auth/network-request-failed':
        return this.labels.auth.networkError;
      default:
        return this.labels.auth.genericError;
    }
  }

  private getErrorCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return undefined;
    }

    const code = (error as { code?: unknown }).code;

    return typeof code === 'string' ? code : undefined;
  }
}
