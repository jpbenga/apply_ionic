import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
  IonTextarea, IonButton, IonIcon, IonSpinner,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle,
  IonRadioGroup, IonRadio, IonCheckbox, IonChip, ToastController
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { AIService, ATSAnalysisResult } from 'src/app/services/ai/ai.service';
import { CandidatureService } from 'src/app/services/candidature/candidature.service';
import { CvGenerationService } from 'src/app/services/cv-generation/cv-generation.service';
import { GeneratedCv } from 'src/app/models/cv-template.model';
import { Candidature } from 'src/app/models/candidature.model';
import { Router } from '@angular/router';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component';
import { Subscription } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { CvImprovementResponse, CvImprovement, CvImprovementResult } from 'src/app/models/cv-improvement.model';

@Component({
  selector: 'app-postuler',
  templateUrl: './postuler.page.html',
  styleUrls: ['./postuler.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonTextarea, IonButton, IonIcon, IonSpinner,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle,
  IonRadioGroup, IonRadio, IonCheckbox, IonChip, UserHeaderComponent
  ]
})
export class PostulerPage implements OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Propriétés existantes
  jobOfferText: string = '';
  selectedFileName: string | null = null;
  selectedFile: File | null = null;
  extractedCvText: string | null = null;
  isExtractingText: boolean = false;

  atsAnalysisResult: ATSAnalysisResult | null = null;
  generatedCoverLetter: string | null = null;
  isGeneratingAIContent: boolean = false;
  aiError: string | null = null;

  isSavingCandidature: boolean = false;

  // Nouvelles propriétés pour la gestion des CVs
  cvSelectionMode: 'recent' | 'upload' = 'upload';
  mostRecentCv: GeneratedCv | null = null;
  mostRecentCvText: string | null = null;
  isLoadingRecentCv: boolean = false;
  saveUploadedCv: boolean = false;

  // Propriétés pour l'amélioration CV
  cvImprovements: CvImprovementResponse | null = null;
  isImprovingCv: boolean = false;
  improvedCvText: string | null = null;
  appliedImprovementsCount: number = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private headerService: HeaderService,
    private aiService: AIService,
    private candidatureService: CandidatureService,
    private cvGenerationService: CvGenerationService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ionViewWillEnter() {
    this.headerService.updateTitle('Postuler');
    this.headerService.setShowBackButton(false);
    this.loadMostRecentCv();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async loadMostRecentCv() {
    this.isLoadingRecentCv = true;
    console.log('🔍 Recherche du CV généré le plus récent...');
    
    try {
      const subscription = this.cvGenerationService.getGeneratedCvs().subscribe({
        next: (cvs) => {
          console.log('📄 CVs générés trouvés:', cvs);
          if (cvs && cvs.length > 0) {
            this.mostRecentCv = cvs[0]; // Le plus récent (trié par date desc)
            this.mostRecentCvText = this.generateTextFromCvData(this.mostRecentCv);
            
            this.cvSelectionMode = 'recent';
            console.log('✅ CV récent sélectionné par défaut:', this.mostRecentCv);
          } else {
            this.mostRecentCv = null;
            this.mostRecentCvText = null;
            this.cvSelectionMode = 'upload';
            console.log('📁 Aucun CV généré trouvé, mode upload sélectionné');
          }
          this.isLoadingRecentCv = false;
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des CVs générés:', error);
          this.mostRecentCv = null;
          this.mostRecentCvText = null;
          this.cvSelectionMode = 'upload';
          this.isLoadingRecentCv = false;
        }
      });
      this.subscriptions.push(subscription);
    } catch (error) {
      console.error('❌ Erreur try/catch lors du chargement du CV récent:', error);
      this.cvSelectionMode = 'upload';
      this.isLoadingRecentCv = false;
    }
  }

  /**
   * Convertit un CV généré en texte simple pour l'IA
   */
  private generateTextFromCvData(cv: GeneratedCv): string {
    if (!cv.data) return '';

    let text = '';

    // Expériences
    if (cv.data.experiences?.length > 0) {
      text += 'EXPÉRIENCES PROFESSIONNELLES\n';
      cv.data.experiences.forEach(exp => {
        text += `${exp.poste} - ${exp.entreprise}\n`;
        if (exp.description) text += `${exp.description}\n`;
        text += '\n';
      });
    }

    // Formations
    if (cv.data.formations?.length > 0) {
      text += 'FORMATIONS\n';
      cv.data.formations.forEach(form => {
        text += `${form.diplome} - ${form.etablissement}\n`;
        if (form.description) text += `${form.description}\n`;
        text += '\n';
      });
    }

    // Compétences
    if (cv.data.competences?.length > 0) {
      text += 'COMPÉTENCES\n';
      text += cv.data.competences.map(comp => comp.nom).join(', ') + '\n';
    }

    return text;
  }

  triggerFileInput() {
    if (this.cvSelectionMode !== 'upload' || this.isExtractingText || this.isGeneratingAIContent || this.isSavingCandidature) return;
    this.fileInput.nativeElement.click();
  }

  async handleFileSelected(event: Event) {
    this.extractedCvText = null;
    this.atsAnalysisResult = null;
    this.generatedCoverLetter = null;
    this.aiError = null;
    this.isExtractingText = true;

    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.selectedFileName = this.selectedFile.name;

      try {
        if (this.selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || this.selectedFile.name.toLowerCase().endsWith('.docx')) {
          this.extractedCvText = await this.aiService.extractTextFromDocx(this.selectedFile);
        } else if (this.selectedFile.type === 'application/pdf' || this.selectedFile.name.toLowerCase().endsWith('.pdf')) {
          this.extractedCvText = await this.aiService.getTextFromPdfViaFunction(this.selectedFile);
        } else {
          this.presentToast('Type de fichier non supporté. Veuillez choisir un DOCX ou PDF.', 'warning');
          this.clearFileSelection();
          this.isExtractingText = false;
          return;
        }
        if (!this.extractedCvText || this.extractedCvText.trim() === '') {
          this.extractedCvText = null;
        }
      } catch (error) {
        let errorMessage = 'Erreur lors du traitement du fichier.';
        if (error instanceof Error) { errorMessage = error.message; }
        else if (typeof error === 'string') { errorMessage = error; }
        this.presentToast(`Erreur: ${errorMessage}`, 'danger');
        this.clearFileSelection();
      } finally {
        this.isExtractingText = false;
      }
    } else {
      this.clearFileSelection();
      this.isExtractingText = false;
    }

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  clearFileSelection() {
    this.selectedFile = null;
    this.selectedFileName = null;
    this.extractedCvText = null;
    this.atsAnalysisResult = null;
    this.generatedCoverLetter = null;
    this.aiError = null;
    this.isExtractingText = false;
    this.saveUploadedCv = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  isCvReady(): boolean {
    if (this.cvSelectionMode === 'recent') {
      return !!this.mostRecentCv && !!this.mostRecentCvText;
    } else {
      return !!this.extractedCvText;
    }
  }

  getCurrentCvText(): string | null {
    if (this.cvSelectionMode === 'recent') {
      return this.mostRecentCvText;
    } else if (this.cvSelectionMode === 'upload') {
      return this.extractedCvText;
    }
    return null;
  }

  getCvDisplayName(): string {
    if (this.cvSelectionMode === 'recent' && this.mostRecentCv) {
      return `CV Généré (${this.mostRecentCv.templateId})`;
    }
    return '';
  }

  getCvCreationDate(): string {
    if (this.cvSelectionMode === 'recent' && this.mostRecentCv) {
      const date = new Date(this.mostRecentCv.createdAt);
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return '';
  }

  async generateApplication() {
    this.aiError = null;
    if (!this.jobOfferText.trim()) {
      this.presentToast("Veuillez saisir l'offre d'emploi.", 'warning');
      return;
    }

    const cvText = this.getCurrentCvText();
    if (!cvText) {
      this.presentToast("Veuillez sélectionner un CV.", 'warning');
      return;
    }

    this.isGeneratingAIContent = true;
    this.atsAnalysisResult = null;
    this.generatedCoverLetter = null;

    try {
      const atsPromise = this.aiService.getATSAnalysis(this.jobOfferText, cvText);
      const letterPromise = this.aiService.generateCoverLetter(this.jobOfferText, cvText);
      const [atsResult, letterResult] = await Promise.all([atsPromise, letterPromise]);
      this.atsAnalysisResult = atsResult;
      this.generatedCoverLetter = letterResult;

      // Note: Pas de sauvegarde de CV uploadé car on utilise le système de CV générés existant
      if (this.cvSelectionMode === 'upload' && this.saveUploadedCv) {
        this.presentToast('Pour sauvegarder un CV, utilisez la section "Mon CV Structuré"', 'warning');
      }
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de la génération par l'IA.";
      if (error instanceof Error) { errorMessage = error.message; }
      else if (typeof error === 'string') { errorMessage = error; }
      this.aiError = errorMessage;
      this.presentToast(`Erreur IA: ${errorMessage}`, 'danger');
    } finally {
      this.isGeneratingAIContent = false;
    }
  }

  getFileTypeLabel(file: File | null): string {
    if (!file || !file.name) { return ''; }
    if (file.name.toLowerCase().endsWith('.docx')) { return 'DOCX'; }
    if (file.name.toLowerCase().endsWith('.pdf')) { return 'PDF'; }
    return 'FICHIER';
  }

  async saveCandidature() {
    if (!this.jobOfferText || !this.atsAnalysisResult || !this.generatedCoverLetter) {
      this.presentToast('Veuillez d\'abord générer l\'analyse ATS et la lettre de motivation.', 'warning');
      return;
    }

    const cvText = this.getCurrentCvText();
    if (!cvText) {
      this.presentToast('Aucun CV disponible.', 'warning');
      return;
    }

    if (!this.atsAnalysisResult.jobTitle || !this.atsAnalysisResult.company) {
      this.presentToast('Le titre du poste ou l\'entreprise n\'a pas pu être extrait correctement par l\'IA. Sauvegarde annulée.', 'warning');
      return;
    }

    this.isSavingCandidature = true;

    // Préparer les données de candidature
    let cvOriginalNom: string | undefined;
    let cvOriginalUrl: string | undefined;
    let fileToUpload: File | null = null;

    if (this.cvSelectionMode === 'recent' && this.mostRecentCv) {
      cvOriginalNom = this.getCvDisplayName();
      // Note: Les CV générés n'ont pas d'URL de fichier, on utilise l'ID
      cvOriginalUrl = `generated_cv_${this.mostRecentCv.id}`;
    } else if (this.cvSelectionMode === 'upload' && this.selectedFile) {
      cvOriginalNom = this.selectedFileName || undefined;
      fileToUpload = this.selectedFile;
    }

    const candidatureDetails: Omit<Candidature, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'dateCandidature'> = {
      poste: this.atsAnalysisResult.jobTitle,
      entreprise: this.atsAnalysisResult.company,
      offreTexteComplet: this.jobOfferText,
      cvOriginalNom: cvOriginalNom,
      cvOriginalUrl: cvOriginalUrl,
      cvTexteExtrait: cvText,
      analyseATS: this.atsAnalysisResult.analysisText,
      lettreMotivationGeneree: this.generatedCoverLetter,
      statut: 'envoyee',
    };

    try {
      await this.candidatureService.createCandidature(candidatureDetails, fileToUpload);
      this.presentToast('Candidature sauvegardée avec succès !', 'success');
      this.resetForm();
      this.router.navigate(['/tabs/dashboard']);
    } catch (error) {
      let errorMessage = "Erreur lors de la sauvegarde de la candidature.";
      if (error instanceof Error) {errorMessage = error.message;}
      else if (typeof error === 'string') { errorMessage = error; }
      this.presentToast(errorMessage, 'danger');
    } finally {
      this.isSavingCandidature = false;
    }
  }

  resetForm() {
    this.jobOfferText = '';
    this.clearFileSelection();
    this.cvSelectionMode = this.mostRecentCv ? 'recent' : 'upload';
    this.atsAnalysisResult = null;
    this.generatedCoverLetter = null;
    this.aiError = null;
    // Reset des améliorations - AJOUTEZ CES LIGNES
  this.cvImprovements = null;
  this.improvedCvText = null;
  this.appliedImprovementsCount = 0;
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' | 'light' ) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    toast.present();
  }
  /**
   * Lance l'amélioration du CV par l'IA
   */
  async improveCv() {
    if (!this.jobOfferText || !this.getCurrentCvText()) {
      this.presentToast('Offre d\'emploi et CV requis pour l\'amélioration', 'warning');
      return;
    }

    this.isImprovingCv = true;
    this.cvImprovements = null;

    try {
      const cvText = this.getCurrentCvText()!;
      const improvements = await this.aiService.improveCvText(this.jobOfferText, cvText);
      
      this.cvImprovements = improvements;
      
      if (improvements.improvements.length === 0) {
        this.presentToast('Excellent ! Aucune amélioration nécessaire pour votre CV.', 'success');
      } else {
        this.presentToast(`${improvements.improvements.length} amélioration(s) suggérée(s)`, 'primary');
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
  applySelectedImprovements() {
    if (!this.cvImprovements || !this.getCurrentCvText()) return;

    try {
      const originalText = this.getCurrentCvText()!;
      const result: CvImprovementResult = this.aiService.applyCvImprovements(
        originalText, 
        this.cvImprovements.improvements
      );

      this.improvedCvText = result.improvedText;
      this.appliedImprovementsCount = result.appliedImprovements.length;

      // Mettre à jour le texte CV selon le mode
      if (this.cvSelectionMode === 'upload') {
        this.extractedCvText = result.improvedText;
      } else if (this.cvSelectionMode === 'recent') {
        this.mostRecentCvText = result.improvedText;
      }

      this.presentToast(`${this.appliedImprovementsCount} amélioration(s) appliquée(s) !`, 'success');
    } catch (error) {
      console.error('Erreur lors de l\'application des améliorations:', error);
      this.presentToast('Erreur lors de l\'application des améliorations', 'danger');
    }
  }

  /**
   * Sélectionne/désélectionne toutes les améliorations
   */
  selectAllImprovements(select: boolean) {
    if (!this.cvImprovements) return;
    
    this.cvImprovements.improvements.forEach(improvement => {
      improvement.accepted = select;
    });
  }

  /**
   * Vérifie s'il y a des améliorations acceptées
   */
  hasAcceptedImprovements(): boolean {
    return this.cvImprovements?.improvements.some(imp => imp.accepted) || false;
  }

  /**
   * Compte les améliorations acceptées
   */
  getAcceptedCount(): number {
    return this.cvImprovements?.improvements.filter(imp => imp.accepted).length || 0;
  }

  /**
   * Callback quand une amélioration est toggleée
   */
  onImprovementToggle() {
    // Optionnel : logique supplémentaire quand l'utilisateur change une sélection
  }

  /**
   * Retourne le label du type d'amélioration
   */
  getImprovementTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'orthographe': 'Orthographe',
      'reformulation': 'Reformulation',
      'mots-cles': 'Mots-clés ATS',
      'structure': 'Structure'
    };
    return labels[type] || type;
  }

  /**
   * Retourne le label de l'impact
   */
  getImpactLabel(impact: string): string {
    const labels: { [key: string]: string } = {
      'faible': 'Impact faible',
      'moyen': 'Impact moyen',
      'fort': 'Impact fort'
    };
    return labels[impact] || impact;
  }
}