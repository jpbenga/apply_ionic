import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
  IonTextarea, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonSpinner,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  ToastController
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { AIService, ATSAnalysisResult } from 'src/app/services/ai/ai.service';
import { CandidatureService } from 'src/app/services/candidature/candidature.service';
import { Candidature } from 'src/app/models/candidature.model';
import { Router } from '@angular/router';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component';

@Component({
  selector: 'app-postuler',
  templateUrl: './postuler.page.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonTextarea, IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, UserHeaderComponent
  ]
})
export class PostulerPage {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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

  constructor(
    private headerService: HeaderService,
    private aiService: AIService,
    private candidatureService: CandidatureService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ionViewWillEnter() {
    this.headerService.updateTitle('Postuler');
    this.headerService.setShowBackButton(false);
  }

  triggerFileInput() {
    if (this.isExtractingText || this.isGeneratingAIContent || this.isSavingCandidature) return;
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
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  async generateApplication() {
    this.aiError = null;
    if (!this.jobOfferText.trim()) {
      this.presentToast("Veuillez saisir l'offre d'emploi.", 'warning');
      return;
    }
    if (!this.extractedCvText) {
      this.presentToast("Veuillez sélectionner un CV et attendre l'extraction de son texte, ou le texte n'a pas pu être extrait.", 'warning');
      return;
    }

    this.isGeneratingAIContent = true;
    this.atsAnalysisResult = null;
    this.generatedCoverLetter = null;

    try {
      const atsPromise = this.aiService.getATSAnalysis(this.jobOfferText, this.extractedCvText);
      const letterPromise = this.aiService.generateCoverLetter(this.jobOfferText, this.extractedCvText);
      const [atsResult, letterResult] = await Promise.all([atsPromise, letterPromise]);
      this.atsAnalysisResult = atsResult;
      this.generatedCoverLetter = letterResult;
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
    if (!this.jobOfferText || !this.selectedFile || !this.extractedCvText || !this.atsAnalysisResult || !this.generatedCoverLetter) {
      this.presentToast('Veuillez d\'abord générer l\'analyse ATS et la lettre de motivation.', 'warning');
      return;
    }
    if (!this.atsAnalysisResult.jobTitle || !this.atsAnalysisResult.company) {
        this.presentToast('Le titre du poste ou l\'entreprise n\'a pas pu être extrait correctement par l\'IA. Sauvegarde annulée.', 'warning');
        return;
    }

    this.isSavingCandidature = true;

    const candidatureDetails: Omit<Candidature, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'dateCandidature'> = {
      poste: this.atsAnalysisResult.jobTitle,
      entreprise: this.atsAnalysisResult.company,
      offreTexteComplet: this.jobOfferText,
      cvOriginalNom: this.selectedFileName || undefined,
      cvTexteExtrait: this.extractedCvText || undefined,
      analyseATS: this.atsAnalysisResult.analysisText,
      lettreMotivationGeneree: this.generatedCoverLetter,
      statut: 'envoyee',
    };

    try {
      await this.candidatureService.createCandidature(candidatureDetails, this.selectedFile);
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
}