// src/app/components/generate-cv-modal/generate-cv-modal.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonButton, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { CvTemplateSelectorComponent } from '../cv-template-selector/cv-template-selector.component';
import { CvThemePickerComponent } from '../cv-theme-picker/cv-theme-picker.component';
import { CvPreviewComponent } from '../cv-preview/cv-preview.component';
import { CvTemplate } from 'src/app/models/cv-template.model';
import { CvGenerationService } from 'src/app/services/cv-generation/cv-generation.service';
// import { addIcons } from 'ionicons'; // SUPPRIMÉ
// import { closeOutline } from 'ionicons/icons'; // SUPPRIMÉ

@Component({
  selector: 'app-generate-cv-modal',
  templateUrl: './generate-cv-modal.component.html',
  styleUrls: ['./generate-cv-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonButton,
    IonIcon,
    IonButtons,
    CvTemplateSelectorComponent,
    CvThemePickerComponent,
    CvPreviewComponent
  ]
})
export class GenerateCvModalComponent {
  selectedTemplate: CvTemplate | null = null;
  selectedTheme: string = '#007bff'; // Couleur par défaut
  isGenerating = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private cvGenerationService: CvGenerationService,
    private cdr: ChangeDetectorRef
  ) {
    // addIcons({ closeOutline }); // SUPPRIMÉ
  }

  dismissModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async handleGenerate() {
    if (!this.selectedTemplate) {
      this.presentToast('Veuillez sélectionner un template', 'warning');
      return;
    }

    this.isGenerating = true;

    try {
      const cvId = await this.cvGenerationService.saveGeneratedCv(
        this.selectedTemplate.id,
        { 
          primaryColor: this.selectedTheme,
          secondaryColor: this.lightenColor(this.selectedTheme, 20),
          textColor: '#333333',
          backgroundColor: '#ffffff'
        }
      );

      await this.presentToast('CV généré avec succès !', 'success');
      
      this.modalCtrl.dismiss({ 
        template: this.selectedTemplate, 
        theme: this.selectedTheme,
        cvId 
      }, 'generate');

    } catch (error) {
      console.error('Erreur lors de la génération du CV:', error);
      await this.presentToast('Erreur lors de la génération du CV', 'danger');
    } finally {
      this.isGenerating = false;
    }
  }

  onTemplateSelected(template: CvTemplate) {
    this.selectedTemplate = template;
    console.log('Template sélectionné:', template);
  }

  onThemeSelected(theme: string) {
    this.selectedTheme = theme;
    console.log('Thème sélectionné:', theme);
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
}