import { Injectable } from '@angular/core';

import { ReflectionTemplate } from '../../models/reflection-template.model';

@Injectable({
  providedIn: 'root'
})
export class ReflectionTemplatesService {
  listTemplates(): ReflectionTemplate[] {
    // TODO: Read templates from the existing reflectionTemplates collection.
    return [];
  }

  getTemplate(_templateId: string): ReflectionTemplate | null {
    // TODO: Read one template document from the existing reflectionTemplates collection.
    return null;
  }
}
