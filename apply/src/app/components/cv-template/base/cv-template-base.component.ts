// src/app/components/cv-templates/base/cv-template-base.component.ts
import { Component, Input, OnChanges, SimpleChanges, ElementRef, OnInit } from '@angular/core';
import { CvData, CvTheme } from 'src/app/models/cv-template.model';
import { UserProfile } from '../../../features/profile/models/user-profile.model';

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
  @Input() pdfOptimized: boolean = false; // Nouveau paramètre pour l'optimisation PDF

  // Variables CSS pour les couleurs dynamiques
  cssVariables: { [key: string]: string } = {};

  constructor(protected elementRef: ElementRef) {}

  ngOnInit() {
    this.updateCssVariables();
    this.applyPdfOptimizations();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['theme']) {
      console.log('Theme changé dans le composant base:', this.theme);
      this.updateCssVariables();
    }
    
    if (changes['pdfOptimized']) {
      this.applyPdfOptimizations();
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

  // NOUVELLE MÉTHODE: Applique les optimisations pour PDF
  private applyPdfOptimizations() {
    const element = this.elementRef.nativeElement;
    if (element && this.pdfOptimized) {
      // Ajouter la classe d'optimisation PDF
      element.classList.add('pdf-optimized');
      
      // Appliquer les styles d'optimisation PDF
      this.applyPdfStyles(element);
    } else if (element) {
      element.classList.remove('pdf-optimized');
    }
  }

  // NOUVELLE MÉTHODE: Applique les styles spécifiques pour PDF
  private applyPdfStyles(element: HTMLElement) {
    // Styles de base pour l'optimisation PDF
    element.style.width = '794px';
    element.style.height = '1123px';
    element.style.padding = '20px';
    element.style.margin = '0';
    element.style.fontSize = '10px';
    element.style.lineHeight = '1.3';
    element.style.overflow = 'hidden';
    element.style.pageBreakInside = 'avoid';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.backgroundColor = 'white';
    element.style.color = '#333';
    element.style.boxSizing = 'border-box';
  }

  // NOUVELLE MÉTHODE: Optimise le contenu pour tenir sur une page
  optimizeForSinglePage(): void {
    const element = this.elementRef.nativeElement;
    if (!element) return;

    // Calculer la hauteur disponible
    const availableHeight = 1123 - 40; // Hauteur A4 moins padding
    const currentHeight = element.scrollHeight;

    if (currentHeight > availableHeight) {
      console.log(`Contenu trop grand (${currentHeight}px), optimisation nécessaire`);
      
      // Réduire progressivement les tailles
      this.reduceContentSize(element, currentHeight, availableHeight);
    }
  }

  // NOUVELLE MÉTHODE: Réduit la taille du contenu de façon intelligente
  private reduceContentSize(element: HTMLElement, currentHeight: number, targetHeight: number) {
    const reductionFactor = targetHeight / currentHeight;
    
    // Réduire les marges et paddings
    this.reduceSpacing(element, reductionFactor);
    
    // Réduire les tailles de police si nécessaire
    if (reductionFactor < 0.9) {
      this.reduceFontSizes(element, reductionFactor);
    }
    
    // Optimiser les descriptions si elles sont trop longues
    this.optimizeDescriptions(element);
  }

  // NOUVELLE MÉTHODE: Réduit les espacements
  private reduceSpacing(element: HTMLElement, factor: number) {
    const spacingElements = element.querySelectorAll('.cv-section, .item, .experience-item, .formation-item');
    spacingElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const currentMargin = parseInt(getComputedStyle(htmlEl).marginBottom) || 0;
      htmlEl.style.marginBottom = Math.max(4, currentMargin * factor) + 'px';
    });
  }

  // NOUVELLE MÉTHODE: Réduit les tailles de police
  private reduceFontSizes(element: HTMLElement, factor: number) {
    const textElements = element.querySelectorAll('h1, h2, h3, h4, p, span, div');
    textElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const currentSize = parseInt(getComputedStyle(htmlEl).fontSize) || 12;
      const newSize = Math.max(8, currentSize * factor);
      htmlEl.style.fontSize = newSize + 'px';
    });
  }

  // NOUVELLE MÉTHODE: Optimise les descriptions longues
  private optimizeDescriptions(element: HTMLElement) {
    const descriptions = element.querySelectorAll('.item-description, .description');
    descriptions.forEach(desc => {
      const htmlDesc = desc as HTMLElement;
      const text = htmlDesc.textContent || '';
      
      // Limiter la longueur des descriptions si nécessaire
      if (text.length > 150) {
        const truncated = text.substring(0, 147) + '...';
        htmlDesc.textContent = truncated;
      }
    });
  }

  // NOUVELLE MÉTHODE: Prépare l'élément pour l'exportation PDF
  prepareForPdfExport(): HTMLElement {
    const clonedElement = this.elementRef.nativeElement.cloneNode(true) as HTMLElement;
    
    // Appliquer les styles d'optimisation PDF
    this.applyPdfStyles(clonedElement);
    
    // Optimiser pour une seule page
    clonedElement.classList.add('pdf-optimized');
    
    // Masquer les éléments interactifs
    const interactiveElements = clonedElement.querySelectorAll('button, ion-button, ion-fab, .interactive');
    interactiveElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    
    return clonedElement;
  }

  // Utilitaire pour éclaircir une couleur
  protected lightenColor(color: string, percent: number): string {
    if (color.startsWith('rgb')) {
      return this.lightenRgbColor(color, percent);
    }
    
    const cleanColor = color.replace("#", "");
    const num = parseInt(cleanColor, 16);
    
    if (isNaN(num)) return color;
    
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
    
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    }
    
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

  // NOUVELLE MÉTHODE: Valide que le CV peut tenir sur une page
  validateSinglePageLayout(): boolean {
    const element = this.elementRef.nativeElement;
    if (!element) return false;
    
    const maxHeight = 1123 - 40; // Hauteur A4 moins padding
    const currentHeight = element.scrollHeight;
    
    return currentHeight <= maxHeight;
  }

  // NOUVELLE MÉTHODE: Obtient les métriques du layout
  getLayoutMetrics(): { currentHeight: number; maxHeight: number; fitsOnePage: boolean } {
    const element = this.elementRef.nativeElement;
    const maxHeight = 1123 - 40;
    const currentHeight = element ? element.scrollHeight : 0;
    
    return {
      currentHeight,
      maxHeight,
      fitsOnePage: currentHeight <= maxHeight
    };
  }
}