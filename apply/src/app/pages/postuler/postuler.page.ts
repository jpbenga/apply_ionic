import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
  IonTextarea, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonSpinner
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { AIService } from 'src/app/services/ai/ai.service';

@Component({
  selector: 'app-postuler',
  templateUrl: './postuler.page.html',
  styleUrls: [],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonTextarea, IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonSpinner
  ]
})
export class PostulerPage {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  jobOfferText: string = '';
  selectedFileName: string | null = null;
  selectedFile: File | null = null;
  extractedCvText: string | null = null;
  isExtractingText: boolean = false;

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
    this.isExtractingText = true;

    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.selectedFileName = this.selectedFile.name;

      try {
        if (this.selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || this.selectedFile.name.toLowerCase().endsWith('.docx')) {
          this.extractedCvText = await this.aiService.extractTextFromDocx(this.selectedFile);
          if (!this.extractedCvText || this.extractedCvText.trim() === '') {
            this.extractedCvText = null;
          }
        } else if (this.selectedFile.type === 'application/pdf' || this.selectedFile.name.toLowerCase().endsWith('.pdf')) {
          this.extractedCvText = await this.aiService.getTextFromPdfViaFunction(this.selectedFile);
          if (!this.extractedCvText || this.extractedCvText.trim() === '') {
            this.extractedCvText = null;
          }
        } else {
          alert('Type de fichier non supporté. Veuillez choisir un DOCX ou PDF.');
          this.clearFileSelection();
        }
      } catch (error) {
        let errorMessage = 'Erreur inconnue lors du traitement du fichier.';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
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
    this.isExtractingText = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  generateApplication() {
    if (this.jobOfferText.trim() === '') {
      console.log('Le champ de l\'offre d\'emploi est vide.');
    } else {
      console.log('Texte de l\'offre d\'emploi :', this.jobOfferText);
    }
    if (this.selectedFile) {
      console.log('CV sélectionné pour la génération :', this.selectedFileName);
      if (this.extractedCvText) {
        console.log('Texte extrait du CV disponible:', this.extractedCvText.substring(0, 200) + '...');
      } else {
        console.log('Aucun texte de CV n\'a pu être extrait ou le fichier n\'a pas encore été traité.');
      }
    } else {
      console.log('Aucun CV sélectionné pour la génération.');
    }
  }
}