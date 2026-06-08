export type ReflectionTemplateTranslation = {
  title?: string;
  body?: string;
};

export interface ReflectionTemplate {
  id: string;
  label?: string;
  type?: string;
  translations?: {
    en?: ReflectionTemplateTranslation;
    he?: ReflectionTemplateTranslation;
  };
  minCheckins?: number;
  order?: number;
  isActive?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}
