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
      gap: 20px;
    }

    h2,
    h3,
    p {
      margin: 0;
    }

    h2 {
      font-size: 2rem;
      letter-spacing: 0;
    }

    .empty-state {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
      display: grid;
      gap: 8px;
      padding: 24px;
    }

    p {
      color: var(--muted);
    }
  `
})
export class NotesPageComponent {
  protected readonly labels = APP_LABELS;
}
