import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';

import { ReflectionTemplate } from '../../core/models/reflection-template.model';
import { AppLanguageService } from '../../core/services/app-language.service';
import { ReflectionTemplatesService } from '../../core/services/firebase/reflection-templates.service';

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
        <h2>{{ labels().pages.templatesTitle }}</h2>
        <p>{{ labels().templates.subtitle }}</p>
      </div>

      @if (errorMessage()) {
        <p class="message error" role="alert">{{ errorMessage() }}</p>
      }

      @if (loading()) {
        <p class="message">{{ labels().common.loading }}</p>
      }

      <div class="summary" [attr.aria-label]="labels().pages.templatesTitle">
        <article class="summary-card">
          <span>{{ labels().templates.totalTemplates }}</span>
          <strong>{{ templates().length }}</strong>
        </article>
        <article class="summary-card">
          <span>{{ labels().templates.activeTemplates }}</span>
          <strong>{{ templates().length }}</strong>
        </article>
      </div>

      <label class="search">
        {{ labels().templates.search }}
        <input
          type="search"
          name="templateSearch"
          [placeholder]="labels().templates.searchPlaceholder"
          [ngModel]="searchText()"
          (ngModelChange)="searchText.set($event)"
        />
      </label>

      @if (!loading()) {
        @if (templates().length === 0) {
          <p class="message">{{ labels().templates.noTemplates }}</p>
        } @else if (filteredTemplates().length === 0) {
          <p class="message">{{ labels().templates.noSearchResults }}</p>
        } @else {
          <div class="templates">
            @for (template of filteredTemplates(); track template.id) {
              <article class="template-card">
                <div class="template-heading">
                  <h3>{{ template.title }}</h3>
                  <span class="type-pill">{{ template.type }}</span>
                </div>
                <p>{{ template.body }}</p>
                <dl>
                  <div>
                    <dt>{{ labels().templates.type }}</dt>
                    <dd>{{ template.type }}</dd>
                  </div>
                  <div>
                    <dt>{{ labels().templates.minCheckins }}</dt>
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
      gap: var(--template-grid-gap, 16px);
    }

    .page {
      --template-grid-gap: 16px;
      gap: 18px;
    }

    h2,
    h3,
    p,
    dl,
    dd {
      margin: 0;
    }

    h2 {
      font-size: 1.95rem;
      font-weight: 720;
      letter-spacing: 0;
    }

    h3 {
      font-size: 1rem;
      font-weight: 720;
      letter-spacing: 0;
    }

    .heading p,
    .message,
    article p,
    dt,
    .summary span {
      color: var(--muted);
    }

    .heading p {
      line-height: 1.55;
      max-width: 700px;
    }

    .summary {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .summary-card,
    .template-card {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      display: grid;
      gap: 14px;
      padding: 18px;
    }

    .summary-card {
      background:
        linear-gradient(135deg, color-mix(in srgb, var(--accent-soft) 52%, transparent), transparent 76%),
        var(--surface);
      gap: 8px;
    }

    .summary strong {
      font-size: 1.9rem;
      font-weight: 730;
      letter-spacing: 0;
      line-height: 1.05;
    }

    .search {
      background: color-mix(in srgb, var(--surface) 84%, transparent);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      color: var(--muted-strong);
      display: grid;
      gap: 8px;
      font-size: 0.875rem;
      font-weight: 650;
      justify-self: start;
      max-width: 100%;
      padding: 14px;
      width: calc((100% - 32px) / 3);
    }

    input {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      color: var(--text);
      min-height: 44px;
      padding: 0 14px;
    }

    input::placeholder {
      color: var(--muted);
    }

    .templates {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      justify-content: start;
    }

    .template-heading {
      align-items: center;
      display: flex;
      gap: 12px;
      justify-content: space-between;
    }

    .template-card p {
      line-height: 1.6;
    }

    .type-pill {
      background: var(--accent-soft);
      border: 1px solid var(--line);
      border-radius: 999px;
      color: var(--accent-strong);
      font-size: 0.78rem;
      font-weight: 750;
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

    .message {
      background: color-mix(in srgb, var(--surface) 80%, transparent);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      margin: 0;
      padding: 13px 15px;
    }

    .error {
      background: var(--error-soft);
      border-color: color-mix(in srgb, var(--error) 24%, var(--line));
      color: var(--error);
    }

    @media (max-width: 1080px) {
      .search {
        width: calc((100% - 16px) / 2);
      }

      .templates {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 720px) {
      .templates {
        grid-template-columns: 1fr;
      }

      .search {
        width: 100%;
      }
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
  private readonly appLanguageService = inject(AppLanguageService);
  private readonly reflectionTemplatesService = inject(ReflectionTemplatesService);
  private readonly templatesLoaded = signal(false);

  protected readonly labels = this.appLanguageService.labels;
  protected readonly searchText = signal('');
  protected readonly errorMessage = signal('');
  protected readonly templates = toSignal(
    this.reflectionTemplatesService.streamActiveTemplates().pipe(
      tap(() => this.templatesLoaded.set(true)),
      catchError(() => {
        this.templatesLoaded.set(true);
        this.errorMessage.set(this.labels().common.firestoreError);

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
      title: english?.title ?? template.label ?? this.labels().templates.untitled,
      body: english?.body ?? this.labels().templates.noBody,
      type: template.type ?? this.labels().patientDetails.none,
      minCheckins: template.minCheckins === undefined ? this.labels().patientDetails.none : String(template.minCheckins)
    };
  }
}
