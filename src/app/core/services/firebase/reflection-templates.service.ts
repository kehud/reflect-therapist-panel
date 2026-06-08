import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore, query, where } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

import { ReflectionTemplate, ReflectionTemplateTranslation } from '../../models/reflection-template.model';

type ReflectionTemplateDocument = Partial<ReflectionTemplate> & Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class ReflectionTemplatesService {
  private readonly firestore = inject(Firestore);

  streamActiveTemplates(): Observable<ReflectionTemplate[]> {
    const templatesRef = collection(this.firestore, 'reflectionTemplates');
    const activeTemplatesQuery = query(templatesRef, where('isActive', '==', true));

    return collectionData(activeTemplatesQuery, { idField: 'id' }).pipe(
      map((templates) => {
        return (templates as ReflectionTemplateDocument[])
          .map((template) => this.toReflectionTemplate(template))
          .sort((first, second) => this.readOrder(first.order) - this.readOrder(second.order));
      })
    );
  }

  private toReflectionTemplate(data: ReflectionTemplateDocument): ReflectionTemplate {
    return {
      id: this.readString(data['id']) ?? '',
      label: this.readString(data['label']),
      type: this.readString(data['type']),
      translations: this.readTranslations(data['translations']),
      minCheckins: this.readNumber(data['minCheckins']),
      order: this.readNumber(data['order']),
      isActive: data['isActive'] === true,
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt']
    };
  }

  private readTranslations(value: unknown): ReflectionTemplate['translations'] {
    if (typeof value !== 'object' || value === null) {
      return undefined;
    }

    const translations = value as Record<string, unknown>;

    return {
      en: this.readTranslation(translations['en']),
      he: this.readTranslation(translations['he'])
    };
  }

  private readTranslation(value: unknown): ReflectionTemplateTranslation | undefined {
    if (typeof value !== 'object' || value === null) {
      return undefined;
    }

    const translation = value as Record<string, unknown>;

    return {
      title: this.readString(translation['title']),
      body: this.readString(translation['body'])
    };
  }

  private readOrder(value: number | undefined): number {
    return typeof value === 'number' ? value : Number.MAX_SAFE_INTEGER;
  }

  private readNumber(value: unknown): number | undefined {
    return typeof value === 'number' ? value : undefined;
  }

  private readString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  }
}
