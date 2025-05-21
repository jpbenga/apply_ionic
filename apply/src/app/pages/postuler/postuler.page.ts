import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel,
  IonTextarea, IonButton, IonIcon, IonGrid, IonRow, IonCol,
  IonSpinner // Ajout pour l'indicateur de chargement
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/services/header/header.service';
import { AIService } from 'src/app/services/ai/ai.service'; // Importe AIService

@Component({
  selector: 'app-postuler',
  templateUrl: './postuler.page.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle,
    IonItem, IonLabel, IonTextarea, IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonSpinner // Ajout pour l'indicateur de chargement
  ]
})
export class PostulerPage {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  jobOfferText: string = '';
  selectedFileName: string | null = null;
  selectedFile: File | null = null;
  extractedCvText: string | null = null; // Pour stocker le texte du CV extrait
  isExtractingText: boolean = false; // Pour l'indicateur de chargement

  constructor(
    private headerService: HeaderService,
    private aiService: AIService // Injecte AIService
  ) { }

  ionViewWillEnter() {
    this.headerService.updateTitle('Postuler');
    this.headerService.setShowBackButton(false);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  async handleFileSelected(event: Event) {
    this.extractedCvText = null; // Réinitialise le texte extrait
    this.isExtractingText = false; // Réinitialise l'indicateur

    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.selectedFileName = this.selectedFile.name;

      // Vérifie si c'est un fichier DOCX
      if (this.selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || this.selectedFile.name.toLowerCase().endsWith('.docx')) {
        this.isExtractingText = true;
        try {
          this.extractedCvText = await this.aiService.extractTextFromDocx(this.selectedFile);
          console.log('Texte du CV extrait (DOCX):', this.extractedCvText);
          if (!this.extractedCvText || this.extractedCvText.trim() === '') {
            alert('Impossible d\'extraire le texte du DOCX ou le fichier est vide.');
          }
        } catch (error) {
          console.error('Erreur lors de l\'extraction du texte du DOCX:', error);
          alert(`Erreur extraction DOCX: ${error}`);
          this.extractedCvText = null; // Assure-toi qu'il est nul en cas d'erreur
        } finally {
          this.isExtractingText = false;
        }
      } else if (this.selectedFile.type === 'application/pdf' || this.selectedFile.name.toLowerCase().endsWith('.pdf')) {
        console.log('Fichier PDF sélectionné. L\'extraction PDF sera gérée à l\'étape suivante.');
        // Préparation pour l'étape d'extraction PDF
      } else {
        console.warn('Type de fichier non supporté pour l\'extraction automatique:', this.selectedFile.type);
        alert('Type de fichier non supporté pour l\'extraction automatique de texte. Veuillez choisir un DOCX ou PDF.');
      }

    } else {
      this.clearFileSelection();
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
        console.log('Texte extrait du CV disponible.');
      }
    } else {
      console.log('Aucun CV sélectionné pour la génération.');
    }
  }
}