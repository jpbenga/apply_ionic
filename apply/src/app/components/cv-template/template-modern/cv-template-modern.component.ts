import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvTemplateBaseComponent } from '../base/cv-template-base.component';
import { Experience } from 'src/app/models/experience.model';
import { Formation } from 'src/app/models/formation.model';
import { Competence } from 'src/app/models/competence.model';

@Component({
 selector: 'app-cv-template-modern',
 templateUrl: './cv-template-modern.component.html',
 styleUrls: ['./cv-template-modern.component.scss'],
 standalone: true,
 imports: [CommonModule]
})
export class CvTemplateModernComponent extends CvTemplateBaseComponent implements OnInit {

 override ngOnInit() {
   super.ngOnInit();
 }

 public isArray(value: any): value is any[] {
   return Array.isArray(value);
 }

 generatePdfContent(): string {
   const data = this.cvData;
   const theme = this.theme;
   
   return `
     <div class="cv-modern pdf-optimized" style="width: 794px; height: 1123px; background: white; font-family: Arial, sans-serif; font-size: 10px; line-height: 1.3; color: #333; padding: 20px; box-sizing: border-box; overflow: hidden; --cv-primary-color: ${theme.primaryColor};">
       ${this.generateModernHeaderContent()}
       ${this.generateModernExperiencesContent(data?.experiences || [])}
       ${this.generateModernFormationsContent(data?.formations || [])}
       ${this.generateModernSkillsContent(data?.competences || [])}
     </div>
   `;
 }

 private generateModernHeaderContent(): string {
   return `
     <div class="cv-header" style="background: linear-gradient(135deg, ${this.theme.primaryColor} 0%, ${this.lightenColor(this.theme.primaryColor, -10)} 100%); color: white; padding: 20px; margin: -20px -20px 20px -20px; border-radius: 0 0 10px 10px;">
       <h1 style="font-size: 20px; margin: 0 0 6px 0; font-weight: 700;">${this.getFullName()}</h1>
       <p style="font-size: 12px; margin: 0 0 12px 0; font-style: italic; opacity: 0.95;">${this.getSummary() || 'Professionnel'}</p>
       <div style="display: flex; flex-wrap: wrap; gap: 15px;">
         ${this.getEmail() ? `<div style="display: flex; align-items: center; font-size: 9px;"><span style="margin-right: 6px;">✉</span>${this.getEmail()}</div>` : ''}
         ${this.getPhone() ? `<div style="display: flex; align-items: center; font-size: 9px;"><span style="margin-right: 6px;">📞</span>${this.getPhone()}</div>` : ''}
         ${this.getAddress() ? `<div style="display: flex; align-items: center; font-size: 9px;"><span style="margin-right: 6px;">📍</span>${this.getAddress()}</div>` : ''}
       </div>
     </div>
   `;
 }

 private generateModernExperiencesContent(experiences: Experience[]): string {
   if (!experiences.length) return '';
   
   const generateDescription = (desc?: string[] | string): string => {
     if (!desc) return '';
     let items: string[] = [];
     if (Array.isArray(desc)) {
       items = desc.filter(item => item && item.trim() !== '');
     } else if (typeof desc === 'string') {
       items = desc.split('\n').map(line => line.replace(/^-|•/, '').trim()).filter(line => line);
     }
     if (items.length === 0) return '';
     const missions = items.map(mission => `<li style="margin-bottom: 2px; line-height: 1.3;">${mission}</li>`).join('');
     return `<ul style="margin: 8px 0 0 0; padding-left: 18px; font-size: 9px; color: #555; list-style-type: disc;">${missions}</ul>`;
   };

   return `
     <div class="cv-section" style="margin-bottom: 12px;">
       <h2 style="font-size: 14px; font-weight: 600; color: ${this.theme.primaryColor}; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid ${this.theme.primaryColor};">Expériences Professionnelles</h2>
       ${experiences.map((exp, index) => `
         <div style="margin-bottom: ${index === experiences.length - 1 ? '0' : '8px'}; page-break-inside: avoid;">
           <div style="display: flex; justify-content: space-between; align-items: flex-start;">
             <div>
               <h3 style="font-size: 11px; font-weight: 600; margin: 0; color: #2c3e50;">${exp.poste}</h3>
               <span style="font-size: 10px; font-weight: 500; color: ${this.theme.primaryColor};">${exp.entreprise}</span>
             </div>
             <span style="font-size: 9px; color: #666; white-space: nowrap;">
               ${this.formatDate(exp.dateDebut)} - ${exp.enCours ? 'Présent' : this.formatDate(exp.dateFin)}
             </span>
           </div>
           ${generateDescription(exp.description)}
         </div>
       `).join('')}
     </div>
   `;
 }

 private generateModernFormationsContent(formations: Formation[]): string {
   if (!formations.length) return '';

   const generateDescription = (desc?: string[] | string): string => {
     if (!desc) return '';
     let items: string[] = [];
     if (Array.isArray(desc)) {
       items = desc.filter(item => item && item.trim() !== '');
     } else if (typeof desc === 'string') {
       items = desc.split('\n').map(line => line.replace(/^-|•/, '').trim()).filter(line => line);
     }
     if (items.length === 0) return '';
     const details = items.map(detail => `<li style="margin-bottom: 2px; line-height: 1.2;">${detail}</li>`).join('');
     return `<ul style="margin: 6px 0 0 0; padding-left: 18px; font-size: 8px; color: #555; list-style-type: disc;">${details}</ul>`;
   };
   
   return `
     <div class="cv-section" style="margin-bottom: 12px;">
       <h2 style="font-size: 14px; font-weight: 600; color: ${this.theme.primaryColor}; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid ${this.theme.primaryColor};">Formation</h2>
       ${formations.map((form, index) => `
         <div style="margin-bottom: ${index === formations.length - 1 ? '0' : '6px'}; page-break-inside: avoid;">
           <div style="display: flex; justify-content: space-between; align-items: flex-start;">
             <div>
               <h3 style="font-size: 11px; font-weight: 600; margin: 0;">${form.diplome}</h3>
               <span style="font-size: 9px; color: #666;">${form.etablissement}</span>
             </div>
             <span style="font-size: 8px; color: #666; white-space: nowrap;">
               ${this.formatDate(form.dateDebut)} - ${form.enCours ? 'Présent' : this.formatDate(form.dateFin)}
             </span>
           </div>
            ${generateDescription(form.description)}
         </div>
       `).join('')}
     </div>
   `;
 }

 private generateModernSkillsContent(competences: Competence[]): string {
   if (!competences.length) return '';
   const categories = this.getSkillsByCategory();
   
   return `
     <div class="cv-section">
       <h2 style="font-size: 14px; font-weight: 600; color: ${this.theme.primaryColor}; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid ${this.theme.primaryColor};">Compétences</h2>
       ${categories.map(cat => `
         <div style="margin-bottom: 8px;">
           <h4 style="font-size: 11px; font-weight: 600; margin: 0 0 4px 0;">${cat.name}</h4>
           <div style="display: flex; flex-wrap: wrap; gap: 4px;">
             ${cat.skills.map(skill => `<span style="background: #e9ecef; color: #333; padding: 2px 6px; border-radius: 4px; font-size: 9px;">${skill.nom}</span>`).join('')}
           </div>
         </div>
       `).join('')}
     </div>
   `;
 }
}
