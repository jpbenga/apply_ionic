import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonFab, IonFabButton, IonIcon, IonList, 
  IonItem, IonLabel, IonSpinner, IonListHeader, IonItemSliding, 
  IonItemOptions, IonItemOption, IonButton 
} from '@ionic/angular/standalone';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component';
import { HeaderService } from 'src/app/services/header/header.service';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ExperienceModalComponent } from 'src/app/components/experience-modal/experience-modal.component';
import { Experience } from 'src/app/models/experience.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CvDataService } from 'src/app/services/cv-data/cv-data.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, first, timeout } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import { addOutline, listOutline, businessOutline, createOutline, trashOutline, cloudOfflineOutline } from 'ionicons/icons';

@Component({
  selector: 'app-my-cv',
  templateUrl: './my-cv.page.html',
  styleUrls: ['./my-cv.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe,
    IonContent, IonHeader, IonFab, IonFabButton, IonIcon, IonList, IonItem, 
    IonLabel, IonSpinner, IonListHeader, IonItemSliding, IonItemOptions, IonItemOption,
    IonButton, 
    UserHeaderComponent
  ]
})
export class MyCvPage implements OnInit, OnDestroy {
  public experiences$: Observable<Experience[]> = of([]);
  private destroy$ = new Subject<void>();
  public isLoadingExperiences: boolean = false;
  public errorLoadingExperiences: string | null = null;
  private isModalOpening: boolean = false;

  constructor(
    private headerService: HeaderService,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private cvDataService: CvDataService,
    private toastCtrl: ToastController
    ) {
    addIcons({ addOutline, listOutline, businessOutline, createOutline, trashOutline, cloudOfflineOutline });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Mon CV Structuré');
    this.headerService.setShowBackButton(true); 
    this.loadExperiences();
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExperiences(event?: any) {
    this.isLoadingExperiences = true;
    this.errorLoadingExperiences = null;
    this.experiences$ = of([]); 

    const TIMEOUT_DURATION = 15000;

    this.cvDataService.getExperiences().pipe(
      first(), 
      timeout(TIMEOUT_DURATION),
      catchError(error => {
        this.isLoadingExperiences = false;
        if (error.name === 'TimeoutError') {
          this.errorLoadingExperiences = 'Le chargement a pris trop de temps.';
        } else {
          this.errorLoadingExperiences = 'Impossible de charger les expériences.';
        }
        console.error('Erreur chargement expériences:', error);
        if (event && event.target && typeof event.target.complete === 'function') {
          event.target.complete();
        }
        return of([]);
      }),
      finalize(() => {
        this.isLoadingExperiences = false; 
        if (event && event.target && typeof event.target.complete === 'function') {
          event.target.complete();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(experiences => {
      this.experiences$ = of(experiences);
      if (!event) { 
        this.isLoadingExperiences = false;
      }
    });
  }
  
  getDisplayDate(dateValue: Timestamp | Date | string | null | undefined): Date | null {
    if (!dateValue) return null;
    if (dateValue instanceof Timestamp) {
      return dateValue.toDate();
    }
    if (dateValue instanceof Date) {
      return dateValue;
    }
    const parsedDate = new Date(dateValue);
    return !isNaN(parsedDate.getTime()) ? parsedDate : null;
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
    if (this.isModalOpening) {
      return; 
    }
    this.isModalOpening = true;

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
      this.isModalOpening = false;

      if (role === 'save' && data && this.isPartialExperienceData(data)) {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          this.presentToast("Utilisateur non authentifié, impossible de sauvegarder.", "danger");
          return;
        }

        const experienceDataToSave: Omit<Experience, 'id' | 'userId'> = {
          poste: data.poste || '',
          entreprise: data.entreprise || '',
          lieu: data.lieu || undefined,
          dateDebut: data.dateDebut || new Date().toISOString(), 
          dateFin: data.dateFin || null,
          enCours: data.enCours || false,
          description: data.description || undefined
        };
        
        try {
          if (this.isEditableExperience(experience) && experience.id) {
            await this.cvDataService.updateExperience(experience.id, experienceDataToSave);
            this.presentToast('Expérience mise à jour avec succès.', 'success');
          } else {
            await this.cvDataService.addExperience(experienceDataToSave);
            this.presentToast('Expérience ajoutée avec succès.', 'success');
          }
          this.loadExperiences(); 
        } catch (e) {
          console.error("Erreur sauvegarde expérience Firestore:", e);
          this.presentToast("Erreur lors de la sauvegarde de l'expérience.", "danger");
        }
      }
    } catch (error) {
      console.error("Erreur ouverture modal expérience:", error);
      this.isModalOpening = false;
    }
  }
  
  async deleteExperience(experienceId?: string, slidingItem?: IonItemSliding) {
    if (slidingItem) {
      await slidingItem.close();
    }
    if (!experienceId) return;
    
    try {
      await this.cvDataService.deleteExperience(experienceId);
      this.presentToast('Expérience supprimée.', 'success');
      this.loadExperiences(); 
    } catch (e) {
      console.error("Erreur suppression expérience:", e);
      this.presentToast("Erreur lors de la suppression de l'expérience.", "danger");
    }
  }

  private isPartialExperienceData(data: any): data is Partial<Omit<Experience, 'id' | 'userId'>> {
    return data && typeof data.poste === 'string' && typeof data.entreprise === 'string';
  }

  private isEditableExperience(experience?: Experience): experience is Experience & { id: string } {
    return !!(experience && experience.id);
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom', color });
    toast.present();
  }
}