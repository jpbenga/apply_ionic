// src/app/components/cv-upload/cv-upload.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonIcon, IonProgressBar, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cloudUploadOutline, documentTextOutline, checkmarkCircleOutline,
  alertCircleOutline, closeCircleOutline
} from 'ionicons/icons';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { StorageService } from 'src/app/services/storage/storage.service';

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
    private storageService: StorageService,
    private functions: Functions
  ) {
    addIcons({
      cloudUploadOutline, documentTextOutline, checkmarkCircleOutline,
      alertCircleOutline, closeCircleOutline
    });
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
      this.uploadStatus = 'uploading';
      this.currentStep = 'Upload du fichier...';

      // Upload vers Firebase Storage
      const fileUrl = await this.storageService.uploadFile(
        this.selectedFile,
        'temp_cvs'
      );

      this.uploadStatus = 'extracting';
      this.currentStep = 'Extraction du texte...';

      // Extraction du texte selon le type de fichier
      let extractedText = '';
      if (this.selectedFile.type === 'application/pdf') {
        extractedText = await this.extractPdfText(fileUrl, this.selectedFile.name);
      } else {
        extractedText = await this.extractDocxText(fileUrl, this.selectedFile.name);
      }

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

  private async extractPdfText(fileUrl: string, fileName: string): Promise<string> {
    const extractPdfFunction = httpsCallable(this.functions, 'extractPdfText');
    const result = await extractPdfFunction({
      pdfUrl: fileUrl,
      fileName: fileName
    });

    const data = result.data as any;
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de l\'extraction PDF');
    }

    return data.text;
  }

  private async extractDocxText(fileUrl: string, fileName: string): Promise<string> {
    const extractDocxFunction = httpsCallable(this.functions, 'extractDocxText');
    const result = await extractDocxFunction({
      docxUrl: fileUrl,
      fileName: fileName
    });

    const data = result.data as any;
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de l\'extraction DOCX');
    }

    return data.text;
  }

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