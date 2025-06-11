// src/app/components/cv-upload/cv-upload.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonIcon, IonProgressBar, IonText
} from '@ionic/angular/standalone';
// import { addIcons } from 'ionicons'; // SUPPRIMÉ
// import {
//   cloudUploadOutline, documentTextOutline, checkmarkCircleOutline,
//   alertCircleOutline, closeCircleOutline
// } from 'ionicons/icons'; // SUPPRIMÉ
// import { Functions, httpsCallable } from '@angular/fire/functions'; // SUPPRIMÉ
// import { StorageService } from 'src/app/services/storage/storage.service'; // SUPPRIMÉ
import { FileExtractionService } from '../../shared/services/file-extraction/file-extraction.service'; // MODIFIED

export interface CvUploadResult {
  success: boolean;
  extractedText?: string;
  fileName?: string;
  error?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'extracting' | 'success' | 'error';

@Component({
  selector: 'app-cv-upload',
  templateUrl: './cv-upload.component.html',
  styleUrls: ['./cv-upload.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonIcon, IonProgressBar, IonText
  ]
})
export class CvUploadComponent {
  @Output() uploadComplete = new EventEmitter<CvUploadResult>();

  public uploadStatus: UploadStatus = 'idle';
  public selectedFile: File | null = null;
  public extractedText: string = '';
  public errorMessage: string = '';
  public currentStep: string = '';

  constructor(
    // private storageService: StorageService, // SUPPRIMÉ
    // private functions: Functions,           // SUPPRIMÉ
    private fileExtractionService: FileExtractionService, // AJOUTÉ
  ) {
    // addIcons({ // SUPPRIMÉ
    //   cloudUploadOutline, documentTextOutline, checkmarkCircleOutline,
    //   alertCircleOutline, closeCircleOutline
    // });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      this.showError('Veuillez sélectionner un fichier PDF ou DOCX.');
      return;
    }

    // Vérifier la taille (limite à 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showError('Le fichier ne doit pas dépasser 10MB.');
      return;
    }

    this.selectedFile = file;
    this.uploadStatus = 'idle';
    this.errorMessage = '';
  }

  async processFile() {
    if (!this.selectedFile) return;

    try {
      this.uploadStatus = 'extracting'; // Ou 'processing' si on veut être plus générique
      this.currentStep = 'Traitement du fichier...';

      // Appel au nouveau service pour l'upload ET l'extraction
      const extractedText = await this.fileExtractionService.extractTextFromFile(this.selectedFile);

      this.extractedText = extractedText;
      this.uploadStatus = 'success';
      this.currentStep = 'Extraction terminée !';

      // Émettre le résultat
      this.uploadComplete.emit({
        success: true,
        extractedText: extractedText,
        fileName: this.selectedFile.name
      });

    } catch (error: any) {
      console.error('Erreur lors du traitement:', error);
      this.showError(error.message || 'Erreur lors du traitement du fichier');
    }
  }

  // Les méthodes extractPdfText et extractDocxText sont supprimées.

  private showError(message: string) {
    this.uploadStatus = 'error';
    this.errorMessage = message;
    this.uploadComplete.emit({
      success: false,
      error: message
    });
  }

  reset() {
    this.uploadStatus = 'idle';
    this.selectedFile = null;
    this.extractedText = '';
    this.errorMessage = '';
    this.currentStep = '';
  }

  get statusIcon(): string {
    switch (this.uploadStatus) {
      case 'success': return 'checkmark-circle-outline';
      case 'error': return 'close-circle-outline';
      case 'uploading':
      case 'extracting': return 'document-text-outline';
      default: return 'cloud-upload-outline';
    }
  }

  get statusColor(): string {
    switch (this.uploadStatus) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'uploading':
      case 'extracting': return 'primary';
      default: return 'medium';
    }
  }

  get isProcessing(): boolean {
    return this.uploadStatus === 'uploading' || this.uploadStatus === 'extracting';
  }
}