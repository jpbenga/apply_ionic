// src/app/services/cv-template.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CvTemplate } from 'src/app/models/cv-template.model';
import { CV_TEMPLATES, getTemplateById, getTemplateComponent } from '../../components/cv-template/template-registry';

@Injectable({
  providedIn: 'root'
})
export class CvTemplateService {

  constructor() { }

  getAvailableTemplates(): Observable<CvTemplate[]> {
    return of(CV_TEMPLATES);
  }

  getTemplateById(id: string): CvTemplate | undefined {
    return getTemplateById(id);
  }

  getTemplateComponent(id: string): any {
    return getTemplateComponent(id);
  }

  getTemplatesByCategory(category: string): Observable<CvTemplate[]> {
    const filtered = CV_TEMPLATES.filter(template => template.category === category);
    return of(filtered);
  }
}