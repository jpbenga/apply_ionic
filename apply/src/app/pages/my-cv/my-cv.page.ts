import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonFab, IonFabButton, IonFabList, IonIcon,
  IonList, IonItem, IonLabel, IonSpinner, IonListHeader, IonItemSliding,
  IonItemOptions, IonItemOption, IonButton, IonCard, IonCardHeader,
  IonCardTitle, IonCardSubtitle, IonCardContent
} from '@ionic/angular/standalone';
import { UserHeaderComponent } from '../../shared/components/user-header/user-header.component';
import { HeaderService } from '../../shared/services/header/header.service';
import { ModalController, ToastController, AlertController, LoadingController } from '@ionic/angular/standalone';
import { ExperienceModalComponent } from 'src/app/components/experience-modal/experience-modal.component';
import { FormationModalComponent } from 'src/app/components/formation-modal/formation-modal.component';
import { CompetenceModalComponent } from 'src/app/components/competence-modal/competence-modal.component';
import { Experience } from 'src/app/models/experience.model';
import { Formation } from 'src/app/models/formation.model';
import { Competence } from 'src/app/models/competence.model';
import { AuthService } from '../../features/auth/services/auth/auth.service';
import { CvDataService } from 'src/app/services/cv-data/cv-data.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, first, timeout } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';
import { GenerateCvModalComponent } from 'src/app/components/generate-cv-modal/generate-cv-modal.component';
import { CvSelectorComponent } from 'src/app/components/cv-selector/cv-selector.component';
import { CvPreviewComponent } from 'src/app/components/cv-preview/cv-preview.component';
import { GeneratedCv, CvTemplate } from 'src/app/models/cv-template.model';
import { CvTemplateService } from 'src/app/services/cv-template/cv-template.service';
import { CvGenerationService } from 'src/app/services/cv-generation/cv-generation.service';
import { CvUploadComponent, CvUploadResult } from 'src/app/components/cv-upload/cv-upload.component';
import { CvParsingService } from 'src/app/services/cv-parsing/cv-parsing.service';
import { CvDataValidationModalComponent } from 'src/app/components/cv-data-validation-modal/cv-data-validation-modal.component';

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
  UserHeaderComponent, CvSelectorComponent, CvPreviewComponent, 
  CvUploadComponent
  ],
})
export class MyCvPage implements OnInit, OnDestroy {
  @ViewChild('cvPreview') cvPreview!: CvPreviewComponent;
  @ViewChild(CvUploadComponent) cvUploadComponent!: CvUploadComponent;

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

  public selectedGeneratedCv: GeneratedCv | null = null;

  // ✅ NOUVELLES PROPRIÉTÉS pour gestion contrôlée du CvGenerationService
  public isGeneratingCv: boolean = false;
  public hasGeneratedCvs: boolean = false;
  public generatedCvsCount: number = 0;

  private isModalOpening: boolean = false;
  private loadingElement: HTMLIonLoadingElement | null = null;

  constructor(
    private headerService: HeaderService,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private cvDataService: CvDataService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private cvTemplateService: CvTemplateService,
    private cvGenerationService: CvGenerationService, // ✅ GARDÉ pour usage contrôlé
    private cvParsingService: CvParsingService
  ) {}

  ngOnInit() {
    this.checkExistingGeneratedCvs();
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Mon CV Structuré');
    this.headerService.setShowBackButton(true);
    this.loadAllCvData();
    this.checkExistingGeneratedCvs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.loadingElement) {
      this.loadingElement.dismiss();
    }
  }

  // ✅ NOUVELLE MÉTHODE - Vérifier les CV générés existants
  private checkExistingGeneratedCvs() {
    this.cvGenerationService.getGeneratedCvs().pipe(
      first(),
      catchError(error => {
        console.error('Erreur chargement CV générés:', error);
        return of([]);
      })
    ).subscribe(cvs => {
      this.hasGeneratedCvs = cvs.length > 0;
      this.generatedCvsCount = cvs.length;
      
      if (cvs.length > 1) {
        console.warn(`⚠️ ${cvs.length} CV générés trouvés - nettoyage recommandé`);
      }
    });
  }

  // ✅ NOUVELLE MÉTHODE - Nettoyage des doublons (à exécuter manuellement)
  async cleanupDuplicateCvs() {
    const alert = await this.alertCtrl.create({
      header: 'Nettoyer les CV en double',
      message: `Vous avez ${this.generatedCvsCount} CV générés. Voulez-vous supprimer les doublons et ne garder que le plus récent ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Nettoyer',
          role: 'confirm',
          handler: async () => {
            await this.performCleanup();
          }
        }
      ]
    });

    await alert.present();
  }

  private async performCleanup() {
    try {
      this.presentToast('Nettoyage en cours...', 'primary');
      
      const result = await this.cvGenerationService.cleanupDuplicateCvs();
      
      this.presentToast(
        `✅ Nettoyage terminé: ${result.deleted} supprimés, ${result.kept} conservés`, 
        'success'
      );
      
      // Recharger l'état
      this.checkExistingGeneratedCvs();
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      this.presentToast('Erreur lors du nettoyage des CV', 'danger');
    }
  }

  // ✅ NOUVELLE MÉTHODE - Génération contrôlée de CV
  async generateControlledCv() {
    // Vérifier qu'il n'y a pas déjà une génération en cours
    if (this.cvGenerationService.isSavingCv() || this.isGeneratingCv) {
      this.presentToast('Génération déjà en cours...', 'warning');
      return;
    }

    // Vérifier qu'il y a des données
    const [experiences, formations, competences] = await Promise.all([
      this.cvDataService.getExperiences().pipe(first()).toPromise(),
      this.cvDataService.getFormations().pipe(first()).toPromise(),
      this.cvDataService.getCompetences().pipe(first()).toPromise()
    ]);

    const hasData = (experiences?.length || 0) + (formations?.length || 0) + (competences?.length || 0) > 0;
    
    if (!hasData) {
      this.presentToast('Ajoutez au moins une expérience, formation ou compétence avant de générer un CV', 'warning');
      return;
    }

    this.isGeneratingCv = true;

    try {
      // Générer UN seul CV avec template par défaut
      const cvId = await this.cvGenerationService.saveGeneratedCv('modern', { primaryColor: '#007bff' });
      
      this.presentToast('CV de prévisualisation généré avec succès !', 'success');
      this.checkExistingGeneratedCvs();
      
    } catch (error) {
      console.error('Erreur génération CV:', error);
      this.presentToast('Erreur lors de la génération du CV', 'danger');
    } finally {
      this.isGeneratingCv = false;
    }
  }

  private async showAiProcessingLoading(): Promise<void> {
    this.loadingElement = await this.loadingCtrl.create({
      message: '🤖 Intelligence Artificielle au travail...',
      spinner: 'crescent',
      duration: 0,
      backdropDismiss: false,
      keyboardClose: false
    });

    await this.loadingElement.present();
  }

  private async hideAiProcessingLoading(): Promise<void> {
    if (this.loadingElement) {
      await this.loadingElement.dismiss();
      this.loadingElement = null;
    }
  }

  async onCvProcessingStarted() {
    await this.showAiProcessingLoading();
  }

  async onCvUploadComplete(result: CvUploadResult) {
    if (result.success && result.extractedText) {
      console.log('Texte extrait du CV:', result.extractedText);
      
      if (!this.loadingElement) {
        await this.showAiProcessingLoading();
      }
      
      await this.structureCvData(result.extractedText, result.fileName || 'CV importé');
      
    } else if (result.error) {
      await this.hideAiProcessingLoading();
      this.presentToast(`Erreur lors de l'import : ${result.error}`, 'danger');
    }
  }

  private async structureCvData(extractedText: string, fileName: string) {
    try {
      console.log('Début de l\'analyse du CV:', fileName);
      
      const parsedData = await this.cvParsingService.parseCvText(extractedText);
      
      console.log('Données structurées:', parsedData);
      
      await this.hideAiProcessingLoading();
      
      await this.showDataValidationModal(parsedData, fileName);
      
    } catch (error: any) {
      console.error('Erreur lors de la structuration:', error);
      
      await this.hideAiProcessingLoading();
      
      this.presentToast(`Erreur lors de l'analyse : ${error.message}`, 'danger');
    }
  }

  private async showDataValidationModal(parsedData: any, fileName: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: CvDataValidationModalComponent,
        componentProps: {
          parsedData: parsedData,
          fileName: fileName
        },
        breakpoints: [0, 0.25, 0.5, 0.75, 0.95],
        initialBreakpoint: 0.95,
        handle: true,
        backdropDismiss: false
      });

      await modal.present();

      const { data, role } = await modal.onWillDismiss();
      
      if (role === 'confirm' && data) {
        console.log('Données validées par l\'utilisateur:', data);
        await this.addParsedDataToCv(data);
      } else {
        console.log('Import annulé par l\'utilisateur');
        this.presentToast('Import des données annulé', 'warning');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la modal:', error);
      this.presentToast('Erreur lors de l\'affichage des données', 'danger');
    }
  }

  private async addParsedDataToCv(parsedData: any) {
    console.log('🚀 addParsedDataToCv() appelé');
    try {
      let addedCount = 0;
      let totalAttempts = 0;
      const errors: string[] = [];
      
      if (parsedData.experiences && Array.isArray(parsedData.experiences)) {
        for (const exp of parsedData.experiences) {
          totalAttempts++;
          try {
            await this.cvDataService.addExperience(exp);
            addedCount++;
          } catch (error: any) {
            console.error('Erreur ajout expérience:', error);
            errors.push(`Expérience "${exp.poste}": ${error.message || 'Erreur inconnue'}`);
          }
        }
      }
      
      if (parsedData.formations && Array.isArray(parsedData.formations)) {
        for (const form of parsedData.formations) {
          totalAttempts++;
          try {
            await this.cvDataService.addFormation(form);
            addedCount++;
          } catch (error: any) {
            console.error('Erreur ajout formation:', error);
            errors.push(`Formation "${form.diplome}": ${error.message || 'Erreur inconnue'}`);
          }
        }
      }
      
      if (parsedData.competences && Array.isArray(parsedData.competences)) {
        for (const comp of parsedData.competences) {
          totalAttempts++;
          try {
            await this.cvDataService.addCompetence(comp);
            addedCount++;
          } catch (error: any) {
            console.error('Erreur ajout compétence:', error);
            errors.push(`Compétence "${comp.nom}": ${error.message || 'Erreur inconnue'}`);
          }
        }
      }
      
      this.loadAllCvData();
      
      if (addedCount === totalAttempts) {
        this.presentToast(
          `✅ ${addedCount} élément(s) ajouté(s) avec succès !`, 
          'success'
        );
      } else if (addedCount > 0) {
        this.presentToast(
          `⚠️ ${addedCount}/${totalAttempts} élément(s) ajouté(s). Certains ont échoué.`, 
          'warning'
        );
        console.warn('Erreurs lors de l\'ajout:', errors);
      } else {
        this.presentToast(
          `❌ Aucun élément n'a pu être ajouté.`, 
          'danger'
        );
        console.error('Toutes les tentatives ont échoué:', errors);
      }
      
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout des données:', error);
      this.presentToast('Erreur lors de l\'ajout des données', 'danger');
    }
  }

  onCvSelected(generatedCv: GeneratedCv) {
    this.selectedGeneratedCv = generatedCv;
    console.log('CV sélectionné:', generatedCv);
    
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
      this.checkExistingGeneratedCvs();
    }
  }

  // ✅ MÉTHODE MODIFIÉE - Plus de duplication automatique
  async generateNewCvFromSelected() {
    if (!this.selectedGeneratedCv) return;
    
    // Avertir l'utilisateur avant de créer un nouveau CV
    const alert = await this.alertCtrl.create({
      header: 'Générer un nouveau CV',
      message: 'Voulez-vous vraiment générer un nouveau CV ? Cela créera une copie du CV sélectionné.',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Générer',
          role: 'confirm',
          handler: async () => {
            await this.performCvDuplication();
          }
        }
      ]
    });

    await alert.present();
  }

  private async performCvDuplication() {
    if (!this.selectedGeneratedCv) return;

    try {
      const newCvId = await this.cvGenerationService.saveGeneratedCv(
        this.selectedGeneratedCv.templateId,
        this.selectedGeneratedCv.theme
      );
      
      this.presentToast('CV dupliqué avec succès !', 'success');
      this.checkExistingGeneratedCvs();
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      this.presentToast('Erreur lors de la duplication du CV', 'danger');
    }
  }

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

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom', color });
    toast.present();
  }

  // ✅ MÉTHODE MODIFIÉE - Génération contrôlée via modal
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
      this.checkExistingGeneratedCvs();
    } else {
      console.log('Modal fermée avec le rôle:', role);
    }
  }

  async deleteAllExperiences() {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer toutes les expériences',
      message: 'Êtes-vous sûr de vouloir supprimer toutes vos expériences professionnelles ? Cette action est irréversible.',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer tout',
          role: 'destructive',
          handler: async () => {
            try {
              const currentUser = this.authService.getCurrentUser();
              if (!currentUser) {
                this.presentToast('Utilisateur non authentifié.', 'danger');
                return;
              }

              const experiences = await this.cvDataService.getExperiences().pipe(first()).toPromise();
              
              for (const exp of experiences || []) {
                if (exp.id) {
                  await this.cvDataService.deleteExperience(exp.id);
                }
              }
              
              this.presentToast(`${experiences?.length || 0} expérience(s) supprimée(s).`, 'success');
              this.loadExperiences();
              
            } catch (error) {
              console.error('Erreur lors de la suppression des expériences:', error);
              this.presentToast('Erreur lors de la suppression des expériences.', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteAllFormations() {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer toutes les formations',
      message: 'Êtes-vous sûr de vouloir supprimer toutes vos formations ? Cette action est irréversible.',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer tout',
          role: 'destructive',
          handler: async () => {
            try {
              const currentUser = this.authService.getCurrentUser();
              if (!currentUser) {
                this.presentToast('Utilisateur non authentifié.', 'danger');
                return;
              }

              const formations = await this.cvDataService.getFormations().pipe(first()).toPromise();
              
              for (const form of formations || []) {
                if (form.id) {
                  await this.cvDataService.deleteFormation(form.id);
                }
              }
              
              this.presentToast(`${formations?.length || 0} formation(s) supprimée(s).`, 'success');
              this.loadFormations();
              
            } catch (error) {
              console.error('Erreur lors de la suppression des formations:', error);
              this.presentToast('Erreur lors de la suppression des formations.', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteAllCompetences() {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer toutes les compétences',
      message: 'Êtes-vous sûr de vouloir supprimer toutes vos compétences ? Cette action est irréversible.',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer tout',
          role: 'destructive',
          handler: async () => {
            try {
              const currentUser = this.authService.getCurrentUser();
              if (!currentUser) {
                this.presentToast('Utilisateur non authentifié.', 'danger');
                return;
              }

              const competences = await this.cvDataService.getCompetences().pipe(first()).toPromise();
              
              for (const comp of competences || []) {
                if (comp.id) {
                  await this.cvDataService.deleteCompetence(comp.id);
                }
              }
              
              this.presentToast(`${competences?.length || 0} compétence(s) supprimée(s).`, 'success');
              this.loadCompetences();
              
            } catch (error) {
              console.error('Erreur lors de la suppression des compétences:', error);
              this.presentToast('Erreur lors de la suppression des compétences.', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }
}