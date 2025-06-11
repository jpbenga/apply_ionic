import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonIcon, IonProgressBar, IonText
} from '@ionic/angular/standalone';
import { FileExtractionService } from '../../shared/services/file-extraction/file-extraction.service';

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
  @Output() processingStarted = new EventEmitter<void>();
  @Output() uploadComplete = new EventEmitter<CvUploadResult>();

  public uploadStatus: UploadStatus = 'idle';
  public selectedFile: File | null = null;
  public extractedText: string = '';
  public errorMessage: string = '';
  public currentStep: string = '';

  constructor(
    private fileExtractionService: FileExtractionService,
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      this.showError('Veuillez sélectionner un fichier PDF ou DOCX.');
      return;
    }

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

    this.processingStarted.emit();

    try {
      this.uploadStatus = 'extracting';
      this.currentStep = 'Traitement du fichier...';

      const extractedText = await this.fileExtractionService.extractTextFromFile(this.selectedFile);

      this.extractedText = extractedText;
      this.uploadStatus = 'success';
      this.currentStep = 'Extraction terminée !';

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