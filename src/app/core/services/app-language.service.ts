import { DOCUMENT } from '@angular/common';
import { computed, Injectable, inject, signal } from '@angular/core';

import { APP_LANGUAGE_LABELS, type AppLanguage } from '../../shared/utils/app-labels';
import { LayoutDirectionService } from './layout-direction.service';

export type { AppLanguage } from '../../shared/utils/app-labels';

@Injectable({
  providedIn: 'root'
})
export class AppLanguageService {
  private static readonly storageKey = 'reflect.language';

  private readonly document = inject(DOCUMENT);
  private readonly layoutDirectionService = inject(LayoutDirectionService);
  private readonly languageState = signal<AppLanguage>(this.readInitialLanguage());

  readonly language = this.languageState.asReadonly();
  readonly labels = computed(() => APP_LANGUAGE_LABELS[this.languageState()]);

  constructor() {
    this.applyLanguage(this.languageState());
  }

  setLanguage(language: AppLanguage): void {
    this.languageState.set(language);
    this.writeStoredLanguage(language);
    this.applyLanguage(language);
  }

  private readInitialLanguage(): AppLanguage {
    const storedLanguage = this.readStoredLanguage();

    if (storedLanguage) {
      return storedLanguage;
    }

    return this.layoutDirectionService.direction() === 'rtl' ? 'he' : 'en';
  }

  private readStoredLanguage(): AppLanguage | null {
    let storedLanguage: string | null | undefined;

    try {
      storedLanguage = this.getLocalStorage()?.getItem(AppLanguageService.storageKey);
    } catch {
      storedLanguage = null;
    }

    return storedLanguage === 'he' || storedLanguage === 'en' ? storedLanguage : null;
  }

  private writeStoredLanguage(language: AppLanguage): void {
    try {
      this.getLocalStorage()?.setItem(AppLanguageService.storageKey, language);
    } catch {
      return;
    }
  }

  private applyLanguage(language: AppLanguage): void {
    const root = this.document.documentElement;

    root.lang = language === 'he' ? 'he' : 'en';
    this.layoutDirectionService.setDirection(language === 'he' ? 'rtl' : 'ltr');
  }

  private getLocalStorage(): Storage | null {
    const defaultView = this.document.defaultView;

    if (!defaultView) {
      return null;
    }

    try {
      return defaultView.localStorage;
    } catch {
      return null;
    }
  }
}
