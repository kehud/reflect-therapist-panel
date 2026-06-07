import { Component } from '@angular/core';

import { APP_LABELS } from '../../../shared/utils/app-labels';

@Component({
  selector: 'app-login',
  template: `
    <section class="login-page">
      <div class="login-panel">
        <p class="eyebrow">{{ labels.appName }}</p>
        <h1>{{ labels.pages.loginTitle }}</h1>
        <p class="intro">{{ labels.pages.loginSubtitle }}</p>

        <form class="login-form">
          <label>
            Email
            <input type="email" placeholder="therapist@example.com" disabled />
          </label>
          <label>
            Password
            <input type="password" placeholder="Password" disabled />
          </label>
          <button type="button" disabled>Sign in</button>
        </form>

        <p class="note">Firebase authentication will be connected later.</p>
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
    .note {
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
      margin: 28px 0 18px;
    }

    label {
      color: var(--muted);
      display: grid;
      gap: 8px;
      font-size: 0.875rem;
    }

    input,
    button {
      border-radius: 8px;
      min-height: 44px;
      padding: 0 14px;
    }

    input {
      background: var(--surface-muted);
      border: 1px solid var(--line);
      color: var(--text);
    }

    button {
      background: var(--accent);
      border: 0;
      color: var(--surface);
      cursor: not-allowed;
      font-weight: 650;
      opacity: 0.7;
    }
  `
})
export class LoginComponent {
  protected readonly labels = APP_LABELS;
}
