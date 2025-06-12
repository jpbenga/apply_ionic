// src/app/components/cv-preview/cv-preview.component.ts
import { 
  Component, Input, OnChanges, SimpleChanges, ViewChild, ViewContainerRef, 
  ComponentRef, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvTemplate, CvTheme, CvData, GeneratedCv } from 'src/app/models/cv-template.model';
import { CvGenerationService } from 'src/app/services/cv-generation/cv-generation.service';
import { CvTemplateService } from 'src/app/services/cv-template/cv-template.service';
import { CvTemplateBaseComponent } from '../cv-template/base/cv-template-base.component';
import { Subscription, combineLatest } from 'rxjs';
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
  @ViewChild('templateContainer', { read: ViewContainerRef, static: false }) templateContainer!: ViewContainerRef;

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
  
    // Vérifier si on a vraiment des changements significatifs
    const hasSignificantChanges = (
      (templateChanged && templateChanged.currentValue !== templateChanged.previousValue) ||
      (themeChanged && themeChanged.currentValue !== themeChanged.previousValue) ||
      (modeChanged && modeChanged.currentValue !== modeChanged.previousValue)
    );
  
    if (!hasSignificantChanges) {
      return;
    }
  
    console.log('CvPreview: Changements détectés', {
      template: templateChanged?.currentValue,
      theme: themeChanged?.currentValue,
      mode: modeChanged?.currentValue
    });

    // CORRECTION : Éviter le rendu si le template devient undefined
    if (templateChanged && templateChanged.currentValue === null) {
      console.log('CvPreview: Template est devenu null, abandon du rendu');
      return;
    }

    // CORRECTION : Rendu immédiat si template défini pour la première fois et données disponibles
    const isFirstTemplateLoad = templateChanged && 
                               templateChanged.previousValue === null && 
                               templateChanged.currentValue !== null;
    
    if (isFirstTemplateLoad && this.cvData && !this.isLoading) {
      console.log('CvPreview: Premier chargement template - rendu immédiat');
      this.renderTemplate();
      return;
    }

    // CORRECTION : Rendu immédiat si seulement le thème change et template existe
    if (!templateChanged && themeChanged && this.template && this.cvData && !this.isLoading) {
      console.log('CvPreview: Changement de thème seulement - rendu immédiat');
      this.renderTemplate();
      return;
    }
  
    // Débounce pour les autres changements
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }
    
    this.renderTimeout = setTimeout(() => {
      this.renderTemplate();
    }, 200);
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
        
        // CORRECTION : Rendre le template automatiquement dès que les données sont chargées
        if (this.template && this.cvData) {
          console.log('CvPreview: Données chargées, déclenchement du rendu');
          this.renderTemplate();
        }
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
    // Guard : éviter les re-rendus pendant qu'un rendu est en cours
    if (this.isRendering) {
      console.log('CvPreview: Rendu déjà en cours, abandon');
      return;
    }
  
    if (!this.template) {
      console.log('CvPreview: Aucun template sélectionné');
      return;
    }
  
    // CORRECTION : Attendre que les données CV soient chargées
    if (!this.cvData) {
      if (this.isLoading) {
        console.log('CvPreview: Données en cours de chargement, attente...');
        return;
      } else {
        console.log('CvPreview: Aucune donnée CV, tentative de rechargement...');
        this.loadCvData();
        return;
      }
    }

    // CORRECTION : Vérification simple du templateContainer
    if (!this.templateContainer) {
      console.log('CvPreview: templateContainer non disponible, nouvelle tentative...');
      setTimeout(() => this.renderTemplate(), 100);
      return;
    }
  
    console.log('CvPreview: Début du rendu template', this.template.name);
  
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
  
      console.log('CvPreview: Rendu template terminé avec succès');
  
    } catch (error) {
      console.error('Erreur lors du rendu du template:', error);
      this.handleRenderError(error);
    } finally {
      this.isRendering = false;
      this.cdr.markForCheck();
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
    
    console.log('CvPreview: Configuration du composant template');
    
    // CORRECTION : S'assurer que le thème est toujours défini
    const themeToApply = this.buildThemeObject();
    console.log('CvPreview: Thème à appliquer:', themeToApply);
    
    // Configure toutes les données en une seule fois
    instance.cvData = this.cvData;
    instance.userProfile = this.userProfile;
    instance.previewMode = true;
    instance.theme = themeToApply;
  
    // Un seul appel à detectChanges pour toute la configuration
    this.currentComponentRef.changeDetectorRef.detectChanges();
    
    console.log('CvPreview: Configuration terminée');
  }

  private buildThemeObject(): CvTheme {
    // CORRECTION : Utiliser le thème par défaut si aucun thème n'est fourni
    const primaryColor = this.theme || this.defaultTheme.primaryColor;
    
    const theme = {
      primaryColor: primaryColor,
      secondaryColor: this.lightenColor(primaryColor, 20),
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

  // Méthode pour afficher un CV spécifique
  displayGeneratedCv(generatedCv: GeneratedCv) {
    this.cvData = generatedCv.data;
    this.theme = generatedCv.theme.primaryColor;
    this.template = { 
      id: generatedCv.templateId, 
      name: '', 
      description: '', 
      imageUrl: '', 
      category: 'modern', 
      component: null 
    } as CvTemplate;
    
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