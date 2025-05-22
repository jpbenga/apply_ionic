import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
  IonTextarea, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonSpinner,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { AIService, ATSAnalysisResult } from 'src/app/services/ai/ai.service';

@Component({
  selector: 'app-postuler',
  templateUrl: './postuler.page.html',
  styleUrls: [],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonTextarea, IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent
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

  constructor(
    private headerService: HeaderService,
    private aiService: AIService
  ) { }

  ionViewWillEnter() {
    this.headerService.updateTitle('Postuler');
    this.headerService.setShowBackButton(false);
  }

  triggerFileInput() {
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
          alert('Type de fichier non supporté. Veuillez choisir un DOCX ou PDF.');
          this.clearFileSelection();
          this.isExtractingText = false; // Ajout pour stopper le spinner en cas de type non supporté
          return;
        }

        if (!this.extractedCvText || this.extractedCvText.trim() === '') {
          this.extractedCvText = null;
        }

      } catch (error) {
        let errorMessage = 'Erreur inconnue lors du traitement du fichier.';
        if (error instanceof Error) { errorMessage = error.message; }
        else if (typeof error === 'string') { errorMessage = error; }
        alert(`Erreur: ${errorMessage}`);
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
      alert("Veuillez saisir l'offre d'emploi.");
      return;
    }
    if (!this.extractedCvText) {
      alert("Veuillez sélectionner un CV et attendre l'extraction de son texte, ou le texte n'a pas pu être extrait.");
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
      alert(`Erreur IA: ${errorMessage}`);
    } finally {
      this.isGeneratingAIContent = false;
    }
  }

  getFileTypeLabel(file: File | null): string {
    if (!file || !file.name) {
      return '';
    }
    if (file.name.toLowerCase().endsWith('.docx')) {
      return 'DOCX';
    }
    if (file.name.toLowerCase().endsWith('.pdf')) {
      return 'PDF';
    }
    return 'FICHIER';
  }
}