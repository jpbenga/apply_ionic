// src/app/components/cv-preview/cv-preview.component.ts
import { 
  Component, Input, OnChanges, SimpleChanges, ViewChild, ViewContainerRef, 
  ComponentRef, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvTemplate, CvTheme, CvData } from 'src/app/models/cv-template.model';
import { CvGenerationService } from 'src/app/services/cv-generation/cv-generation.service';
import { CvTemplateService } from 'src/app/services/cv-template/cv-template.service';
import { CvTemplateBaseComponent } from '../cv-template/base/cv-template-base.component';
import { combineLatest, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-cv-preview',
  templateUrl: './cv-preview.component.html',
  styleUrls: ['./cv-preview.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvPreviewComponent implements OnChanges, OnDestroy {
  @Input() template: CvTemplate | null = null;
  @Input() theme: string | null = null;
  @Input() previewMode: 'mini' | 'normal' | 'full' = 'normal';
  @ViewChild('templateContainer', { read: ViewContainerRef }) templateContainer!: ViewContainerRef;

  // États du composant
  cvData: CvData | null = null;
  userProfile: any = null;
  isLoading = true;
  isRendering = false;
  error: string | null = null;
  retryCount = 0;
  maxRetries = 3;

  // Références internes
  private currentComponentRef: ComponentRef<CvTemplateBaseComponent> | null = null;
  private dataSubscription: Subscription | null = null;
  private renderTimeout: any = null;

  // Thème par défaut
  private defaultTheme: CvTheme = {
    primaryColor: '#007bff',
    secondaryColor: '#0056b3',
    textColor: '#333333',
    backgroundColor: '#ffffff'
  };

  constructor(
    private cvGenerationService: CvGenerationService,
    private cvTemplateService: CvTemplateService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadCvData();
  }

  ngOnChanges(changes: SimpleChanges) {
    const templateChanged = changes['template'];
    const themeChanged = changes['theme'];
    const modeChanged = changes['previewMode'];

    // Si le thème change, on re-configure le composant immédiatement
    if (themeChanged && this.currentComponentRef) {
      console.log('Changement de thème détecté:', this.theme);
      this.currentComponentRef.instance.theme = this.buildThemeObject();
      this.currentComponentRef.instance.ngOnChanges({
        theme: {
          currentValue: this.buildThemeObject(),
          previousValue: null,
          firstChange: false,
          isFirstChange: () => false
        }
      });
      this.currentComponentRef.changeDetectorRef.markForCheck();
      this.currentComponentRef.changeDetectorRef.detectChanges();
      return;
    }

    // Pour les autres changements, débounce pour éviter les rendus trop fréquents
    if (templateChanged || themeChanged || modeChanged) {
      if (this.renderTimeout) {
        clearTimeout(this.renderTimeout);
      }
      
      this.renderTimeout = setTimeout(() => {
        this.renderTemplate();
      }, 150);
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private cleanup() {
    if (this.currentComponentRef) {
      this.currentComponentRef.destroy();
      this.currentComponentRef = null;
    }
    
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
      this.dataSubscription = null;
    }

    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
      this.renderTimeout = null;
    }
  }

  private loadCvData() {
    this.isLoading = true;
    this.error = null;
    this.retryCount = 0;
    this.cdr.markForCheck();

    this.dataSubscription = combineLatest([
      this.cvGenerationService.getCvData(),
      this.cvGenerationService.getUserProfile()
    ]).pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe({
      next: ([cvData, userProfile]) => {
        this.cvData = cvData;
        this.userProfile = userProfile;
        this.isLoading = false;
        this.error = null;
        this.cdr.markForCheck();
        this.renderTemplate();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données CV:', error);
        this.handleLoadError(error);
      }
    });
  }

  private handleLoadError(error: any) {
    this.isLoading = false;
    this.retryCount++;
    
    if (this.retryCount <= this.maxRetries) {
      this.error = `Erreur de chargement (tentative ${this.retryCount}/${this.maxRetries})`;
    } else {
      this.error = 'Impossible de charger les données du CV. Veuillez réessayer.';
    }
    
    this.cdr.markForCheck();
  }

  private renderTemplate() {
    // Vérifications préliminaires
    if (!this.templateContainer) {
      return;
    }

    if (!this.template) {
      this.showEmptyState('Aucun template sélectionné');
      return;
    }

    if (!this.cvData) {
      if (!this.isLoading) {
        this.showEmptyState('Aucune donnée CV disponible');
      }
      return;
    }

    this.isRendering = true;
    this.error = null;
    this.cdr.markForCheck();

    try {
      // Nettoie le composant précédent
      this.cleanupCurrentComponent();

      // Récupère la classe du composant
      const componentClass = this.cvTemplateService.getTemplateComponent(this.template.id);
      if (!componentClass) {
        throw new Error(`Template "${this.template.name}" non trouvé`);
      }

      // Crée le nouveau composant
      this.currentComponentRef = this.templateContainer.createComponent(componentClass);
      
      // Configure les données du composant
      this.configureTemplateComponent();

      // Applique les styles du mode preview
      this.applyPreviewStyles();

      this.isRendering = false;
      this.cdr.markForCheck();

    } catch (error) {
      console.error('Erreur lors du rendu du template:', error);
      this.handleRenderError(error);
    }
  }

  private cleanupCurrentComponent() {
    if (this.currentComponentRef) {
      this.currentComponentRef.destroy();
      this.currentComponentRef = null;
    }
    this.templateContainer.clear();
  }

  private configureTemplateComponent() {
    if (!this.currentComponentRef) return;

    const instance = this.currentComponentRef.instance;
    
    // Configure les données CV
    instance.cvData = this.cvData;
    instance.userProfile = this.userProfile;
    instance.previewMode = true;
    
    // Configure le thème avec la couleur reçue en input
    instance.theme = this.buildThemeObject();

    // Force la détection des changements sur le composant template
    this.currentComponentRef.changeDetectorRef.markForCheck();
    this.currentComponentRef.changeDetectorRef.detectChanges();
  }

  private buildThemeObject(): CvTheme {
    const theme = {
      primaryColor: this.theme || '#007bff',
      secondaryColor: this.lightenColor(this.theme || '#007bff', 20),
      textColor: '#333333',
      backgroundColor: '#ffffff'
    };
    
    console.log('Theme object construit:', theme);
    return theme;
  }

  private applyPreviewStyles() {
    if (!this.currentComponentRef) return;

    const element = this.currentComponentRef.location.nativeElement;
    
    // Supprime les classes existantes
    element.classList.remove('preview-mini', 'preview-normal', 'preview-full');
    
    // Ajoute la classe appropriée
    element.classList.add(`preview-${this.previewMode}`);
  }

  private handleRenderError(error: any) {
    this.isRendering = false;
    this.error = `Erreur lors du rendu: ${error.message || 'Erreur inconnue'}`;
    this.cdr.markForCheck();
  }

  private showEmptyState(message: string) {
    this.cleanupCurrentComponent();
    this.error = null;
    this.isRendering = false;
    // Le message sera affiché via le template HTML
    this.cdr.markForCheck();
  }

  // Méthodes publiques pour l'interaction
  retry() {
    this.error = null;
    this.retryCount = 0;
    this.loadCvData();
  }

  refresh() {
    this.renderTemplate();
  }

  // Méthodes utilitaires
  private lightenColor(color: string, percent: number): string {
    // Gestion des couleurs RGB
    if (color.startsWith('rgb')) {
      return this.lightenRgbColor(color, percent);
    }
    
    // Gestion des couleurs hexadécimales
    const num = parseInt(color.replace("#", ""), 16);
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

  // Getters pour le template
  get hasTemplate(): boolean {
    return !!this.template;
  }

  get hasCvData(): boolean {
    return !!this.cvData;
  }

  get showEmptyTemplate(): boolean {
    return !this.hasTemplate && !this.isLoading;
  }

  get showEmptyData(): boolean {
    return this.hasTemplate && !this.hasCvData && !this.isLoading;
  }

  get showRetryButton(): boolean {
    return !!this.error && this.retryCount < this.maxRetries;
  }
}