// src/app/components/cv-template-selector/cv-template-selector.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvTemplate } from 'src/app/models/cv-template.model';
import { CvTemplateService } from 'src/app/services/cv-template/cv-template.service';

@Component({
  selector: 'app-cv-template-selector',
  templateUrl: './cv-template-selector.component.html',
  styleUrls: ['./cv-template-selector.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CvTemplateSelectorComponent implements OnInit {
  @Output() templateSelected = new EventEmitter<CvTemplate>();

  templates: CvTemplate[] = [];
  selectedTemplateId: string | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(private cvTemplateService: CvTemplateService) { }

  ngOnInit() {
    this.loadTemplates();
  }

  private loadTemplates() {
    this.isLoading = true;
    this.error = null;

    this.cvTemplateService.getAvailableTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.isLoading = false;
        
        // Sélectionne le premier template par défaut
        if (templates.length > 0 && !this.selectedTemplateId) {
          this.selectTemplate(templates[0]);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des templates:', error);
        this.error = 'Impossible de charger les templates';
        this.isLoading = false;
      }
    });
  }

  selectTemplate(template: CvTemplate) {
    this.selectedTemplateId = template.id;
    this.templateSelected.emit(template);
    console.log('Template sélectionné:', template.name);
  }

  retryLoad() {
    this.loadTemplates();
  }

  trackByTemplateId(index: number, template: CvTemplate): string {
    return template.id;
  }

  getCategoryLabel(category: string): string {
    const labels: {[key: string]: string} = {
      'modern': 'Moderne',
      'classic': 'Classique',
      'creative': 'Créatif',
      'minimalist': 'Minimaliste'
    };
    return labels[category] || category;
  }
}