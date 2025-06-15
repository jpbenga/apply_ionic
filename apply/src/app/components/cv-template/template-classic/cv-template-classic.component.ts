// src/app/components/cv-templates/template-classic/cv-template-classic.component.ts
import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvTemplateBaseComponent } from '../base/cv-template-base.component';

@Component({
  selector: 'app-cv-template-classic',
  templateUrl: './cv-template-classic.component.html',
  styleUrls: ['./cv-template-classic.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CvTemplateClassicComponent extends CvTemplateBaseComponent implements OnInit, OnChanges {

  override ngOnInit() {
    super.ngOnInit();
    this.setupClassicTemplate();
  }

  override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    
    if (changes['pdfOptimized'] && this.pdfOptimized) {
      this.optimizeForClassicTemplate();
    }
  }

  // Configuration spécifique au template Classic
  private setupClassicTemplate() {
    // Appliquer les styles spécifiques au template classic
    if (this.elementRef?.nativeElement) {
      this.elementRef.nativeElement.classList.add('cv-classic-template');
    }
  }

  // Optimisations spécifiques pour le template Classic en PDF
  private optimizeForClassicTemplate() {
    if (!this.pdfOptimized) return;

    const element = this.elementRef?.nativeElement;
    if (!element) return;

    // Optimisations spécifiques au template Classic
    this.optimizeClassicHeader(element);
    this.optimizeClassicSections(element);
    this.optimizeClassicSkills(element);
  }

  private optimizeClassicHeader(element: HTMLElement) {
    const header = element.querySelector('.cv-header');
    if (header) {
      const headerEl = header as HTMLElement;
      headerEl.style.padding = '15px';
      headerEl.style.marginBottom = '15px';
      
      const name = header.querySelector('.full-name') as HTMLElement;
      if (name) {
        name.style.fontSize = '18px';
        name.style.marginBottom = '6px';
      }
      
      const title = header.querySelector('.title') as HTMLElement;
      if (title) {
        title.style.fontSize = '11px';
        title.style.marginBottom = '10px';
      }
    }
  }

  private optimizeClassicSections(element: HTMLElement) {
    const sections = element.querySelectorAll('.section');
    sections.forEach((section, index) => {
      const sectionEl = section as HTMLElement;
      
      // Réduire les marges entre sections
      sectionEl.style.marginBottom = index === sections.length - 1 ? '0' : '12px';
      
      // Optimiser les titres de section
      const title = section.querySelector('.section-header') as HTMLElement;
      if (title) {
        title.style.fontSize = '12px';
        title.style.marginBottom = '8px';
        title.style.paddingBottom = '3px';
      }
      
      // Optimiser les items
      const items = section.querySelectorAll('.item');
      items.forEach((item, itemIndex) => {
        const itemEl = item as HTMLElement;
        itemEl.style.marginBottom = itemIndex === items.length - 1 ? '0' : '8px';
        itemEl.style.pageBreakInside = 'avoid';
        
        // Optimiser les titres d'items
        const itemTitle = item.querySelector('.item-title h3') as HTMLElement;
        if (itemTitle) {
          itemTitle.style.fontSize = '11px';
          itemTitle.style.marginBottom = '1px';
        }
        
        const itemCompany = item.querySelector('.item-title h4') as HTMLElement;
        if (itemCompany) {
          itemCompany.style.fontSize = '10px';
        }
        
        // Optimiser les dates
        const dates = item.querySelector('.item-dates') as HTMLElement;
        if (dates) {
          dates.style.fontSize = '8px';
        }
        
        // Optimiser les descriptions
        const description = item.querySelector('.item-description') as HTMLElement;
        if (description) {
          description.style.fontSize = '9px';
          description.style.lineHeight = '1.2';
          
          // Limiter la longueur si nécessaire
          const text = description.textContent || '';
          if (text.length > 120) {
            description.textContent = text.substring(0, 117) + '...';
          }
        }
      });
    });
  }

  private optimizeClassicSkills(element: HTMLElement) {
    const skillsGrid = element.querySelector('.skills-grid');
    if (skillsGrid) {
      const skillsEl = skillsGrid as HTMLElement;
      skillsEl.style.gap = '6px';
      skillsEl.style.gridTemplateColumns = 'repeat(2, 1fr)';
      
      const categories = skillsGrid.querySelectorAll('.skill-category');
      categories.forEach(category => {
        const categoryEl = category as HTMLElement;
        
        const title = category.querySelector('.skill-category-title') as HTMLElement;
        if (title) {
          title.style.fontSize = '10px';
          title.style.marginBottom = '3px';
        }
        
        const skillsList = category.querySelectorAll('.skills-list li');
        skillsList.forEach(skill => {
          const skillEl = skill as HTMLElement;
          skillEl.style.fontSize = '8px';
          skillEl.style.padding = '1px 0';
          skillEl.style.paddingLeft = '10px';
        });
      });
    }
  }

  // NOUVELLE MÉTHODE: Génère le contenu optimisé pour PDF
  generatePdfContent(): string {
    const data = this.cvData;
    const theme = this.theme;
    const profile = this.userProfile;
    
    return `
      <div class="cv-classic pdf-optimized" style="
        width: 794px;
        height: 1123px;
        background: white;
        font-family: Arial, sans-serif;
        font-size: 10px;
        line-height: 1.2;
        color: #333;
        padding: 20px;
        box-sizing: border-box;
        overflow: hidden;
        --cv-primary-color: ${theme.primaryColor};
      ">
        ${this.generateHeaderContent(profile, theme)}
        ${this.generateExperiencesContent(data?.experiences || [])}
        ${this.generateFormationsContent(data?.formations || [])}
        ${this.generateSkillsContent(data?.competences || [])}
      </div>
    `;
  }

  private generateHeaderContent(profile: any, theme: any): string {
    return `
      <div class="cv-header" style="
        background: ${theme.primaryColor};
        color: white;
        padding: 15px;
        margin: -20px -20px 15px -20px;
      ">
        <h1 style="font-size: 18px; margin: 0 0 6px 0; font-weight: bold;">
          ${this.getFullName()}
        </h1>
        <p style="font-size: 11px; margin: 0 0 10px 0; font-style: italic;">
          ${this.getSummary() || 'Professionnel'}
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 9px;">
          ${this.getEmail() ? `<div><strong>Email:</strong> ${this.getEmail()}</div>` : ''}
          ${this.getPhone() ? `<div><strong>Tél:</strong> ${this.getPhone()}</div>` : ''}
          ${this.getAddress() ? `<div><strong>Adresse:</strong> ${this.getAddress()}</div>` : ''}
        </div>
      </div>
    `;
  }

  private generateExperiencesContent(experiences: any[]): string {
    if (!experiences || experiences.length === 0) return '';
    
    return `
      <div class="cv-section" style="margin-bottom: 12px;">
        <h2 style="
          font-size: 12px;
          font-weight: bold;
          color: ${this.theme.primaryColor};
          margin: 0 0 8px 0;
          padding-bottom: 3px;
          border-bottom: 1px solid ${this.theme.primaryColor};
          text-transform: uppercase;
        ">EXPÉRIENCE PROFESSIONNELLE</h2>
        ${experiences.map((exp, index) => `
          <div style="margin-bottom: ${index === experiences.length - 1 ? '0' : '8px'}; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <div>
                <h3 style="font-size: 11px; font-weight: bold; margin: 0 0 1px 0;">${exp.poste}</h3>
                <h4 style="font-size: 10px; font-weight: 600; margin: 0; color: ${this.theme.primaryColor};">${exp.entreprise}</h4>
              </div>
              <div style="font-size: 8px; color: #666; white-space: nowrap;">
                ${this.formatDate(exp.dateDebut)} - ${exp.enCours ? 'Présent' : this.formatDate(exp.dateFin)}
              </div>
            </div>
            ${exp.lieu ? `<div style="font-size: 8px; color: #666; font-style: italic; margin-bottom: 3px;">${exp.lieu}</div>` : ''}
            ${exp.description ? `<div style="font-size: 9px; line-height: 1.2; color: #555; text-align: justify;">${exp.description.length > 120 ? exp.description.substring(0, 117) + '...' : exp.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  private generateFormationsContent(formations: any[]): string {
    if (!formations || formations.length === 0) return '';
    
    return `
      <div class="cv-section" style="margin-bottom: 12px;">
        <h2 style="
          font-size: 12px;
          font-weight: bold;
          color: ${this.theme.primaryColor};
          margin: 0 0 8px 0;
          padding-bottom: 3px;
          border-bottom: 1px solid ${this.theme.primaryColor};
          text-transform: uppercase;
        ">FORMATION</h2>
        ${formations.map((form, index) => `
          <div style="margin-bottom: ${index === formations.length - 1 ? '0' : '8px'}; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <div>
                <h3 style="font-size: 11px; font-weight: bold; margin: 0 0 1px 0;">${form.diplome}</h3>
                <h4 style="font-size: 10px; font-weight: 600; margin: 0; color: ${this.theme.primaryColor};">${form.etablissement}</h4>
              </div>
              <div style="font-size: 8px; color: #666; white-space: nowrap;">
                ${this.formatDate(form.dateDebut)} - ${form.enCours ? 'Présent' : this.formatDate(form.dateFin)}
              </div>
            </div>
            ${form.ville ? `<div style="font-size: 8px; color: #666; font-style: italic; margin-bottom: 3px;">${form.ville}</div>` : ''}
            ${form.description ? `<div style="font-size: 9px; line-height: 1.2; color: #555;">${form.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  private generateSkillsContent(competences: any[]): string {
    if (!competences || competences.length === 0) return '';
    
    const categories = this.getSkillsByCategory();
    
    return `
      <div class="cv-section">
        <h2 style="
          font-size: 12px;
          font-weight: bold;
          color: ${this.theme.primaryColor};
          margin: 0 0 8px 0;
          padding-bottom: 3px;
          border-bottom: 1px solid ${this.theme.primaryColor};
          text-transform: uppercase;
        ">COMPÉTENCES</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
          ${categories.map(category => `
            <div>
              <h4 style="font-size: 10px; font-weight: bold; color: ${this.theme.primaryColor}; margin: 0 0 3px 0;">${category.name}</h4>
              <div style="font-size: 8px; line-height: 1.2;">
                ${category.skills.map(skill => skill.nom).join(', ')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}