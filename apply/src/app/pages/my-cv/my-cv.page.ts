import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonFab, IonFabButton, IonFabList, IonIcon,
  IonList, IonItem, IonLabel, IonSpinner, IonListHeader, IonItemSliding,
  IonItemOptions, IonItemOption, IonButton, IonCard, IonCardHeader,
  IonCardTitle, IonCardSubtitle, IonCardContent
} from '@ionic/angular/standalone';
import { UserHeaderComponent } from 'src/app/components/user-header/user-header.component';
import { HeaderService } from 'src/app/services/header/header.service';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ExperienceModalComponent } from 'src/app/components/experience-modal/experience-modal.component';
import { FormationModalComponent } from 'src/app/components/formation-modal/formation-modal.component';
import { CompetenceModalComponent } from 'src/app/components/competence-modal/competence-modal.component';
import { Experience } from 'src/app/models/experience.model';
import { Formation } from 'src/app/models/formation.model';
import { Competence } from 'src/app/models/competence.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CvDataService } from 'src/app/services/cv-data/cv-data.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, first, timeout } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import {
  addOutline, listOutline, businessOutline, createOutline, trashOutline,
  schoolOutline, starOutline, cloudOfflineOutline, documentTextOutline,
  copyOutline
} from 'ionicons/icons';
import { GenerateCvModalComponent } from 'src/app/components/generate-cv-modal/generate-cv-modal.component';
import { CvSelectorComponent } from 'src/app/components/cv-selector/cv-selector.component';
import { CvPreviewComponent } from 'src/app/components/cv-preview/cv-preview.component';
import { GeneratedCv, CvTemplate } from 'src/app/models/cv-template.model';
import { CvTemplateService } from 'src/app/services/cv-template/cv-template.service';
import { CvGenerationService } from 'src/app/services/cv-generation/cv-generation.service';

@Component({
  selector: 'app-my-cv',
  templateUrl: './my-cv.page.html',
  styleUrls: ['./my-cv.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe,
    IonContent, IonHeader, IonFab, IonFabButton, IonFabList, IonIcon,
    IonList, IonItem, IonLabel, IonSpinner, IonListHeader, IonItemSliding,
    IonItemOptions, IonItemOption, IonButton, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent,
    UserHeaderComponent, CvSelectorComponent, CvPreviewComponent
  ]
})
export class MyCvPage implements OnInit, OnDestroy {
  @ViewChild('cvPreview') cvPreview!: CvPreviewComponent;

  public experiences$: Observable<Experience[]> = of([]);
  public formations$: Observable<Formation[]> = of([]);
  public competences$: Observable<Competence[]> = of([]);
  private destroy$ = new Subject<void>();

  public isLoadingExperiences: boolean = false;
  public isLoadingFormations: boolean = false;
  public isLoadingCompetences: boolean = false;
  public errorLoadingExperiences: string | null = null;
  public errorLoadingFormations: string | null = null;
  public errorLoadingCompetences: string | null = null;

  // Nouveau : gestion des CV générés
  public selectedGeneratedCv: GeneratedCv | null = null;

  private isModalOpening: boolean = false;

  constructor(
    private headerService: HeaderService,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private cvDataService: CvDataService,
    private toastCtrl: ToastController,
    private cvTemplateService: CvTemplateService,
    private cvGenerationService: CvGenerationService
  ) {
    addIcons({
      addOutline, listOutline, businessOutline, createOutline, trashOutline,
      schoolOutline, starOutline, cloudOfflineOutline, documentTextOutline,
      copyOutline
    });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Mon CV Structuré');
    this.headerService.setShowBackButton(true);
    this.loadAllCvData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Nouvelles méthodes pour la gestion des CV générés
  onCvSelected(generatedCv: GeneratedCv) {
    this.selectedGeneratedCv = generatedCv;
    console.log('CV sélectionné:', generatedCv);
    
    // Affiche le CV dans le preview
    if (this.cvPreview) {
      this.cvPreview.displayGeneratedCv(generatedCv);
    }
  }

  getSelectedCvInfo(): string {
    if (!this.selectedGeneratedCv) return '';
    
    const templateName = this.cvTemplateService.getTemplateById(this.selectedGeneratedCv.templateId)?.name || 'Template inconnu';
    const date = new Date(this.selectedGeneratedCv.createdAt).toLocaleDateString('fr-FR');
    
    return `${templateName} - Créé le ${date}`;
  }

  getSelectedTemplate(): CvTemplate | null {
    if (!this.selectedGeneratedCv) return null;
    
    return this.cvTemplateService.getTemplateById(this.selectedGeneratedCv.templateId) || null;
  }

  getSelectedTheme(): string | null {
    return this.selectedGeneratedCv?.theme.primaryColor || null;
  }

  async editSelectedCv() {
    if (!this.selectedGeneratedCv) return;
    
    // Ouvre la modal de génération avec les données du CV sélectionné
    const modal = await this.modalCtrl.create({
      component: GenerateCvModalComponent,
      componentProps: {
        existingCv: this.selectedGeneratedCv
      },
      breakpoints: [0, 0.5, 0.8, 1],
      initialBreakpoint: 0.8,
      handle: true,
      backdropDismiss: true,
    });
    
    await modal.present();
    
    const { data, role } = await modal.onWillDismiss();
    if (role === 'generate') {
      this.presentToast('CV mis à jour avec succès !', 'success');
    }
  }

  async generateNewCvFromSelected() {
    if (!this.selectedGeneratedCv) return;
    
    try {
      // Duplique le CV avec un nouveau template/thème
      const newCvId = await this.cvGenerationService.saveGeneratedCv(
        this.selectedGeneratedCv.templateId,
        this.selectedGeneratedCv.theme
      );
      
      this.presentToast('CV dupliqué avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      this.presentToast('Erreur lors de la duplication du CV', 'danger');
    }
  }

  // Méthodes existantes...
  loadAllCvData(event?: any) {
    this.loadExperiences(event && event.target && event.target.id === 'experiencesRefresher' ? event : undefined);
    this.loadFormations(event && event.target && event.target.id === 'formationsRefresher' ? event : undefined);
    this.loadCompetences(event && event.target && event.target.id === 'competencesRefresher' ? event : undefined);
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
        if (event?.target?.complete) event.target.complete();
        return of([]);
      }),
      finalize(() => {
        this.isLoadingExperiences = false;
        if (event?.target?.complete) event.target.complete();
      }),
      takeUntil(this.destroy$)
    ).subscribe(data => this.experiences$ = of(data));
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
        if (event?.target?.complete) event.target.complete();
        return of([]);
      }),
      finalize(() => {
        this.isLoadingFormations = false;
        if (event?.target?.complete) event.target.complete();
      }),
      takeUntil(this.destroy$)
    ).subscribe(data => this.formations$ = of(data));
  }

  loadCompetences(event?: any) {
    this.isLoadingCompetences = true;
    this.errorLoadingCompetences = null;
    this.competences$ = of([]);
    const TIMEOUT_DURATION = 15000;
    this.cvDataService.getCompetences().pipe(
      first(),
      timeout(TIMEOUT_DURATION),
      catchError(error => {
        this.isLoadingCompetences = false;
        if (error.name === 'TimeoutError') {
          this.errorLoadingCompetences = 'Le chargement a pris trop de temps.';
        } else {
          this.errorLoadingCompetences = 'Impossible de charger les compétences.';
        }
        console.error('Erreur chargement compétences:', error);
        if (event?.target?.complete) event.target.complete();
        return of([]);
      }),
      finalize(() => {
        this.isLoadingCompetences = false;
        if (event?.target?.complete) event.target.complete();
      }),
      takeUntil(this.destroy$)
    ).subscribe(data => this.competences$ = of(data));
  }

  getDisplayDate(dateValue: Timestamp | Date | string | null | undefined): Date | null {
    if (!dateValue) return null;
    if (dateValue instanceof Timestamp) return dateValue.toDate();
    if (dateValue instanceof Date) return dateValue;
    const parsedDate = new Date(dateValue);
    return !isNaN(parsedDate.getTime()) ? parsedDate : null;
  }

  async addExperience() { await this.openExperienceModal(); }
  async editExperience(exp: Experience, item?: IonItemSliding) { if (item) await item.close(); await this.openExperienceModal(exp); }
  async deleteExperience(id?: string, item?: IonItemSliding) {
    if (item) await item.close();
    if (!id) return;
    try {
      await this.cvDataService.deleteExperience(id);
      this.presentToast('Expérience supprimée.', 'success');
      this.loadExperiences();
    }
    catch (e) { this.presentToast("Erreur suppression expérience.", "danger"); }
  }

  async addFormation() { await this.openFormationModal(); }
  async editFormation(form: Formation, item?: IonItemSliding) { if (item) await item.close(); await this.openFormationModal(form); }
  async deleteFormation(id?: string, item?: IonItemSliding) {
    if (item) await item.close();
    if (!id) return;
    try {
      await this.cvDataService.deleteFormation(id);
      this.presentToast('Formation supprimée.', 'success');
      this.loadFormations();
    }
    catch (e) { this.presentToast("Erreur suppression formation.", "danger"); }
  }

  async addCompetence() { await this.openCompetenceModal(); }
  async editCompetence(comp: Competence, item?: IonItemSliding) { if (item) await item.close(); await this.openCompetenceModal(comp); }
  async deleteCompetence(id?: string, item?: IonItemSliding) {
    if (item) await item.close();
    if (!id) return;
    try { await this.cvDataService.deleteCompetence(id); this.presentToast('Compétence supprimée.', 'success'); this.loadCompetences(); }
    catch (e) { this.presentToast("Erreur suppression compétence.", "danger"); }
  }

  async openExperienceModal(experience?: Experience) {
    if (this.isModalOpening) return; this.isModalOpening = true;
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
          await this.cvDataService.updateExperience(experience.id, dataToSave); this.presentToast('Expérience mise à jour.', 'success');
        } else {
          await this.cvDataService.addExperience(dataToSave); this.presentToast('Expérience ajoutée.', 'success');
        }
        this.loadExperiences();
      }
    } catch (e) { console.error(e); } finally { this.isModalOpening = false; }
  }

  async openFormationModal(formation?: Formation) {
    if (this.isModalOpening) return; this.isModalOpening = true;
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
          await this.cvDataService.updateFormation(formation.id, dataToSave); this.presentToast('Formation mise à jour.', 'success');
        } else {
          await this.cvDataService.addFormation(dataToSave); this.presentToast('Formation ajoutée.', 'success');
        }
        this.loadFormations();
      }
    } catch (e) { console.error(e); } finally { this.isModalOpening = false; }
  }

  async openCompetenceModal(competence?: Competence) {
    if (this.isModalOpening) return; this.isModalOpening = true;
    try {
      const modal = await this.modalCtrl.create({ component: CompetenceModalComponent, componentProps: { competence, isEditMode: !!competence } });
      await modal.present();
      const { data, role } = await modal.onWillDismiss();
      if (role === 'save' && data && this.isPartialCompetenceData(data)) {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) { this.presentToast("Utilisateur non authentifié.", "danger"); this.isModalOpening = false; return; }
        const dataToSave: Omit<Competence, 'id' | 'userId'> = {
          nom: data.nom || '', categorie: data.categorie
        };
        if (this.isEditableCompetence(competence) && competence.id) {
          await this.cvDataService.updateCompetence(competence.id, dataToSave); this.presentToast('Compétence mise à jour.', 'success');
        } else {
          await this.cvDataService.addCompetence(dataToSave); this.presentToast('Compétence ajoutée.', 'success');
        }
        this.loadCompetences();
      }
    } catch (e) { console.error(e); } finally { this.isModalOpening = false; }
  }

  private isPartialExperienceData(data: any): data is Partial<Omit<Experience, 'userId'>> { return data && data.poste && data.entreprise; }
  private isEditableExperience(exp?: Experience): exp is Experience & { id: string } { return !!(exp && exp.id); }
  private isPartialFormationData(data: any): data is Partial<Omit<Formation, 'userId'>> { return data && data.diplome && data.etablissement; }
  private isEditableFormation(form?: Formation): form is Formation & { id: string } { return !!(form && form.id); }
  private isPartialCompetenceData(data: any): data is Partial<Omit<Competence, 'userId'>> { return data && data.nom; }
  private isEditableCompetence(comp?: Competence): comp is Competence & { id: string } { return !!(comp && comp.id); }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom', color });
    toast.present();
  }

  async generateCv() {
    const modal = await this.modalCtrl.create({
      component: GenerateCvModalComponent,
      breakpoints: [0, 0.5, 0.8, 1],
      initialBreakpoint: 0.8,
      handle: true,
      backdropDismiss: true,
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'generate' && data) {
      console.log('CV généré avec succès:', data);
      this.presentToast(`CV généré avec le template: ${data.template?.name}`, 'success');
      
      // Recharge la liste des CV générés
      // Le cv-selector se mettra à jour automatiquement
    } else {
      console.log('Modal fermée avec le rôle:', role);
    }
  }
}