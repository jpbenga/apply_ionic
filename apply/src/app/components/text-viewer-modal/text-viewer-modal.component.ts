import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonButtons, IonIcon, IonLabel, IonSpinner, IonSegment, IonSegmentButton
} from '@ionic/angular/standalone';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { Clipboard } from '@capacitor/clipboard';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as mammoth from 'mammoth';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

type ViewMode = 'cv' | 'letter';

@Component({
  selector: 'app-text-viewer-modal',
  templateUrl: './text-viewer-modal.component.html',
  styleUrls: ['./text-viewer-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxExtendedPdfViewerModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonButtons, IonIcon, IonLabel, IonSpinner, IonSegment, IonSegmentButton
  ]
})
export class TextViewerModalComponent implements OnInit {
  @Input() cvTexteExtrait?: string;
  @Input() lettreMotivationGeneree?: string;
  @Input() cvOriginalUrl?: string;
  @Input() cvOriginalFileName?: string;

  isCvPdf: boolean = false;
  isCvDocx: boolean = false;
  docxHtmlContent: SafeHtml | null = null;
  isLoadingCvPreview: boolean = false;

  currentView: ViewMode = 'cv';
  hasCvContent: boolean = false;
  hasLetterContent: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.hasCvContent = !!(this.cvTexteExtrait || this.cvOriginalUrl);
    this.hasLetterContent = !!this.lettreMotivationGeneree;

    if (this.hasCvContent) {
      this.currentView = 'cv';
    } else if (this.hasLetterContent) {
      this.currentView = 'letter';
    }
    
    if (this.cvOriginalUrl && this.currentView === 'cv') {
      const fileName = (this.cvOriginalFileName || this.cvOriginalUrl).toLowerCase();
      if (fileName.endsWith('.pdf')) {
        this.isCvPdf = true;
      } else if (fileName.endsWith('.docx')) {
        this.isCvDocx = true;
        if (!this.docxHtmlContent) { 
          this.loadDocxPreview();
        }
      }
    }
  }

  async loadDocxPreview() {
    if (!this.cvOriginalUrl) return;
    this.isLoadingCvPreview = true;
    this.docxHtmlContent = null;
    try {
      const response = await fetch(this.cvOriginalUrl);
      if (!response.ok) throw new Error(`Erreur téléchargement DOCX: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      this.docxHtmlContent = this.sanitizer.bypassSecurityTrustHtml(result.value);
    } catch (error) {
      console.error('Erreur conversion DOCX en HTML:', error);
      this.docxHtmlContent = this.sanitizer.bypassSecurityTrustHtml('<p style="color: red; text-align: center;">Aperçu DOCX indisponible.</p>');
    } finally {
      this.isLoadingCvPreview = false;
    }
  }

  segmentChanged(event: any) {
    this.currentView = event.detail.value as ViewMode;
    if (this.currentView === 'cv' && this.isCvDocx && this.cvOriginalUrl && !this.docxHtmlContent && !this.isLoadingCvPreview) {
      this.loadDocxPreview();
    }
  }

  async copyContent() {
    let textToCopy = '';
    if (this.currentView === 'cv') {
      textToCopy = this.cvTexteExtrait || '';
      if (!textToCopy && this.isCvDocx) {
         this.presentToast('La copie de l\'aperçu DOCX n\'est pas optimisée. Copiez le texte extrait s\'il est disponible.', 'light');
         return;
      }
    } else if (this.currentView === 'letter') {
      textToCopy = this.lettreMotivationGeneree || '';
    }

    if (!textToCopy) {
      this.presentToast('Aucun texte brut à copier pour cette vue.', 'warning');
      return;
    }
    try {
      await Clipboard.write({ string: textToCopy });
      this.presentToast('Texte copié !', 'success');
    } catch (e) {
      this.presentToast('Erreur de copie.', 'danger');
    }
  }

  dismissModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'light') {
    const toast = await this.toastCtrl.create({ message, duration: 2500, position: 'bottom', color, buttons: [{ text: 'OK', role: 'cancel'}] });
    toast.present();
  }
}