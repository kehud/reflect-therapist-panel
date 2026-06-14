import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type LayoutDirection = 'ltr' | 'rtl';

@Injectable({
  providedIn: 'root'
})
export class LayoutDirectionService {
  private static readonly storageKey = 'reflect.layoutDirection';
  private static readonly rtlLanguageCodes = new Set(['ar', 'fa', 'he', 'iw', 'ur', 'yi']);

  private readonly document = inject(DOCUMENT);
  private readonly directionState = signal<LayoutDirection>(this.readInitialDirection());

  readonly direction = this.directionState.asReadonly();

  constructor() {
    this.applyDirection(this.directionState());
  }

  setDirection(direction: LayoutDirection): void {
    this.directionState.set(direction);
    this.writeStoredDirection(direction);
    this.applyDirection(direction);
  }

  setDirectionForLocale(locale: string | null | undefined): void {
    this.setDirection(this.isRtlLocale(locale) ? 'rtl' : 'ltr');
  }

  private readInitialDirection(): LayoutDirection {
    const storedDirection = this.readStoredDirection();

    if (storedDirection) {
      return storedDirection;
    }

    return this.document.documentElement.dir.toLowerCase() === 'rtl' ? 'rtl' : 'ltr';
  }

  private readStoredDirection(): LayoutDirection | null {
    let storedDirection: string | null | undefined;

    try {
      storedDirection = this.getLocalStorage()?.getItem(LayoutDirectionService.storageKey);
    } catch {
      storedDirection = null;
    }

    return storedDirection === 'rtl' || storedDirection === 'ltr' ? storedDirection : null;
  }

  private writeStoredDirection(direction: LayoutDirection): void {
    try {
      this.getLocalStorage()?.setItem(LayoutDirectionService.storageKey, direction);
    } catch {
      return;
    }
  }

  private applyDirection(direction: LayoutDirection): void {
    const root = this.document.documentElement;

    root.dir = direction;
    root.classList.toggle('dir-rtl', direction === 'rtl');
    root.classList.toggle('dir-ltr', direction === 'ltr');
  }

  private isRtlLocale(locale: string | null | undefined): boolean {
    const languageCode = locale?.trim().toLowerCase().split('-')[0];

    return languageCode ? LayoutDirectionService.rtlLanguageCodes.has(languageCode) : false;
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
