// src/app/components/cv-templates/template-registry.ts
import { CvTemplate } from 'src/app/models/cv-template.model';
import { CvTemplateModernComponent } from './template-modern/cv-template-modern.component';
import { CvTemplateClassicComponent } from './template-classic/cv-template-classic.component';

export const CV_TEMPLATES: CvTemplate[] = [
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Template moderne avec un design coloré et dynamique',
    imageUrl: 'assets/templates/modern-preview.png',
    category: 'modern',
    component: CvTemplateModernComponent
  },
  {
    id: 'classic',
    name: 'Classique',
    description: 'Template traditionnel et professionnel',
    imageUrl: 'assets/templates/classic-preview.png',
    category: 'classic',
    component: CvTemplateClassicComponent
  }
];

export function getTemplateById(id: string): CvTemplate | undefined {
  return CV_TEMPLATES.find(template => template.id === id);
}

export function getTemplateComponent(id: string): any {
  const template = getTemplateById(id);
  return template?.component;
}