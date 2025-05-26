import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonFab, IonFabButton, IonIcon, IonList,
  IonItem, IonLabel, IonSpinner, IonListHeader, IonItemSliding,
  IonItemOptions, IonItemOption
} from '@ionic/angular/standalone';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component';
import { HeaderService } from 'src/app/services/header/header.service';
import { ModalController } from '@ionic/angular/standalone';
import { ExperienceModalComponent } from 'src/app/components/experience-modal/experience-modal.component';
import { Experience } from 'src/app/models/experience.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { addIcons } from 'ionicons';
import { addOutline, listOutline, businessOutline, createOutline, trashOutline } from 'ionicons/icons'; // eyeOutline retiré

@Component({
  selector: 'app-my-cv',
  templateUrl: './my-cv.page.html',
  styleUrls: ['./my-cv.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe,
    IonContent, IonHeader, IonFab, IonFabButton, IonIcon, IonList, IonItem,
    IonLabel, IonSpinner, IonListHeader, IonItemSliding, IonItemOptions, IonItemOption,
    UserHeaderComponent
  ]
})
export class MyCvPage implements OnInit {
  public experiences: Experience[] = [];
  public isLoadingExperiences: boolean = false;
  private isModalOpening: boolean = false; // Verrou pour l'ouverture du modal

  constructor(
    private headerService: HeaderService,
    private modalCtrl: ModalController,
    private authService: AuthService
    ) {
    addIcons({ addOutline, listOutline, businessOutline, createOutline, trashOutline });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Mon CV Structuré');
    this.headerService.setShowBackButton(true);
    this.loadExperiences();
  }

  loadExperiences() {
    this.isLoadingExperiences = true;
    setTimeout(() => {
      this.isLoadingExperiences = false;
    }, 500);
  }

  async addExperience() {
    await this.openExperienceModal();
  }

  async editExperience(experienceToEdit: Experience, slidingItem?: IonItemSliding) {
    if (slidingItem) {
      await slidingItem.close();
    }
    await this.openExperienceModal(experienceToEdit);
  }

  async openExperienceModal(experience?: Experience) {
    if (this.isModalOpening) { // Si un modal est déjà en train de s'ouvrir ou est ouvert
      return; 
    }
    this.isModalOpening = true; // Met le verrou

    try {
      const modal = await this.modalCtrl.create({
        component: ExperienceModalComponent,
        componentProps: {
          experience: experience ? { ...experience } : null,
          isEditMode: !!experience
        }
      });

      await modal.present();

      const { data, role } = await modal.onWillDismiss();
      this.isModalOpening = false; // Retire le verrou une fois le modal fermé

      if (role === 'save' && data && this.isPartialExperience(data)) {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          console.error("Utilisateur non authentifié, impossible de sauvegarder l'expérience.");
          return;
        }

        const experienceToSave: Experience = {
          userId: currentUser.uid,
          poste: data.poste || '',
          entreprise: data.entreprise || '',
          lieu: data.lieu || undefined,
          dateDebut: data.dateDebut || new Date().toISOString(),
          dateFin: data.dateFin || null,
          enCours: data.enCours || false,
          description: data.description || undefined,
          id: data.id || (experience ? experience.id : undefined)
        };
        
        if (this.isEditableExperience(experience) && experience.id) {
          const index = this.experiences.findIndex(exp => exp.id === experience.id);
          if (index > -1) {
            this.experiences[index] = experienceToSave;
          }
        } else {
          experienceToSave.id = new Date().getTime().toString();
          this.experiences.push(experienceToSave);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture ou la gestion du modal d'expérience:", error);
      this.isModalOpening = false; // S'assurer de retirer le verrou en cas d'erreur
    }
  }
  
  async deleteExperience(experienceId?: string, slidingItem?: IonItemSliding) {
    if (slidingItem) {
      await slidingItem.close();
    }
    if (!experienceId) return;
    this.experiences = this.experiences.filter(exp => exp.id !== experienceId);
  }

  private isPartialExperience(data: any): data is Partial<Experience> {
    return data && typeof data.poste === 'string' && typeof data.entreprise === 'string';
  }

  private isEditableExperience(experience?: Experience): experience is Experience & { id: string } {
    return !!(experience && experience.id);
  }
}