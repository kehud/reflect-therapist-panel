import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';

import { ReflectionTemplate } from '../../core/models/reflection-template.model';
import { ReflectionTemplatesService } from '../../core/services/firebase/reflection-templates.service';
import { APP_LABELS } from '../../shared/utils/app-labels';

type TemplateView = {
  id: string;
  title: string;
  body: string;
  type: string;
  minCheckins: string;
};

@Component({
  selector: 'app-reflection-templates-page',
  imports: [FormsModule],
  template: `
    <section class="page">
      <div class="heading">
        <h2>{{ labels.pages.templatesTitle }}</h2>
        <p>{{ labels.templates.subtitle }}</p>
      </div>

      @if (errorMessage()) {
        <p class="message error" role="alert">{{ errorMessage() }}</p>
      }

      @if (loading()) {
        <p class="message">{{ labels.common.loading }}</p>
      }

      <div class="summary" aria-label="Template summary">
        <article>
          <span>{{ labels.templates.totalTemplates }}</span>
          <strong>{{ templates().length }}</strong>
        </article>
        <article>
          <span>{{ labels.templates.activeTemplates }}</span>
          <strong>{{ templates().length }}</strong>
        </article>
      </div>

      <label class="search">
        {{ labels.templates.search }}
        <input
          type="search"
          name="templateSearch"
          [placeholder]="labels.templates.searchPlaceholder"
          [ngModel]="searchText()"
          (ngModelChange)="searchText.set($event)"
        />
      </label>

      @if (!loading()) {
        @if (templates().length === 0) {
          <p class="message">{{ labels.templates.noTemplates }}</p>
        } @else if (filteredTemplates().length === 0) {
          <p class="message">{{ labels.templates.noSearchResults }}</p>
        } @else {
          <div class="templates">
            @for (template of filteredTemplates(); track template.id) {
              <article>
                <div class="template-heading">
                  <h3>{{ template.title }}</h3>
                  <span>{{ template.type }}</span>
                </div>
                <p>{{ template.body }}</p>
                <dl>
                  <div>
                    <dt>{{ labels.templates.type }}</dt>
                    <dd>{{ template.type }}</dd>
                  </div>
                  <div>
                    <dt>{{ labels.templates.minCheckins }}</dt>
                    <dd>{{ template.minCheckins }}</dd>
                  </div>
                </dl>
              </article>
            }
          </div>
        }
      }
    </section>
  `,
  styles: `
    .page,
    .heading,
    .templates {
      display: grid;
      gap: 16px;
    }

    h2,
    h3,
    p,
    dl,
    dd {
      margin: 0;
    }

    h2 {
      font-size: 2rem;
      letter-spacing: 0;
    }

    h3 {
      font-size: 1.1rem;
      letter-spacing: 0;
    }

    .heading p,
    .message,
    article p,
    dt,
    .summary span {
      color: var(--muted);
    }

    .summary {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    article {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
      display: grid;
      gap: 14px;
      padding: 20px;
    }

    .summary article {
      gap: 8px;
    }

    .summary strong {
      font-size: 2rem;
      letter-spacing: 0;
    }

    .search {
      color: var(--muted);
      display: grid;
      gap: 8px;
      font-size: 0.875rem;
      max-width: 520px;
    }

    input {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--text);
      min-height: 44px;
      padding: 0 14px;
    }

    .template-heading {
      align-items: center;
      display: flex;
      gap: 12px;
      justify-content: space-between;
    }

    .template-heading span {
      border: 1px solid var(--line);
      border-radius: 999px;
      color: var(--muted);
      font-size: 0.875rem;
      padding: 6px 10px;
      white-space: nowrap;
    }

    dl {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    dt {
      font-size: 0.8rem;
      font-weight: 650;
      margin-bottom: 4px;
    }

    dd {
      color: var(--text);
      font-weight: 650;
    }

    .error {
      color: #8f2f24;
    }

    @media (max-width: 720px) {
      .summary,
      dl {
        grid-template-columns: 1fr;
      }

      .template-heading {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `
})
export class ReflectionTemplatesPageComponent {
  private readonly reflectionTemplatesService = inject(ReflectionTemplatesService);
  private readonly templatesLoaded = signal(false);

  protected readonly labels = APP_LABELS;
  protected readonly searchText = signal('');
  protected readonly errorMessage = signal('');
  protected readonly templates = toSignal(
    this.reflectionTemplatesService.streamActiveTemplates().pipe(
      tap(() => this.templatesLoaded.set(true)),
      catchError(() => {
        this.templatesLoaded.set(true);
        this.errorMessage.set(this.labels.common.firestoreError);

        return of<ReflectionTemplate[]>([]);
      })
    ),
    { initialValue: [] }
  );
  protected readonly loading = computed(() => !this.templatesLoaded());
  protected readonly templateViews = computed<TemplateView[]>(() => {
    return this.templates().map((template) => this.toTemplateView(template));
  });
  protected readonly filteredTemplates = computed<TemplateView[]>(() => {
    const search = this.searchText().trim().toLocaleLowerCase();

    if (!search) {
      return this.templateViews();
    }

    return this.templateViews().filter((template) => {
      return [template.title, template.body, template.type].some((value) => value.toLocaleLowerCase().includes(search));
    });
  });

  private toTemplateView(template: ReflectionTemplate): TemplateView {
    const english = template.translations?.en;

    return {
      id: template.id,
      title: english?.title ?? template.label ?? this.labels.templates.untitled,
      body: english?.body ?? this.labels.templates.noBody,
      type: template.type ?? this.labels.patientDetails.none,
      minCheckins: template.minCheckins === undefined ? this.labels.patientDetails.none : String(template.minCheckins)
    };
  }
}
