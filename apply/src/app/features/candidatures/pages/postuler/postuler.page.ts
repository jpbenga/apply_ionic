import { Component, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
  IonTextarea, IonButton, IonIcon, IonSpinner, IonSegment, IonSegmentButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle,
  IonCheckbox, IonGrid, IonRow, IonCol, IonRange, IonBadge,
  ToastController
} from '@ionic/angular/standalone';
import { HeaderService } from '../../../../shared/services/header/header.service'; // MODIFIED
import { AIService, ATSAnalysisResult } from '../../../../services/ai/ai.service'; // MODIFIED
import { CandidatureService } from '../../services/candidature/candidature.service'; // MODIFIED
import { CvGenerationService } from '../../../../services/cv-generation/cv-generation.service'; // MODIFIED
import { CvTemplateService } from '../../../../services/cv-template/cv-template.service'; // MODIFIED
import { CvDataService } from '../../../../services/cv-data/cv-data.service'; // MODIFIED
import { GeneratedCv, CvTemplate, CvTheme, CvData } from '../../../../models/cv-template.model'; // MODIFIED
import { Candidature, StatutCandidature } from '../../models/candidature.model'; // MODIFIED
import { Router } from '@angular/router';
import { UserHeaderComponent } from '../../../../shared/components/user-header/user-header.component'; // MODIFIED
import { CvPreviewComponent } from '../../../../components/cv-preview/cv-preview.component'; // MODIFIED
import { Subscription, combineLatest } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { 
  StructuredCvImprovementResponse, 
  StructuredCvImprovementResult,
  SectionImprovement,
  SuggestedCompetence
} from '../../../../models/cv-structured-improvement.model'; // MODIFIED

@Component({
  selector: 'app-postuler',
  templateUrl: './postuler.page.html',
  styleUrls: ['./postuler.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonTextarea, IonButton, IonIcon, IonSpinner, IonSegment, IonSegmentButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle,
    IonCheckbox, IonGrid, IonRow, IonCol, IonRange, IonBadge,
    UserHeaderComponent, CvPreviewComponent
  ]
})
export class PostulerPage implements OnInit, OnDestroy {
  @ViewChild('originalPreview') originalPreview!: CvPreviewComponent;
  @ViewChild('improvedPreview') improvedPreview!: CvPreviewComponent;

  // Propriétés de base
  jobOfferText: string = '';
  atsAnalysisResult: ATSAnalysisResult | null = null;
  generatedCoverLetter: string | null = null;
  isGeneratingAIContent: boolean = false;
  isGeneratingCoverLetter: boolean = false;
  aiError: string | null = null;
  isSavingCandidature: boolean = false;
  isSavingImprovements: boolean = false;

  // Workflow states
  cvImprovementsValidated: boolean = false;

  // Gestion CV structuré et templates
  availableTemplates: CvTemplate[] = [];
  selectedTemplate: CvTemplate | null = null;
  selectedTheme: CvTheme = { primaryColor: '#007bff' };
  availableThemes: CvTheme[] = [
    { primaryColor: '#007bff' }, // Bleu
    { primaryColor: '#28a745' }, // Vert
    { primaryColor: '#dc3545' }, // Rouge
    { primaryColor: '#6f42c1' }, // Violet
    { primaryColor: '#fd7e14' }, // Orange
    { primaryColor: '#20c997' }, // Teal
  ];
  
  // Données CV
  hasStructuredCvData: boolean = false;
  currentCvData: CvData | null = null;
  originalCvData: CvData | null = null;
  improvedCvData: CvData | null = null;
  isLoadingCvData: boolean = false;
  isLoadingTemplates: boolean = false;

  // Améliorations CV
  structuredCvImprovements: StructuredCvImprovementResponse | null = null;
  isImprovingCv: boolean = false;
  improvementsApplied: boolean = false;
  appliedChangesCount = { experiences: 0, formations: 0, competences: 0, total: 0 };

  // Comparaison avant/après
  comparisonView: 'original' | 'improved' | 'split' = 'split';
  sliderPosition: number = 50; // Position du slider en %

  // Spinner global et messages
  globalSpinnerMessage: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private headerService: HeaderService,
    private aiService: AIService,
    private candidatureService: CandidatureService,
    private cvGenerationService: CvGenerationService,
    private cvTemplateService: CvTemplateService,
    private cvDataService: CvDataService,
    private toastController: ToastController,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.loadAvailableTemplates();
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Postuler');
    this.headerService.setShowBackButton(false);
    this.checkStructuredCvData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Détermine si l'overlay de spinner global doit être affiché
   */
  get isGlobalLoading(): boolean {
    return this.isGeneratingAIContent || 
           this.isImprovingCv || 
           this.isGeneratingCoverLetter || 
           this.isSavingCandidature || 
           this.isSavingImprovements ||
           this.isLoadingCvData;
  }

  /**
   * Détermine si les interactions doivent être désactivées
   */
  get isInteractionDisabled(): boolean {
    return this.isGlobalLoading;
  }

  /**
   * Met à jour le message du spinner global
   */
  private updateGlobalSpinnerMessage() {
    if (this.isGeneratingAIContent) {
      this.globalSpinnerMessage = 'Analyse de l\'offre d\'emploi en cours...';
    } else if (this.isImprovingCv) {
      this.globalSpinnerMessage = 'Analyse et amélioration de votre CV...';
    } else if (this.isGeneratingCoverLetter) {
      this.globalSpinnerMessage = 'Génération de la lettre de motivation...';
    } else if (this.isSavingCandidature) {
      this.globalSpinnerMessage = 'Sauvegarde de votre candidature...';
    } else if (this.isSavingImprovements) {
      this.globalSpinnerMessage = 'Sauvegarde des améliorations...';
    } else if (this.isLoadingCvData) {
      this.globalSpinnerMessage = 'Chargement de vos données CV...';
    } else {
      this.globalSpinnerMessage = 'Traitement en cours...';
    }
  }

  /**
   * Charge les templates disponibles
   */
  async loadAvailableTemplates() {
    this.isLoadingTemplates = true;
    this.updateGlobalSpinnerMessage();
    
    const subscription = this.cvTemplateService.getAvailableTemplates().subscribe({
      next: (templates) => {
        this.availableTemplates = templates;
        // Sélectionner le premier template par défaut
        if (templates.length > 0 && !this.selectedTemplate) {
          this.selectedTemplate = templates[0];
          // S'assurer que le thème par défaut est appliqué
          this.updateCvData();
        }
        this.isLoadingTemplates = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des templates:', error);
        this.isLoadingTemplates = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  /**
   * Vérifie si l'utilisateur a des données CV structurées
   */
  checkStructuredCvData() {
    this.isLoadingCvData = true;
    this.updateGlobalSpinnerMessage();
    
    const subscription = combineLatest([
      this.cvDataService.getExperiences(),
      this.cvDataService.getFormations(),
      this.cvDataService.getCompetences()
    ]).subscribe({
      next: ([experiences, formations, competences]) => {
        const hasData = experiences.length > 0 || formations.length > 0 || competences.length > 0;
        this.hasStructuredCvData = hasData;
        
        if (hasData) {
          this.currentCvData = {
            userId: '', // Sera rempli par le service
            experiences,
            formations,
            competences,
            templateId: this.selectedTemplate?.id || 'modern',
            theme: this.selectedTheme
          };
          // Créer une copie profonde pour l'original
          this.originalCvData = JSON.parse(JSON.stringify(this.currentCvData));
          
          // S'assurer que les données sont synchronisées avec le template sélectionné
          if (this.selectedTemplate) {
            this.updateCvData();
          }
        }
        
        this.isLoadingCvData = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données CV:', error);
        this.hasStructuredCvData = false;
        this.isLoadingCvData = false;
      }
    });
    
    this.subscriptions.push(subscription);
  }

  /**
   * Redirige vers la page Mon CV si pas de données
   */
  goToMyCv() {
    if (this.isInteractionDisabled) return;
    this.router.navigate(['/tabs/my-cv']);
  }

  /**
   * Gestion du changement de template
   */
  onTemplateChange(template: CvTemplate) {
    if (this.isInteractionDisabled) return;
    this.selectedTemplate = template;
    this.updateCvData();
  }

  /**
   * Gestion du changement de thème
   */
  onThemeChange(theme: CvTheme) {
    if (this.isInteractionDisabled) return;
    this.selectedTheme = theme;
    this.updateCvData();
  }

  /**
   * Met à jour les données CV avec le nouveau template/thème
   */
  updateCvData() {
    if (this.currentCvData && this.selectedTemplate) {
      this.currentCvData.templateId = this.selectedTemplate.id;
      this.currentCvData.theme = this.selectedTheme;
    }
  }

  /**
   * Génère SEULEMENT l'analyse ATS (pas la lettre)
   */
  async generateApplication() {
    if (this.isInteractionDisabled) return;
    
    this.aiError = null;
    
    if (!this.jobOfferText.trim()) {
      this.presentToast("Veuillez saisir l'offre d'emploi.", 'warning');
      return;
    }

    if (!this.hasStructuredCvData || !this.currentCvData) {
      this.presentToast("Aucune donnée CV structurée disponible.", 'warning');
      return;
    }

    this.isGeneratingAIContent = true;
    this.updateGlobalSpinnerMessage();
    this.atsAnalysisResult = null;

    try {
      // Convertir les données structurées en texte pour l'IA
      const cvText = this.generateTextFromCvData(this.currentCvData);
      
      // Générer SEULEMENT l'analyse ATS
      const atsResult = await this.aiService.getATSAnalysis(this.jobOfferText, cvText);
      this.atsAnalysisResult = atsResult;
      
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de la génération par l'IA.";
      if (error instanceof Error) { 
        errorMessage = error.message; 
      } else if (typeof error === 'string') { 
        errorMessage = error; 
      }
      this.aiError = errorMessage;
      this.presentToast(`Erreur IA: ${errorMessage}`, 'danger');
    } finally {
      this.isGeneratingAIContent = false;
    }
  }

  /**
   * Lance l'amélioration du CV structuré
   */
  async improveCv() {
    if (this.isInteractionDisabled) return;
    
    if (!this.jobOfferText || !this.currentCvData) {
      this.presentToast('Offre d\'emploi et données CV requises pour l\'amélioration', 'warning');
      return;
    }

    this.isImprovingCv = true;
    this.updateGlobalSpinnerMessage();
    this.structuredCvImprovements = null;

    try {
      // Créer un GeneratedCv temporaire pour l'analyse
      const tempGeneratedCv: GeneratedCv = {
        id: 'temp',
        userId: this.currentCvData.userId,
        templateId: this.currentCvData.templateId,
        theme: this.currentCvData.theme,
        data: this.currentCvData,
        createdAt: new Date().toISOString()
      };

      const improvements = await this.aiService.improveStructuredCv(this.jobOfferText, tempGeneratedCv);
      this.structuredCvImprovements = improvements;
      
      if (improvements.summary.totalSuggestions === 0) {
        this.presentToast('Excellent ! Aucune amélioration nécessaire pour votre CV.', 'success');
        // Marquer comme validé même s'il n'y a pas d'améliorations
        this.cvImprovementsValidated = true;
      } else {
        this.presentToast(`${improvements.summary.totalSuggestions} amélioration(s) suggérée(s)`, 'primary');
      }
    } catch (error) {
      console.error('Erreur lors de l\'amélioration du CV:', error);
      let errorMessage = 'Erreur lors de l\'amélioration du CV';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.presentToast(errorMessage, 'danger');
    } finally {
      this.isImprovingCv = false;
    }
  }

  /**
   * Applique les améliorations sélectionnées
   */
  async applySelectedImprovements() {
    if (this.isInteractionDisabled) return;
    if (!this.structuredCvImprovements || !this.currentCvData) return;

    try {
      console.log('🔧 Application des améliorations...');
      
      // Créer un GeneratedCv temporaire pour l'application
      const tempGeneratedCv: GeneratedCv = {
        id: 'temp',
        userId: this.currentCvData.userId,
        templateId: this.currentCvData.templateId,
        theme: this.currentCvData.theme,
        data: this.currentCvData,
        createdAt: new Date().toISOString()
      };

      const result: StructuredCvImprovementResult = this.aiService.applyStructuredCvImprovements(
        tempGeneratedCv, 
        this.structuredCvImprovements
      );

      // Mettre à jour les données améliorées avec une copie profonde
      this.improvedCvData = {
        userId: this.currentCvData.userId,
        templateId: this.currentCvData.templateId,
        theme: this.currentCvData.theme,
        experiences: JSON.parse(JSON.stringify(result.improvedData.experiences)),
        formations: JSON.parse(JSON.stringify(result.improvedData.formations)),
        competences: JSON.parse(JSON.stringify(result.improvedData.competences))
      };

      // Sauvegarder le nombre de changements
      this.appliedChangesCount = result.changesCount;

      this.improvementsApplied = true;
      
      console.log('✅ Améliorations appliquées:', {
        original: this.originalCvData,
        improved: this.improvedCvData,
        changes: this.appliedChangesCount
      });

      this.presentToast(`${result.changesCount.total} modification(s) appliquée(s) !`, 'success');

    } catch (error) {
      console.error('Erreur lors de l\'application des améliorations:', error);
      this.presentToast('Erreur lors de l\'application des améliorations', 'danger');
    }
  }

  /**
   * Sauvegarde les améliorations et marque comme validé
   */
  async saveImprovements() {
    if (this.isInteractionDisabled) return;
    if (!this.improvedCvData || !this.selectedTemplate) return;

    this.isSavingImprovements = true;
    this.updateGlobalSpinnerMessage();

    try {
      // Sauvegarder les données améliorées en base
      const savePromises = [];

      console.log('💾 Sauvegarde des améliorations en base...');

      // Sauvegarder les expériences modifiées
      for (const experience of this.improvedCvData.experiences) {
        if (experience.id) {
          savePromises.push(this.cvDataService.updateExperience(experience.id, experience));
        } else {
          savePromises.push(this.cvDataService.addExperience(experience));
        }
      }

      // Sauvegarder les formations modifiées
      for (const formation of this.improvedCvData.formations) {
        if (formation.id) {
          savePromises.push(this.cvDataService.updateFormation(formation.id, formation));
        } else {
          savePromises.push(this.cvDataService.addFormation(formation));
        }
      }

      // Sauvegarder les compétences modifiées
      for (const competence of this.improvedCvData.competences) {
        if (competence.id) {
          savePromises.push(this.cvDataService.updateCompetence(competence.id, competence));
        } else {
          savePromises.push(this.cvDataService.addCompetence(competence));
        }
      }

      await Promise.all(savePromises);

      // Mettre à jour les données actuelles et marquer comme validé
      this.currentCvData = { 
        ...this.improvedCvData,
        templateId: this.selectedTemplate?.id || (this.currentCvData?.templateId || 'modern'),
        theme: this.selectedTheme
      };
      this.cvImprovementsValidated = true;

      this.presentToast('Améliorations sauvegardées avec succès !', 'success');

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.presentToast('Erreur lors de la sauvegarde des améliorations', 'danger');
    } finally {
      this.isSavingImprovements = false;
    }
  }

  /**
   * Génère la lettre de motivation (séparée)
   */
  async generateCoverLetter() {
    if (this.isInteractionDisabled) return;
    
    if (!this.jobOfferText || !this.currentCvData) {
      this.presentToast('Données requises manquantes pour la lettre', 'warning');
      return;
    }

    this.isGeneratingCoverLetter = true;
    this.updateGlobalSpinnerMessage();
    this.generatedCoverLetter = null;

    try {
      // Utiliser les données actuelles (améliorées) pour la lettre
      const cvText = this.generateTextFromCvData(this.currentCvData);
      const letterResult = await this.aiService.generateCoverLetter(this.jobOfferText, cvText);
      
      this.generatedCoverLetter = letterResult;
      this.presentToast('Lettre de motivation générée !', 'success');
      
    } catch (error) {
      let errorMessage = "Erreur lors de la génération de la lettre.";
      if (error instanceof Error) { 
        errorMessage = error.message; 
      }
      this.presentToast(errorMessage, 'danger');
    } finally {
      this.isGeneratingCoverLetter = false;
    }
  }

  async saveCandidature() {
    if (this.isInteractionDisabled) return;
    
    if (!this.jobOfferText || !this.atsAnalysisResult || !this.generatedCoverLetter) {
      this.presentToast('Veuillez d\'abord générer l\'analyse ATS et la lettre de motivation.', 'warning');
      return;
    }
  
    if (!this.currentCvData) {
      this.presentToast('Aucune donnée CV disponible.', 'warning');
      return;
    }
  
    const jobTitle = this.atsAnalysisResult.jobTitle || 'Poste non spécifié';
    const company = this.atsAnalysisResult.company || 'Entreprise non spécifiée';
  
    this.isSavingCandidature = true;
    this.updateGlobalSpinnerMessage();
  
    const candidatureDetails = {
      intitulePoste: jobTitle,
      entreprise: company,
      statut: 'envoyee' as StatutCandidature,
      poste: jobTitle,
      offreTexteComplet: this.jobOfferText,
      cvOriginalNom: `CV_${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`,
      cvTexteExtrait: this.generateTextFromCvData(this.currentCvData),
      analyseATS: this.atsAnalysisResult.analysisText,
      lettreMotivationGeneree: this.generatedCoverLetter,
      
      // ✅ NOUVEAU : Sauvegarder le snapshot CV pour reconstruction
      cvDataSnapshot: {
        experiences: this.currentCvData.experiences,
        formations: this.currentCvData.formations,
        competences: this.currentCvData.competences
      },
      cvTemplateId: this.selectedTemplate?.id || 'modern',
      cvTheme: this.selectedTheme
    };
  
    try {
  
      await this.candidatureService.createCandidature(candidatureDetails);
      
      this.presentToast('Candidature sauvegardée avec succès !', 'success');
      this.resetForm();
      this.router.navigate(['/tabs/dashboard']);
      
    } catch (error) {
      let errorMessage = "Erreur lors de la sauvegarde de la candidature.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.presentToast(errorMessage, 'danger');
    } finally {
      this.isSavingCandidature = false;
    }
  }

  /**
   * Remet à zéro le formulaire
   */
  resetForm() {
    this.jobOfferText = '';
    this.atsAnalysisResult = null;
    this.generatedCoverLetter = null;
    this.aiError = null;
    this.structuredCvImprovements = null;
    this.improvedCvData = null;
    this.improvementsApplied = false;
    this.cvImprovementsValidated = false;
    this.comparisonView = 'split';
    this.sliderPosition = 50;
    this.appliedChangesCount = { experiences: 0, formations: 0, competences: 0, total: 0 };
  }

  /**
   * Convertit les données CV structurées en texte
   */
  private generateTextFromCvData(cvData: CvData): string {
    let text = '';

    // Expériences
    if (cvData.experiences?.length > 0) {
      text += 'EXPÉRIENCES PROFESSIONNELLES\n';
      cvData.experiences.forEach(exp => {
        text += `${exp.poste} - ${exp.entreprise}\n`;
        if (exp.description) text += `${exp.description}\n`;
        text += '\n';
      });
    }

    // Formations
    if (cvData.formations?.length > 0) {
      text += 'FORMATIONS\n';
      cvData.formations.forEach(form => {
        text += `${form.diplome} - ${form.etablissement}\n`;
        if (form.description) text += `${form.description}\n`;
        text += '\n';
      });
    }

    // Compétences
    if (cvData.competences?.length > 0) {
      text += 'COMPÉTENCES\n';
      text += cvData.competences.map(comp => comp.nom).join(', ') + '\n';
    }

    return text;
  }

  /**
   * Génère un texte d'affichage formaté pour la comparaison
   */
  generateDisplayTextFromCvData(cvData: CvData): string {
    let text = '';

    // Expériences
    if (cvData.experiences?.length > 0) {
      text += '💼 EXPÉRIENCES PROFESSIONNELLES\n\n';
      cvData.experiences.forEach((exp, index) => {
        text += `${index + 1}. ${exp.poste} - ${exp.entreprise}\n`;
        if (exp.lieu) text += `   📍 ${exp.lieu}\n`;
        if (exp.description) text += `   📝 ${exp.description}\n`;
        text += '\n';
      });
    }

    // Formations
    if (cvData.formations?.length > 0) {
      text += '🎓 FORMATIONS\n\n';
      cvData.formations.forEach((form, index) => {
        text += `${index + 1}. ${form.diplome} - ${form.etablissement}\n`;
        if (form.ville) text += `   📍 ${form.ville}\n`;
        if (form.description) text += `   📝 ${form.description}\n`;
        text += '\n';
      });
    }

    // Compétences
    if (cvData.competences?.length > 0) {
      text += '🛠️ COMPÉTENCES\n\n';
      const competencesByCategory = cvData.competences.reduce((acc: any, comp) => {
        const category = comp.categorie || 'Autre';
        if (!acc[category]) acc[category] = [];
        acc[category].push(comp.nom);
        return acc;
      }, {});

      Object.keys(competencesByCategory).forEach(category => {
        text += `${category}:\n`;
        text += competencesByCategory[category].join(', ') + '\n\n';
      });
    }

    return text || 'Aucune donnée CV disponible';
  }

  // Méthodes utilitaires pour la comparaison
  getTotalChangesCount(): number {
    return this.appliedChangesCount.total;
  }

  getChangesCount(section: 'experiences' | 'formations' | 'competences'): number {
    return this.appliedChangesCount[section];
  }

  // Méthodes utilitaires pour les améliorations
  selectAllImprovements(select: boolean) {
    if (this.isInteractionDisabled) return;
    if (!this.structuredCvImprovements) return;

    this.structuredCvImprovements.improvements.experiences.forEach(section => {
      section.improvements.forEach(improvement => {
        improvement.accepted = select;
      });
    });
    this.structuredCvImprovements.improvements.formations.forEach(section => {
      section.improvements.forEach(improvement => {
        improvement.accepted = select;
      });
    });
    this.structuredCvImprovements.improvements.competences.forEach(section => {
      section.improvements.forEach(improvement => {
        improvement.accepted = select;
      });
    });
    this.structuredCvImprovements.improvements.suggestedCompetences.forEach(competence => {
      competence.accepted = select;
    });
  }

  hasAcceptedImprovements(): boolean {
    if (!this.structuredCvImprovements) return false;

    const hasAcceptedSuggestions = this.structuredCvImprovements.improvements.experiences.some(section => 
      section.improvements.some(imp => imp.accepted)
    ) || this.structuredCvImprovements.improvements.formations.some(section => 
      section.improvements.some(imp => imp.accepted)
    ) || this.structuredCvImprovements.improvements.competences.some(section => 
      section.improvements.some(imp => imp.accepted)
    );

    const hasAcceptedCompetences = this.structuredCvImprovements.improvements.suggestedCompetences.some(comp => comp.accepted);

    return hasAcceptedSuggestions || hasAcceptedCompetences;
  }

  getAcceptedCount(): number {
    if (!this.structuredCvImprovements) return 0;

    let count = 0;
    
    this.structuredCvImprovements.improvements.experiences.forEach(section => {
      count += section.improvements.filter(imp => imp.accepted).length;
    });
    this.structuredCvImprovements.improvements.formations.forEach(section => {
      count += section.improvements.filter(imp => imp.accepted).length;
    });
    this.structuredCvImprovements.improvements.competences.forEach(section => {
      count += section.improvements.filter(imp => imp.accepted).length;
    });
    count += this.structuredCvImprovements.improvements.suggestedCompetences.filter(comp => comp.accepted).length;

    return count;
  }

  getImprovementTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'orthographe': 'Orthographe',
      'reformulation': 'Reformulation',
      'mots-cles': 'Mots-clés ATS',
      'structure': 'Structure',
      'ajout': 'Ajout'
    };
    return labels[type] || type;
  }

  getImpactLabel(impact: string): string {
    const labels: { [key: string]: string } = {
      'faible': 'Impact faible',
      'moyen': 'Impact moyen',
      'fort': 'Impact fort'
    };
    return labels[impact] || impact;
  }

  onImprovementToggle() {
    if (this.isInteractionDisabled) return;
    // Méthode appelée lors du toggle d'une amélioration
    // Logique supplémentaire si nécessaire
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' | 'light') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    toast.present();
  }
}