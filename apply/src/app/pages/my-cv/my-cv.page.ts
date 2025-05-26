import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonFab, IonFabButton, IonFabList, IonIcon, // Ajout IonFabList
  IonList, IonItem, IonLabel, IonSpinner, IonListHeader, IonItemSliding, 
  IonItemOptions, IonItemOption, IonButton 
} from '@ionic/angular/standalone';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component';
import { HeaderService } from 'src/app/services/header/header.service';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ExperienceModalComponent } from 'src/app/components/experience-modal/experience-modal.component';
import { FormationModalComponent } from 'src/app/components/formation-modal/formation-modal.component';
import { Experience } from 'src/app/models/experience.model';
import { Formation } from 'src/app/models/formation.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CvDataService } from 'src/app/services/cv-data/cv-data.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, first, timeout } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import { addOutline, listOutline, businessOutline, createOutline, trashOutline, schoolOutline, cloudOfflineOutline } from 'ionicons/icons';

@Component({
  selector: 'app-my-cv',
  templateUrl: './my-cv.page.html',
  styleUrls: ['./my-cv.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe,
    IonContent, IonHeader, IonFab, IonFabButton, IonFabList, IonIcon, // IonFabList ajouté ici
    IonList, IonItem, IonLabel, IonSpinner, IonListHeader, IonItemSliding, 
    IonItemOptions, IonItemOption, IonButton, 
    UserHeaderComponent
  ]
})
export class MyCvPage implements OnInit, OnDestroy {
  // ... (le reste de la classe MyCvPage reste identique à la version précédente)
  public experiences$: Observable<Experience[]> = of([]);
  public formations$: Observable<Formation[]> = of([]);
  private destroy$ = new Subject<void>();
  public isLoadingExperiences: boolean = false;
  public isLoadingFormations: boolean = false;
  public errorLoadingExperiences: string | null = null;
  public errorLoadingFormations: string | null = null;
  private isModalOpening: boolean = false;

  constructor(
    private headerService: HeaderService,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private cvDataService: CvDataService,
    private toastCtrl: ToastController
    ) {
    addIcons({ addOutline, listOutline, businessOutline, createOutline, trashOutline, schoolOutline, cloudOfflineOutline });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Mon CV Structuré');
    this.headerService.setShowBackButton(true); 
    this.loadAllCvData();
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllCvData(event?: any) {
    this.loadExperiences(event); // L'event est optionnel pour la première charge
    this.loadFormations(event);  // L'event est optionnel pour la première charge
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

  loadFormations(event?: any) {
    this.isLoadingFormations = true;
    this.errorLoadingFormations = null;
    this.formations$ = of([]);

    const TIMEOUT_DURATION = 15000;

    this.cvDataService.getFormations().pipe(
      first(),
      timeout(TIMEOUT_DURATION),
      catchError(error => {
        this.isLoadingFormations = false;
        if (error.name === 'TimeoutError') {
          this.errorLoadingFormations = 'Le chargement a pris trop de temps.';
        } else {
          this.errorLoadingFormations = 'Impossible de charger les formations.';
        }
        console.error('Erreur chargement formations:', error);
        if (event && event.target && typeof event.target.complete === 'function') {
          // Pour le refresher, il faut s'assurer que l'event vient du bon refresher si tu en as plusieurs
          // Pour l'instant, on suppose un refresher global ou on ne complète pas ici
        }
        return of([]);
      }),
      finalize(() => {
        this.isLoadingFormations = false;
        if (event && event.target && typeof event.target.complete === 'function') {
          // event.target.complete(); // Peut être redondant si géré dans catchError
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(formations => {
      this.formations$ = of(formations);
       if (!event) { 
        this.isLoadingFormations = false;
      }
    });
  }
  
  getDisplayDate(dateValue: Timestamp | Date | string | null | undefined): Date | null {
    if (!dateValue) return null;
    if (dateValue instanceof Timestamp) return dateValue.toDate();
    if (dateValue instanceof Date) return dateValue;
    const parsedDate = new Date(dateValue);
    return !isNaN(parsedDate.getTime()) ? parsedDate : null;
  }

  async addExperience() { await this.openExperienceModal(); }
  async editExperience(exp: Experience, item?: IonItemSliding) { if(item) await item.close(); await this.openExperienceModal(exp); }
  async deleteExperience(id?: string, item?: IonItemSliding) { 
    if(item) await item.close(); 
    if (!id) return; 
    try { 
      await this.cvDataService.deleteExperience(id); 
      this.presentToast('Expérience supprimée.', 'success');
      this.loadExperiences();
    } 
    catch (e) { this.presentToast("Erreur suppression.", "danger"); }
  }

  async addFormation() { await this.openFormationModal(); }
  async editFormation(form: Formation, item?: IonItemSliding) { if(item) await item.close(); await this.openFormationModal(form); }
  async deleteFormation(id?: string, item?: IonItemSliding) {
    if(item) await item.close(); 
    if (!id) return; 
    try { 
      await this.cvDataService.deleteFormation(id); 
      this.presentToast('Formation supprimée.', 'success');
      this.loadFormations();
    } 
    catch (e) { this.presentToast("Erreur suppression.", "danger"); }
  }

  async openExperienceModal(experience?: Experience) {
    if (this.isModalOpening) return;
    this.isModalOpening = true;
    try {
      const modal = await this.modalCtrl.create({ component: ExperienceModalComponent, componentProps: { experience, isEditMode: !!experience } });
      await modal.present();
      const { data, role } = await modal.onWillDismiss();
      if (role === 'save' && data && this.isPartialExperienceData(data)) {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) { this.presentToast("Utilisateur non authentifié.", "danger"); this.isModalOpening = false; return; }
        const dataToSave: Omit<Experience, 'id' | 'userId'> = { 
          poste: data.poste || '', entreprise: data.entreprise || '', lieu: data.lieu,
          dateDebut: data.dateDebut || new Date().toISOString(), dateFin: data.dateFin,
          enCours: data.enCours, description: data.description
        };
        if (this.isEditableExperience(experience) && experience.id) {
          await this.cvDataService.updateExperience(experience.id, dataToSave);
          this.presentToast('Expérience mise à jour.', 'success');
        } else {
          await this.cvDataService.addExperience(dataToSave);
          this.presentToast('Expérience ajoutée.', 'success');
        }
        this.loadExperiences();
      }
    } catch (e) { console.error(e); } 
    finally { this.isModalOpening = false; }
  }

  async openFormationModal(formation?: Formation) {
    if (this.isModalOpening) return;
    this.isModalOpening = true;
    try {
      const modal = await this.modalCtrl.create({ component: FormationModalComponent, componentProps: { formation, isEditMode: !!formation } });
      await modal.present();
      const { data, role } = await modal.onWillDismiss();
      if (role === 'save' && data && this.isPartialFormationData(data)) {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) { this.presentToast("Utilisateur non authentifié.", "danger"); this.isModalOpening = false; return; }
        const dataToSave: Omit<Formation, 'id' | 'userId'> = {
          diplome: data.diplome || '', etablissement: data.etablissement || '', ville: data.ville,
          dateDebut: data.dateDebut || new Date().toISOString(), dateFin: data.dateFin,
          enCours: data.enCours, description: data.description
        };
        if (this.isEditableFormation(formation) && formation.id) {
          await this.cvDataService.updateFormation(formation.id, dataToSave);
          this.presentToast('Formation mise à jour.', 'success');
        } else {
          await this.cvDataService.addFormation(dataToSave);
          this.presentToast('Formation ajoutée.', 'success');
        }
        this.loadFormations();
      }
    } catch (e) { console.error(e); } 
    finally { this.isModalOpening = false; }
  }

  private isPartialExperienceData(data: any): data is Partial<Omit<Experience, 'userId'>> { return data && data.poste && data.entreprise; }
  private isEditableExperience(exp?: Experience): exp is Experience & { id: string } { return !!(exp && exp.id); }
  private isPartialFormationData(data: any): data is Partial<Omit<Formation, 'userId'>> { return data && data.diplome && data.etablissement; }
  private isEditableFormation(form?: Formation): form is Formation & { id: string } { return !!(form && form.id); }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom', color });
    toast.present();
  }
}