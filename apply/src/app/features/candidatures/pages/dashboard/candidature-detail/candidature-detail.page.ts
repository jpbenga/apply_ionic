import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  IonHeader, IonContent, IonSpinner, IonIcon, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonTextarea, IonInput, IonChip,
  IonList, IonModal, IonButtons, IonTitle, IonToolbar, IonFab, IonFabButton, IonFabList, IonGrid, IonRow, IonCol,
  IonCardSubtitle
  
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/shared/services/header/header.service';
import { CandidatureService } from 'src/app/shared/services/candidature/candidature.service';
import { Candidature, SuiviCandidature, TypeSuivi, StatutCandidature } from '../../../models/candidature.model';
import { UserHeaderComponent } from 'src/app/shared/components/user-header/user-header.component';
import { ToastController, AlertController, LoadingController } from '@ionic/angular/standalone';
import { CvReconstructionService, ReconstructedCv } from 'src/app/services/cv-reconstruction/cv-reconstruction.service';

@Component({
  selector: 'app-candidature-detail',
  templateUrl: './candidature-detail.page.html',
  styleUrls: ['./candidature-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonHeader, IonContent, IonSpinner, IonIcon, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonTextarea, IonInput, IonChip,
    IonList, IonModal, IonButtons, IonTitle, IonToolbar, IonFab, IonFabButton, IonFabList, IonGrid, IonRow, IonCol,
    UserHeaderComponent, IonGrid, IonRow, IonCol, IonChip, IonCardSubtitle
  ]
})
export class CandidatureDetailPage implements OnInit, OnDestroy {
  public candidature$: Observable<Candidature | undefined>;
  public candidature: Candidature | undefined;
  public isLoading: boolean = true;
  public errorLoading: string | null = null;
  
  // États d'édition
  public isEditing: boolean = false;
  public isEditingNotes: boolean = false;
  public editableNotesPersonnelles: string = '';
  
  // Suivi des candidatures
  public isAddingSuivi: boolean = false;
  public nouveauSuiviType: TypeSuivi = 'contact';
  public nouveauSuiviDescription: string = '';
  public nouveauSuiviNotes: string = '';
  public nouveauSuiviCommentaire: string = '';

  // ✅ NOUVELLES PROPRIÉTÉS pour la reconstruction CV
  reconstructedCv: ReconstructedCv | null = null;
  isReconstructingCv: boolean = false;
  showCvPreview: boolean = false;
  cvPreviewText: string = '';

  // Options pour les selects
  public statutsCandidature: { value: StatutCandidature, label: string }[] = [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'envoyee', label: 'Envoyée' },
    { value: 'en_cours_rh', label: 'En cours RH' },
    { value: 'entretien_planifie', label: 'Entretien planifié' },
    { value: 'test_technique', label: 'Test technique' },
    { value: 'entretien_final', label: 'Entretien final' },
    { value: 'offre_recue', label: 'Offre reçue' },
    { value: 'acceptee', label: 'Acceptée' },
    { value: 'refusee_candidat', label: 'Refusée (par moi)' },
    { value: 'refusee_entreprise', label: 'Refusée (par entreprise)' },
    { value: 'archivee', label: 'Archivée' },
    { value: 'standby', label: 'Standby' }
  ];

  public typesDeSuivi: { value: TypeSuivi, label: string }[] = [
    { value: 'contact', label: 'Contact' },
    { value: 'email_envoye', label: 'Email envoyé' },
    { value: 'email_recu', label: 'Email reçu' },
    { value: 'appel_effectue', label: 'Appel effectué' },
    { value: 'appel_recu', label: 'Appel reçu' },
    { value: 'entretien_planifie', label: 'Entretien planifié' },
    { value: 'entretien_effectue', label: 'Entretien effectué' },
    { value: 'entretien', label: 'Entretien' },
    { value: 'test_technique_recu', label: 'Test technique reçu' },
    { value: 'test_technique_complete', label: 'Test technique complété' },
    { value: 'test', label: 'Test' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'relance', label: 'Relance' },
    { value: 'autre', label: 'Autre' }
  ];

  private candidatureId: string = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private headerService: HeaderService,
    private candidatureService: CandidatureService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private cvReconstructionService: CvReconstructionService
  ) {
    this.candidature$ = this.route.paramMap.pipe(
      map(params => params.get('id') || ''),
      switchMap(id => {
        this.candidatureId = id;
        if (!id) {
          this.errorLoading = 'ID de candidature non fourni';
          this.isLoading = false;
          return [];
        }
        return this.candidatureService.getCandidatureById(id);
      })
    );
  }

  ngOnInit() {
    this.subscribeToCandidate();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Détail Candidature');
    this.headerService.setShowBackButton(true);
  }

  /**
   * S'abonner aux changements de candidature
   */
  private subscribeToCandidate(): void {
    const candidatureSub = this.candidature$.subscribe({
      next: (candidature) => {
        this.isLoading = false;
        if (candidature) {
          this.candidature = candidature;
          this.editableNotesPersonnelles = candidature.notesPersonnelles || '';
          this.errorLoading = null;
        } else {
          this.errorLoading = 'Candidature non trouvée';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorLoading = 'Erreur lors du chargement de la candidature';
        console.error('Erreur candidature:', error);
      }
    });

    this.subscriptions.push(candidatureSub);
  }

  /**
   * Obtenir la couleur du statut
   */
  getStatutColor(statut: StatutCandidature): string {
    const colorMap: { [key in StatutCandidature]: string } = {
      'brouillon': 'medium',
      'envoyee': 'primary',
      'en_cours_rh': 'secondary',
      'entretien_planifie': 'tertiary',
      'test_technique': 'warning',
      'entretien_final': 'warning',
      'offre_recue': 'success',
      'acceptee': 'success',
      'refusee_candidat': 'danger',
      'refusee_entreprise': 'danger',
      'archivee': 'dark',
      'standby': 'medium'
    };
    return colorMap[statut] || 'medium';
  }

  /**
   * Obtenir le libellé du statut
   */
  getStatutLabel(statut: StatutCandidature): string {
    const statutObj = this.statutsCandidature.find(s => s.value === statut);
    return statutObj ? statutObj.label : statut;
  }

  /**
   * Obtenir l'icône pour un type de suivi
   */
  getSuiviIcon(type: TypeSuivi): string {
    const iconMap: { [key in TypeSuivi]: string } = {
      'contact': 'person-outline',
      'email_envoye': 'mail-outline',
      'email_recu': 'mail-open-outline',
      'appel_effectue': 'call-outline',
      'appel_recu': 'call-outline',
      'entretien_planifie': 'calendar-outline',
      'entretien_effectue': 'checkmark-circle-outline',
      'entretien': 'people-outline',
      'test_technique_recu': 'document-text-outline',
      'test_technique_complete': 'document-attach-outline',
      'test': 'school-outline',
      'feedback': 'chatbubble-outline',
      'relance': 'refresh-outline',
      'autre': 'ellipsis-horizontal-outline'
    };
    return iconMap[type] || 'information-circle-outline';
  }

  /**
   * Obtenir la couleur pour un type de suivi
   */
  getSuiviColor(type: TypeSuivi): string {
    const colorMap: { [key in TypeSuivi]: string } = {
      'contact': 'primary',
      'email_envoye': 'secondary',
      'email_recu': 'secondary',
      'appel_effectue': 'tertiary',
      'appel_recu': 'tertiary',
      'entretien_planifie': 'warning',
      'entretien_effectue': 'success',
      'entretien': 'warning',
      'test_technique_recu': 'medium',
      'test_technique_complete': 'success',
      'test': 'medium',
      'feedback': 'primary',
      'relance': 'warning',
      'autre': 'dark'
    };
    return colorMap[type] || 'medium';
  }

  /**
   * Basculer le mode édition
   */
  toggleEditing(): void {
    if (this.isEditing) {
      this.saveChanges();
    } else {
      if (this.candidature) {
        this.editableNotesPersonnelles = this.candidature.notesPersonnelles || '';
      }
      this.isEditing = true;
    }
  }

  /**
   * Annuler l'édition
   */
  cancelEditing(): void {
    this.isEditing = false;
    if (this.candidature) {
      this.editableNotesPersonnelles = this.candidature.notesPersonnelles || '';
    }
  }

  /**
   * Sauvegarder les modifications
   */
  async saveChanges(): Promise<void> {
    if (!this.candidature || !this.candidatureId) return;

    const loading = await this.loadingController.create({
      message: 'Sauvegarde en cours...'
    });
    await loading.present();

    try {
      const updateData: Partial<Candidature> = {
        notesPersonnelles: this.editableNotesPersonnelles || ''
      };

      await this.candidatureService.updateCandidature(this.candidatureId, updateData);
      this.isEditing = false;
      this.presentToast('Modifications sauvegardées avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.presentToast('Erreur lors de la sauvegarde', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Mettre à jour le statut de la candidature
   */
  async updateStatut(newStatut: StatutCandidature): Promise<void> {
    if (!this.candidature || !this.candidatureId) return;

    const loading = await this.loadingController.create({
      message: 'Mise à jour du statut...'
    });
    await loading.present();

    try {
      await this.candidatureService.updateCandidature(this.candidatureId, { statut: newStatut });
      this.presentToast('Statut mis à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      this.presentToast('Erreur lors de la mise à jour du statut', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Ouvrir le modal d'ajout de suivi
   */
  openAddSuiviModal(): void {
    this.isAddingSuivi = true;
    this.nouveauSuiviType = 'contact';
    this.nouveauSuiviDescription = '';
    this.nouveauSuiviNotes = '';
    this.nouveauSuiviCommentaire = '';
  }

  /**
   * Fermer le modal d'ajout de suivi
   */
  closeAddSuiviModal(): void {
    this.isAddingSuivi = false;
    this.nouveauSuiviType = 'contact';
    this.nouveauSuiviDescription = '';
    this.nouveauSuiviNotes = '';
    this.nouveauSuiviCommentaire = '';
  }

  /**
   * Ajouter un nouveau suivi
   */
  async addSuivi(): Promise<void> {
    if (!this.candidatureId || !this.nouveauSuiviDescription.trim()) {
      this.presentToast('Veuillez saisir une description pour le suivi', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Ajout du suivi...'
    });
    await loading.present();

    try {
      const suiviData: Omit<SuiviCandidature, 'id' | 'date'> = {
        type: this.nouveauSuiviType,
        description: this.nouveauSuiviDescription.trim(),
        commentaire: this.nouveauSuiviCommentaire.trim() || undefined,
        notes: this.nouveauSuiviNotes.trim() || undefined
      };

      await this.candidatureService.addSuiviToCandidature(this.candidatureId, suiviData);
      this.closeAddSuiviModal();
      this.presentToast('Suivi ajouté avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du suivi:', error);
      this.presentToast('Erreur lors de l\'ajout du suivi', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Envoyer un email de relance
   */
  async sendRelanceEmail(): Promise<void> {
    if (!this.candidature || !this.candidatureId) return;

    const contactEmail = this.getContactEmail();
    if (!contactEmail) {
      this.presentToast('Aucun email de contact disponible', 'warning');
      return;
    }

    try {
      // Ajouter un suivi pour la relance
      const suiviData: Omit<SuiviCandidature, 'id' | 'date'> = {
        type: 'relance',
        description: 'Email de relance envoyé',
        notes: `Email de relance envoyé à ${contactEmail}`,
        commentaire: 'Tentative d\'ouverture du client mail'
      };

      await this.candidatureService.addSuiviToCandidature(this.candidatureId, suiviData);

      // Ouvrir le client mail
      const subject = `Suivi candidature - ${this.candidature.intitulePoste} chez ${this.candidature.entreprise}`;
      const body = `Bonjour,\n\nJe me permets de vous recontacter concernant ma candidature pour le poste de ${this.candidature.intitulePoste}.\n\nCordialement`;
      const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.open(mailtoLink, '_blank');
      this.presentToast('Email de relance préparé', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la relance:', error);
      this.presentToast('Erreur lors de la préparation de la relance', 'danger');
    }
  }

  /**
   * Supprimer la candidature
   */
  async deleteCandidature(): Promise<void> {
    if (!this.candidatureId) return;

    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action est irréversible.',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            await this.confirmDeleteCandidature();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Confirmer la suppression de la candidature
   */
  private async confirmDeleteCandidature(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Suppression en cours...'
    });
    await loading.present();

    try {
      await this.candidatureService.deleteCandidature(this.candidatureId);
      await loading.dismiss();
      this.presentToast('Candidature supprimée avec succès', 'success');
      this.router.navigate(['/tabs/dashboard']);
    } catch (error) {
      await loading.dismiss();
      console.error('Erreur lors de la suppression:', error);
      this.presentToast('Erreur lors de la suppression de la candidature', 'danger');
    }
  }

  /**
   * Générer des documents (CV, lettre de motivation)
   */
  async generateDocuments(): Promise<void> {
    if (!this.candidature || !this.candidatureId) return;

    // Vérifier si les documents sont nécessaires
    if (!this.candidature.cvTexteExtrait && !this.candidature.cvOriginalUrl && !this.candidature.lettreMotivationGeneree) {
      this.presentToast('Aucune donnée de CV disponible pour la génération', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Génération des documents...'
    });
    await loading.present();

    try {
      // Simuler la génération de documents (à adapter selon votre logique)
      const updateData: Partial<Candidature> = {
        cvTexteExtrait: this.candidature.cvTexteExtrait,
        lettreMotivationGeneree: this.candidature.lettreMotivationGeneree,
        analyseATS: 'Analyse ATS générée automatiquement'
      };

      await this.candidatureService.updateCandidature(this.candidatureId, updateData);
      this.presentToast('Documents générés avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la génération des documents:', error);
      this.presentToast('Erreur lors de la génération des documents', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Obtenir l'email de contact
   */
  private getContactEmail(): string {
    if (!this.candidature) return '';
    
    // Essayer d'abord contactRecruteur.email
    if (this.candidature.contactRecruteur?.email) {
      return this.candidature.contactRecruteur.email;
    }
    
    // Puis essayer contacts[0].email (compatibilité)
    if (this.candidature.contacts && this.candidature.contacts.length > 0 && this.candidature.contacts[0].email) {
      return this.candidature.contacts[0].email;
    }
    
    return '';
  }

  /**
   * Formatter la date
   */
  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    
    try {
      // Gérer les timestamps Firestore
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return '';
    }
  }

  /**
   * Afficher un toast
   */
  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' | 'light'): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [{ text: 'OK', role: 'cancel'}]
    });
    toast.present();
  }

  /**
   * Retour au dashboard
   */
  goBack(): void {
    this.router.navigate(['/tabs/dashboard']);
  }

  /**
   * Aller à l'édition de la candidature
   */
  editCandidature(): void {
    this.router.navigate(['/tabs/postuler'], { 
      queryParams: { candidatureId: this.candidatureId } 
    });
  }
   /**
   * Reconstruire le CV de la candidature
   */
   async reconstructCandidatureCv() {
    if (!this.candidature) return;

    this.isReconstructingCv = true;
    
    try {
      console.log('🔧 Reconstruction du CV pour candidature:', this.candidature.id);
      
      // Utiliser le service de reconstruction
      this.reconstructedCv = this.cvReconstructionService.reconstructCvFromCandidature(this.candidature);
      
      if (this.reconstructedCv.hasValidData) {
        // Générer le texte de prévisualisation
        this.cvPreviewText = this.cvReconstructionService.generateCvPreviewText(this.reconstructedCv);
        this.showCvPreview = true;
        
        console.log('✅ CV reconstruit avec succès');
        // Réutiliser votre méthode toast existante si elle existe
        // this.presentToast('CV reconstruit avec succès !', 'success');
      } else {
        console.warn('❌ Impossible de reconstruire le CV:', this.reconstructedCv.missingFields);
        // this.presentToast('Impossible de reconstruire le CV de cette candidature', 'warning');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la reconstruction:', error);
      // this.presentToast('Erreur lors de la reconstruction du CV', 'danger');
    } finally {
      this.isReconstructingCv = false;
    }
  }

  /**
   * Vérifier si la reconstruction est possible
   */
  canReconstructCv(): boolean {
    return this.candidature ? this.cvReconstructionService.canReconstructCv(this.candidature) : false;
  }

  /**
   * Obtenir les stats du CV
   */
  getCvStats(): { experiences: number; formations: number; competences: number; total: number } {
    return this.candidature ? this.cvReconstructionService.getCvDataStats(this.candidature) : 
           { experiences: 0, formations: 0, competences: 0, total: 0 };
  }

  /**
   * Obtenir les infos template
   */
  getTemplateInfo(): { templateName: string; themeName: string } {
    return this.candidature ? this.cvReconstructionService.getCandidatureTemplateInfo(this.candidature) :
           { templateName: 'Inconnu', themeName: '#007bff' };
  }

  /**
   * Fermer la prévisualisation
   */
  closeCvPreview() {
    this.showCvPreview = false;
    this.reconstructedCv = null;
    this.cvPreviewText = '';
  }

  /**
   * Télécharger le CV reconstruit (placeholder pour l'instant)
   */
  async downloadReconstructedCv() {
    if (!this.reconstructedCv || !this.reconstructedCv.hasValidData) {
      // this.presentToast('Aucun CV à télécharger', 'warning');
      return;
    }

    // TODO: Implémenter la génération PDF avec le CV reconstruit
    // Utiliser votre logique de génération PDF existante avec :
    // - this.reconstructedCv.cvData
    // - this.reconstructedCv.template  
    // - this.reconstructedCv.theme
    console.log('📄 CV à télécharger:', this.reconstructedCv);
    // this.presentToast('Fonctionnalité de téléchargement à implémenter', 'primary');
  }
}