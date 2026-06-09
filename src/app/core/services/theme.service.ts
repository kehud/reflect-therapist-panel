import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private static readonly storageKey = 'reflect.theme';

  private readonly document = inject(DOCUMENT);
  private readonly themeState = signal<AppTheme>(this.readStoredTheme());

  readonly theme = this.themeState.asReadonly();

  constructor() {
    this.applyTheme(this.themeState());
  }

  setTheme(theme: AppTheme): void {
    this.themeState.set(theme);
    this.writeStoredTheme(theme);
    this.applyTheme(theme);
  }

  private readStoredTheme(): AppTheme {
    let storedTheme: string | null | undefined;

    try {
      storedTheme = this.getLocalStorage()?.getItem(ThemeService.storageKey);
    } catch {
      storedTheme = null;
    }

    return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
  }

  private writeStoredTheme(theme: AppTheme): void {
    try {
      this.getLocalStorage()?.setItem(ThemeService.storageKey, theme);
    } catch {
      return;
    }
  }

  private applyTheme(theme: AppTheme): void {
    const root = this.document.documentElement;

    root.classList.toggle('theme-dark', theme === 'dark');
    root.classList.toggle('theme-light', theme === 'light');
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
