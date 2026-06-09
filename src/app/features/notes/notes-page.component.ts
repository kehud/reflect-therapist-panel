import { Component } from '@angular/core';

import { APP_LABELS } from '../../shared/utils/app-labels';

@Component({
  selector: 'app-notes-page',
  template: `
    <section class="page">
      <h2>{{ labels.pages.notesTitle }}</h2>
      <div class="empty-state">
        <h3>No notes yet</h3>
        <p>The therapistNotes collection will be added after Firebase wiring.</p>
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

    .empty-state {
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
export class NotesPageComponent {
  protected readonly labels = APP_LABELS;
}
