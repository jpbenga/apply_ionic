// src/app/components/cv-templates/template-modern/cv-template-modern.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvTemplateBaseComponent } from '../base/cv-template-base.component';

@Component({
  selector: 'app-cv-template-modern',
  templateUrl: './cv-template-modern.component.html',
  styleUrls: ['./cv-template-modern.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CvTemplateModernComponent extends CvTemplateBaseComponent implements OnInit, OnChanges {

  override ngOnInit() {
    super.ngOnInit();
    this.setupModernTemplate();
  }
  
  override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    
    if (changes['pdfOptimized'] && this.pdfOptimized) {
      this.optimizeForModernTemplate();
    }
  }

  // Configuration spécifique au template Modern
  private setupModernTemplate() {
    if (this.elementRef?.nativeElement) {
      this.elementRef.nativeElement.classList.add('cv-modern-template');
    }
  }

  // Optimisations spécifiques pour le template Modern en PDF
  private optimizeForModernTemplate() {
    if (!this.pdfOptimized) return;

    const element = this.elementRef?.nativeElement;
    if (!element) return;

    this.optimizeModernHeader(element);
    this.optimizeModernSections(element);
    this.optimizeModernSkills(element);
  }

  private optimizeModernHeader(element: HTMLElement) {
    const header = element.querySelector('.cv-header');
    if (header) {
      const headerEl = header as HTMLElement;
      headerEl.style.padding = '20px';
      headerEl.style.marginBottom = '20px';
      headerEl.style.borderRadius = '0 0 10px 10px';
      
      const name = header.querySelector('.full-name') as HTMLElement;
      if (name) {
        name.style.fontSize = '20px';
        name.style.marginBottom = '6px';
        name.style.textShadow = 'none';
      }
      
      const title = header.querySelector('.title') as HTMLElement;
      if (title) {
        title.style.fontSize = '12px';
        title.style.marginBottom = '12px';
      }
      
      const contactItems = header.querySelectorAll('.contact-item');
      contactItems.forEach(item => {
        const itemEl = item as HTMLElement;
        itemEl.style.fontSize = '9px';
        
        const icon = item.querySelector('.icon') as HTMLElement;
        if (icon) {
          icon.style.fontSize = '10px';
          icon.style.marginRight = '6px';
        }
      });
    }
  }

  private optimizeModernSections(element: HTMLElement) {
    const sections = element.querySelectorAll('.cv-section');
    sections.forEach((section, index) => {
      const sectionEl = section as HTMLElement;
      sectionEl.style.marginBottom = index === sections.length - 1 ? '0' : '12px';
      
      // Optimiser les titres de section
      const title = section.querySelector('.section-title') as HTMLElement;
      if (title) {
        title.style.fontSize = '14px';
        title.style.marginBottom = '8px';
        title.style.paddingBottom = '4px';
      }
      
      // Optimiser les expériences
      const experienceItems = section.querySelectorAll('.experience-item');
      experienceItems.forEach((item, itemIndex) => {
        const itemEl = item as HTMLElement;
        itemEl.style.marginBottom = itemIndex === experienceItems.length - 1 ? '0' : '8px';
        itemEl.style.padding = '6px';
        itemEl.style.borderRadius = '4px';
        itemEl.style.pageBreakInside = 'avoid';
        
        const position = item.querySelector('.position') as HTMLElement;
        if (position) {
          position.style.fontSize = '11px';
        }
        
        const company = item.querySelector('.company') as HTMLElement;
        if (company) {
          company.style.fontSize = '10px';
        }
        
        const meta = item.querySelector('.experience-meta') as HTMLElement;
        if (meta) {
          meta.style.fontSize = '9px';
          meta.style.marginBottom = '6px';
        }
        
        const description = item.querySelector('.description') as HTMLElement;
        if (description) {
          description.style.fontSize = '9px';
          description.style.lineHeight = '1.2';
          
          // Limiter la longueur
          const text = description.textContent || '';
          if (text.length > 130) {
            description.textContent = text.substring(0, 127) + '...';
          }
        }
      });
      
      // Optimiser les formations
      const formationItems = section.querySelectorAll('.formation-item');
      formationItems.forEach((item, itemIndex) => {
        const itemEl = item as HTMLElement;
        itemEl.style.marginBottom = itemIndex === formationItems.length - 1 ? '0' : '6px';
        itemEl.style.padding = '6px';
        itemEl.style.borderRadius = '4px';
        itemEl.style.pageBreakInside = 'avoid';
        
        const diploma = item.querySelector('.diploma') as HTMLElement;
        if (diploma) {
          diploma.style.fontSize = '11px';
        }
        
        const school = item.querySelector('.school') as HTMLElement;
        if (school) {
          school.style.fontSize = '9px';
        }
        
        const meta = item.querySelector('.formation-meta') as HTMLElement;
        if (meta) {
          meta.style.fontSize = '8px';
        }
        
        const description = item.querySelector('.description') as HTMLElement;
        if (description) {
          description.style.fontSize = '8px';
          description.style.lineHeight = '1.2';
        }
      });
    });
  }

  private optimizeModernSkills(element: HTMLElement) {
    const skillsContainer = element.querySelector('.skills-container');
    if (skillsContainer) {
      const categories = skillsContainer.querySelectorAll('.skill-category');
      categories.forEach(category => {
        const categoryEl = category as HTMLElement;
        categoryEl.style.marginBottom = '8px';
        
        const title = category.querySelector('.category-title') as HTMLElement;
        if (title) {
          title.style.fontSize = '11px';
          title.style.marginBottom = '4px';
        }
        
        const skillsList = category.querySelector('.skills-list') as HTMLElement;
        if (skillsList) {
          skillsList.style.gap = '3px';
          
          const skillTags = skillsList.querySelectorAll('.skill-tag');
          skillTags.forEach(tag => {
            const tagEl = tag as HTMLElement;
            tagEl.style.padding = '2px 5px';
            tagEl.style.fontSize = '8px';
            tagEl.style.borderRadius = '6px';
          });
        }
      });
    }
  }

  // NOUVELLE MÉTHODE: Génère le contenu optimisé pour PDF
  generatePdfContent(): string {
    const data = this.cvData;
    const theme = this.theme;
    const profile = this.userProfile;
    
    return `
      <div class="cv-modern pdf-optimized" style="
        width: 794px;
        height: 1123px;
        background: white;
        font-family: Arial, sans-serif;
        font-size: 10px;
        line-height: 1.3;
        color: #333;
        padding: 20px;
        box-sizing: border-box;
        overflow: hidden;
        --cv-primary-color: ${theme.primaryColor};
      ">
        ${this.generateModernHeaderContent(profile, theme)}
        ${this.generateModernExperiencesContent(data?.experiences || [])}
        ${this.generateModernFormationsContent(data?.formations || [])}
        ${this.generateModernSkillsContent(data?.competences || [])}
      </div>
    `;
  }

  private generateModernHeaderContent(profile: any, theme: any): string {
    return `
      <div class="cv-header" style="
        background: linear-gradient(135deg, ${theme.primaryColor} 0%, ${this.lightenColor(theme.primaryColor, -10)} 100%);
        color: white;
        padding: 20px;
        margin: -20px -20px 20px -20px;
        border-radius: 0 0 10px 10px;
      ">
        <h1 style="font-size: 20px; margin: 0 0 6px 0; font-weight: 700;">
          ${this.getFullName()}
        </h1>
        <p style="font-size: 12px; margin: 0 0 12px 0; font-style: italic; opacity: 0.95;">
          ${this.getSummary() || 'Professionnel'}
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 15px;">
          ${this.getEmail() ? `<div style="display: flex; align-items: center; font-size: 9px;"><span style="margin-right: 6px;">✉</span>${this.getEmail()}</div>` : ''}
          ${this.getPhone() ? `<div style="display: flex; align-items: center; font-size: 9px;"><span style="margin-right: 6px;">📞</span>${this.getPhone()}</div>` : ''}
          ${this.getAddress() ? `<div style="display: flex; align-items: center; font-size: 9px;"><span style="margin-right: 6px;">📍</span>${this.getAddress()}</div>` : ''}
        </div>
      </div>
    `;
  }

  private generateModernExperiencesContent(experiences: any[]): string {
    if (!experiences || experiences.length === 0) return '';
    
    return `
      <div class="cv-section" style="margin-bottom: 12px;">
        <h2 style="
          font-size: 14px;
          font-weight: 600;
          color: ${this.theme.primaryColor};
          margin: 0 0 8px 0;
          padding-bottom: 4px;
          border-bottom: 1px solid ${this.theme.primaryColor};
          position: relative;
        ">Expériences Professionnelles</h2>
        ${experiences.map((exp, index) => `
          <div style="
            margin-bottom: ${index === experiences.length - 1 ? '0' : '8px'};
            padding: 6px;
            background: #f8f9fa;
            border-radius: 4px;
            border-left: 3px solid ${this.theme.primaryColor};
            page-break-inside: avoid;
          ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
              <div>
                <h3 style="font-size: 11px; font-weight: 600; margin: 0; color: #2c3e50;">${exp.poste}</h3>
                <span style="font-size: 10px; font-weight: 500; color: ${this.theme.primaryColor};">${exp.entreprise}</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 9px; color: #666;">
              ${exp.lieu ? `<span style="font-style: italic;">${exp.lieu}</span>` : '<span></span>'}
              <span style="font-weight: 500; white-space: nowrap;">
                ${this.formatDate(exp.dateDebut)} - ${exp.enCours ? 'Présent' : this.formatDate(exp.dateFin)}
              </span>
            </div>
            ${exp.description ? `<p style="font-size: 9px; line-height: 1.2; color: #555; margin: 0; text-align: justify;">${exp.description.length > 130 ? exp.description.substring(0, 127) + '...' : exp.description}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  private generateModernFormationsContent(formations: any[]): string {
    if (!formations || formations.length === 0) return '';
    
    return `
      <div class="cv-section" style="margin-bottom: 12px;">
        <h2 style="
          font-size: 14px;
          font-weight: 600;
          color: ${this.theme.primaryColor};
          margin: 0 0 8px 0;
          padding-bottom: 4px;
          border-bottom: 1px solid ${this.theme.primaryColor};
        ">Formation</h2>
        ${formations.map((form, index) => `
          <div style="
            margin-bottom: ${index === formations.length - 1 ? '0' : '6px'};
            padding: 6px;
            background: #f8f9fa;
            border-radius: 4px;
            border-left: 2px solid ${this.theme.secondaryColor || '#6c757d'};
            page-break-inside: avoid;
          ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3px;">
              <div>
                <h3 style="font-size: 11px; font-weight: 600; margin: 0; color: #2c3e50;">${form.diplome}</h3>
                <span style="font-size: 9px; font-weight: 500; color: ${this.theme.secondaryColor || '#6c757d'};">${form.etablissement}</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 8px; color: #666;">
              ${form.ville ? `<span style="font-style: italic;">${form.ville}</span>` : '<span></span>'}
              <span style="font-weight: 500; white-space: nowrap;">
                ${this.formatDate(form.dateDebut)} - ${form.enCours ? 'Présent' : this.formatDate(form.dateFin)}
              </span>
            </div>
            ${form.description ? `<p style="font-size: 8px; line-height: 1.2; color: #555; margin: 0;">${form.description}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  private generateModernSkillsContent(competences: any[]): string {
    if (!competences || competences.length === 0) return '';
    
    const categories = this.getSkillsByCategory();
    
    return `
      <div class="cv-section">
        <h2 style="
          font-size: 14px;
          font-weight: 600;
          color: ${this.theme.primaryColor};
          margin: 0 0 8px 0;
          padding-bottom: 4px;
          border-bottom: 1px solid ${this.theme.primaryColor};
        ">Compétences</h2>
        <div class="skills-container">
          ${categories.map((category, index) => `
            <div style="margin-bottom: ${index === categories.length - 1 ? '0' : '8px'};">
              <h4 style="font-size: 11px; font-weight: 600; color: ${this.theme.primaryColor}; margin: 0 0 4px 0;">${category.name}</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 3px;">
                ${category.skills.map(skill => `
                  <span style="
                    background: ${this.theme.primaryColor};
                    color: white;
                    padding: 2px 5px;
                    border-radius: 6px;
                    font-size: 8px;
                    font-weight: 500;
                    white-space: nowrap;
                  ">${skill.nom}</span>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Méthode utilitaire pour assombrir une couleur
  private darkenColor(color: string, percent: number): string {
    const cleanColor = color.replace('#', '');
    const num = parseInt(cleanColor, 16);
    
    if (isNaN(num)) return color;
    
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
}