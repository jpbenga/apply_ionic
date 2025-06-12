// src/app/components/cv-templates/base/cv-template-base.component.ts
import { Component, Input, OnChanges, SimpleChanges, ElementRef, OnInit } from '@angular/core';
import { CvData, CvTheme } from 'src/app/models/cv-template.model';
import { UserProfile } from '../../../features/profile/models/user-profile.model'; // MODIFIED

@Component({
  selector: 'app-cv-template-base',
  template: '', // Sera surchargé par les templates enfants
  standalone: true
})
export abstract class CvTemplateBaseComponent implements OnInit, OnChanges {
  @Input() cvData: CvData | null = null;
  @Input() userProfile: UserProfile | null = null;
  @Input() theme: CvTheme = { primaryColor: '#007bff' };
  @Input() previewMode: boolean = true;

  // Variables CSS pour les couleurs dynamiques
  cssVariables: { [key: string]: string } = {};

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    // Appliquer le thème initial
    this.updateCssVariables();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['theme']) {
      console.log('Theme changé dans le composant base:', this.theme);
      this.updateCssVariables();
    }
  }

  private updateCssVariables() {
    console.log('Mise à jour des variables CSS:', this.theme);
    this.cssVariables = {
      '--cv-primary-color': this.theme.primaryColor,
      '--cv-secondary-color': this.theme.secondaryColor || this.lightenColor(this.theme.primaryColor, 20),
      '--cv-text-color': this.theme.textColor || '#333333',
      '--cv-background-color': this.theme.backgroundColor || '#ffffff'
    };
    console.log('Variables CSS mises à jour:', this.cssVariables);
    
    // Appliquer les variables CSS à l'élément DOM
    this.applyCssVariables();
  }

  private applyCssVariables() {
    const element = this.elementRef.nativeElement;
    if (element) {
      Object.keys(this.cssVariables).forEach(key => {
        element.style.setProperty(key, this.cssVariables[key]);
      });
      console.log('Variables CSS appliquées à l\'élément DOM');
    }
  }

  // Utilitaire pour éclaircir une couleur
  protected lightenColor(color: string, percent: number): string {
    // Gestion des couleurs RGB
    if (color.startsWith('rgb')) {
      return this.lightenRgbColor(color, percent);
    }
    
    // Gestion des couleurs hexadécimales
    const cleanColor = color.replace("#", "");
    const num = parseInt(cleanColor, 16);
    
    if (isNaN(num)) return color; // Retourne la couleur originale si erreur
    
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  private lightenRgbColor(rgbColor: string, percent: number): string {
    const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgbColor;
    
    const r = Math.min(255, parseInt(match[1]) + Math.round(2.55 * percent));
    const g = Math.min(255, parseInt(match[2]) + Math.round(2.55 * percent));
    const b = Math.min(255, parseInt(match[3]) + Math.round(2.55 * percent));
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  protected formatDate(date: any): string {
    if (!date) return '';
    
    // Gestion des Timestamp Firebase
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    }
    
    // Gestion des Date et string
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  }

  protected getFullName(): string {
    if (!this.userProfile) return 'Nom Prénom';
    return `${this.userProfile.prenom || ''} ${this.userProfile.nom || ''}`.trim();
  }

  protected getEmail(): string {
    return this.userProfile?.email || '';
  }

  protected getPhone(): string {
    return this.userProfile?.telephone || '';
  }

  protected getAddress(): string {
    return this.userProfile?.adresse || '';
  }

  protected getSummary(): string {
    return this.userProfile?.resumePersonnel || '';
  }

  protected getSkillsByCategory(): Array<{name: string, skills: any[]}> {
    if (!this.cvData?.competences) return [];
    
    const categorized = this.cvData.competences.reduce((acc, skill) => {
      const category = skill.categorie || 'Autres';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {} as {[key: string]: any[]});

    return Object.keys(categorized).map(name => ({
      name,
      skills: categorized[name]
    }));
  }
}