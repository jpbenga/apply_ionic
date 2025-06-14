import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  IonHeader, IonContent, IonSpinner, IonIcon, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonTextarea, IonInput, IonChip,
  IonList, IonModal, IonButtons, IonTitle, IonToolbar, IonFab, IonFabButton, IonFabList, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { HeaderService } from '../../../../../shared/services/header/header.service';
import { CandidatureService } from '../../../../../shared/services/candidature/candidature.service';
import { Candidature, SuiviCandidature, TypeSuivi, StatutCandidature } from 'src/app/features/candidatures/models/candidature.model';
import { UserHeaderComponent } from '../../../../../shared/components/user-header/user-header.component';
import { ToastController, AlertController, LoadingController } from '@ionic/angular/standalone';
import { PdfGeneratorService } from 'src/app/services/pdf-generator/pdf-generator.service';
import { ProfileService } from '../../../../profile/services/profile.service';
import { UserProfile } from '../../../../profile/models/user-profile.model';

@Component({
  selector: 'app-candidature-detail',
  templateUrl: './candidature-detail.page.html',
  styleUrls: ['./candidature-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, IonHeader, IonContent, IonSpinner, IonIcon, IonButton, IonCard, 
    IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonSelect, IonSelectOption, IonTextarea, 
    IonInput, IonChip, IonList, IonModal, IonButtons, IonTitle, IonToolbar, IonFab, IonFabButton, IonFabList, 
    IonGrid, IonRow, IonCol, UserHeaderComponent
  ]
})
export class CandidatureDetailPage implements OnInit, OnDestroy {
  public candidature: Candidature | undefined;
  public isLoading: boolean = true;
  public errorLoading: string | null = null;
  public isEditing: boolean = false;
  public editableNotesPersonnelles: string = '';
  public isAddingSuivi: boolean = false;
  public nouveauSuiviType: TypeSuivi = 'contact';
  public nouveauSuiviDescription: string = '';
  public nouveauSuiviNotes: string = '';
  public nouveauSuiviCommentaire: string = '';
  private candidatureId: string = '';
  private subscriptions = new Subscription();

  public statutsCandidature: { value: StatutCandidature, label: string }[] = [
    { value: 'brouillon', label: 'Brouillon' }, { value: 'envoyee', label: 'Envoyée' },
    { value: 'en_cours_rh', label: 'En cours RH' }, { value: 'entretien_planifie', label: 'Entretien planifié' },
    { value: 'test_technique', label: 'Test technique' }, { value: 'entretien_final', label: 'Entretien final' },
    { value: 'offre_recue', label: 'Offre reçue' }, { value: 'acceptee', label: 'Acceptée' },
    { value: 'refusee_candidat', label: 'Refusée (par moi)' }, { value: 'refusee_entreprise', label: 'Refusée (par entreprise)' },
    { value: 'archivee', label: 'Archivée' }, { value: 'standby', label: 'Standby' }
  ];

  public typesDeSuivi: { value: TypeSuivi, label: string }[] = [
    { value: 'contact', label: 'Contact' }, { value: 'email_envoye', label: 'Email envoyé' },
    { value: 'email_recu', label: 'Email reçu' }, { value: 'appel_effectue', label: 'Appel effectué' },
    { value: 'appel_recu', label: 'Appel reçu' }, { value: 'entretien_planifie', label: 'Entretien planifié' },
    { value: 'entretien_effectue', label: 'Entretien effectué' }, { value: 'entretien', label: 'Entretien' },
    { value: 'test_technique_recu', label: 'Test technique reçu' }, { value: 'test_technique_complete', label: 'Test technique complété' },
    { value: 'test', label: 'Test' }, { value: 'feedback', label: 'Feedback' },
    { value: 'relance', label: 'Relance' }, { value: 'autre', label: 'Autre' }
  ];

  constructor(
    private headerService: HeaderService,
    private candidatureService: CandidatureService,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private pdfGeneratorService: PdfGeneratorService
  ) {}

  ngOnInit() {
    const candidature$ = this.route.paramMap.pipe(
      map(params => {
        const id = params.get('id');
        if (!id) {
          throw new Error('ID de candidature non fourni');
        }
        this.candidatureId = id;
        return id;
      }),
      switchMap(id => this.candidatureService.getCandidatureById(id))
    );

    this.subscriptions.add(
      candidature$.subscribe({
        next: (candidature) => {
          if (candidature) {
            this.candidature = candidature;
            this.editableNotesPersonnelles = candidature.notesPersonnelles || '';
          } else {
            this.errorLoading = 'Candidature non trouvée';
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.errorLoading = 'Erreur lors du chargement de la candidature.';
          this.isLoading = false;
          console.error(err);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Détail Candidature');
    this.headerService.setShowBackButton(true);
  }

  async downloadCv() {
    if (!this.candidature?.cvDataSnapshot) {
      this.presentToast('Les données du CV sont introuvables.', 'warning');
      return;
    }
    
    // DEBUG: Afficher le snapshot des données CV qui sera utilisé
    console.log('📄 [DEBUG] cvDataSnapshot utilisé pour la génération:', JSON.stringify(this.candidature.cvDataSnapshot, null, 2));


    const loading = await this.loadingController.create({
      message: 'Génération du PDF en cours...',
      spinner: 'crescent'
    });
    await loading.present();

    let pdfElement: HTMLElement | null = null;

    try {
      const userProfile = await firstValueFrom(this.profileService.getUserProfile());
      if (!userProfile) {
        throw new Error('Impossible de récupérer le profil utilisateur.');
      }
      // DEBUG: Afficher le profil utilisateur
      console.log('👤 [DEBUG] Profil utilisateur:', JSON.stringify(userProfile, null, 2));

      pdfElement = this.createCvElementFromData(this.candidature.cvDataSnapshot, userProfile);
      
      // DEBUG: Afficher le HTML final généré
      console.log('📄 [DEBUG] HTML généré:', pdfElement.innerHTML);
      
      document.body.appendChild(pdfElement);
      
      await new Promise(resolve => setTimeout(resolve, 50));

      const filename = this.pdfGeneratorService.generateFileName(
        `CV_${this.candidature.entreprise}`, 'candidature'
      );

      await this.pdfGeneratorService.generateOptimizedPdf(pdfElement, { filename, singlePage: true });

      this.presentToast('CV téléchargé avec succès !', 'success');

    } catch (error: any) {
      console.error('Erreur lors du téléchargement du CV:', error);
      this.presentToast(`Erreur de génération PDF: ${error.message || 'Une erreur inconnue est survenue'}`, 'danger');
    } finally {
      if (pdfElement) {
        document.body.removeChild(pdfElement);
      }
      await loading.dismiss();
    }
  }

  private createCvElementFromData(snapshot: any, profile: UserProfile): HTMLElement {
    const cvElement = document.createElement('div');
    cvElement.id = 'cv-render-temp';
    cvElement.innerHTML = this.generateStyledCvHtml(snapshot, profile);
    return cvElement;
  }
  
  private generateStyledCvHtml(snapshot: any, profile: UserProfile): string {
    const theme = snapshot.theme || { primaryColor: '#007bff' };
    const primaryColor = theme.primaryColor;

    const experiences = snapshot.experiences || [];
    const formations = snapshot.formations || [];
    const competences = snapshot.competences || [];

    const renderDescription = (description: string | string[] | undefined) => {
        if (!description) return '';
        if (Array.isArray(description)) {
            console.log('📄 [DEBUG] Rendu de la description comme une LISTE pour le PDF.');
            return `<ul style="margin: 4px 0 0 20px; padding-left: 0; list-style-type: disc;">${description.map(item => `<li style="margin-bottom: 3px; font-size: 12px;">${item}</li>`).join('')}</ul>`;
        }
        console.log('📄 [DEBUG] Rendu de la description comme un simple PARAGRAPHE pour le PDF.');
        return `<p style="font-size: 12px; margin: 0; text-align: justify; color: #333; line-height: 1.3;">${description}</p>`;
    };

    const headerHtml = `
      <div style="background-color: ${primaryColor}; color: white; padding: 20px; font-family: Arial, sans-serif; line-height: 1.4;">
        <h1 style="font-size: 24px; margin: 0 0 5px 0; text-transform: uppercase;">${profile.prenom || ''} ${profile.nom || ''}</h1>
        <p style="font-size: 14px; margin: 0 0 12px 0; font-style: italic;">${profile.resumePersonnel || ''}</p>
        <div style="font-size: 11px;">
            ${profile.email ? `<div><strong>Email:</strong> ${profile.email}</div>` : ''}
            ${profile.telephone ? `<div><strong>Téléphone:</strong> ${profile.telephone}</div>` : ''}
            ${profile.adresse ? `<div><strong>Adresse:</strong> ${profile.adresse}</div>` : ''}
        </div>
      </div>
    `;

    const experiencesHtml = (experiences || []).length === 0 ? '' : `
      <div style="margin-top: 15px;">
        <h2 style="color: ${primaryColor}; border-bottom: 2px solid ${primaryColor}; padding-bottom: 4px; margin-bottom: 12px; font-size: 18px; text-transform: uppercase;">Expérience Professionnelle</h2>
        ${experiences.map((exp: any) => `
          <div style="margin-bottom: 12px; page-break-inside: avoid;">
            <h3 style="font-size: 15px; font-weight: bold; margin: 0 0 2px 0;">${exp.poste || ''}</h3>
            <div style="color: #555; margin-bottom: 4px; font-size: 13px; font-style: italic;">${exp.entreprise || ''}</div>
            ${renderDescription(exp.description)}
          </div>
        `).join('')}
      </div>
    `;
    
    const formationsHtml = (formations || []).length === 0 ? '' : `
      <div style="margin-top: 15px;">
        <h2 style="color: ${primaryColor}; border-bottom: 2px solid ${primaryColor}; padding-bottom: 4px; margin-bottom: 12px; font-size: 18px; text-transform: uppercase;">Formations</h2>
        ${formations.map((form: any) => `
          <div style="margin-bottom: 10px; page-break-inside: avoid;">
            <h3 style="font-size: 15px; font-weight: bold; margin: 0 0 2px 0;">${form.diplome || ''}</h3>
            <p style="font-size: 13px; margin: 0; color: #555;">${form.etablissement || ''}</p>
            ${renderDescription(form.description)}
          </div>
        `).join('')}
      </div>
    `;

    const competencesHtml = (competences || []).length === 0 ? '' : `
      <div style="margin-top: 15px;">
        <h2 style="color: ${primaryColor}; border-bottom: 2px solid ${primaryColor}; padding-bottom: 4px; margin-bottom: 10px; font-size: 18px; text-transform: uppercase;">Compétences</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${competences.map((comp: any) => `
            <span style="background-color: #f1f1f1; color: #333; padding: 4px 10px; border-radius: 14px; font-size: 12px;">
              ${comp.nom || ''}
            </span>
          `).join('')}
        </div>
      </div>
    `;

    return `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        ${headerHtml}
        <div style="padding: 10px 5px 0 5px;">
          ${experiencesHtml}
          ${formationsHtml}
          ${competencesHtml}
        </div>
      </div>
    `;
  }
  
  async downloadLettreMotivation() {
    if (!this.candidature) {
      this.presentToast('Aucune lettre de motivation disponible', 'warning');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Génération du PDF en cours...',
      spinner: 'crescent'
    });
    try {
      await loading.present();
      const lettreElement = document.querySelector('#lettre-content') as HTMLElement;
      if (!lettreElement) {
        throw new Error('Impossible de trouver la lettre de motivation à télécharger');
      }
      const validation = this.pdfGeneratorService.validateElement(lettreElement);
      if (!validation.valid) {
        throw new Error(`Élément invalide: ${validation.errors.join(', ')}`);
      }
      const filename = this.pdfGeneratorService.generateFileName(
        `Lettre_motivation_${this.candidature.entreprise}_${this.candidature.intitulePoste}`,
        'candidature'
      );
      const options = {
        filename, quality: 0.95, scale: 2, singlePage: true,
        fontOptimization: true, backgroundColor: '#ffffff', padding: 30
      };
      await this.pdfGeneratorService.generateOptimizedPdf(lettreElement, options);
      this.presentToast('Lettre de motivation téléchargée avec succès !', 'success');
    } catch (error: any) {
      console.error('Erreur téléchargement lettre de motivation:', error);
      this.presentToast(`Erreur lors du téléchargement: ${error.message}`, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  getStatutColor(statut: StatutCandidature): string {
    const colorMap: { [key in StatutCandidature]: string } = {
      'brouillon': 'medium', 'envoyee': 'primary', 'en_cours_rh': 'secondary',
      'entretien_planifie': 'tertiary', 'test_technique': 'warning', 'entretien_final': 'warning',
      'offre_recue': 'success', 'acceptee': 'success', 'refusee_candidat': 'danger',
      'refusee_entreprise': 'danger', 'archivee': 'dark', 'standby': 'medium'
    };
    return colorMap[statut] || 'medium';
  }

  getStatutLabel(statut: StatutCandidature): string {
    const statutObj = this.statutsCandidature.find(s => s.value === statut);
    return statutObj ? statutObj.label : statut;
  }

  getSuiviIcon(type: TypeSuivi): string {
    const iconMap: { [key in TypeSuivi]: string } = {
      'contact': 'person-outline', 'email_envoye': 'mail-outline', 'email_recu': 'mail-open-outline',
      'appel_effectue': 'call-outline', 'appel_recu': 'call-outline', 'entretien_planifie': 'calendar-outline',
      'entretien_effectue': 'checkmark-circle-outline', 'entretien': 'people-outline', 'test_technique_recu': 'document-text-outline',
      'test_technique_complete': 'document-attach-outline', 'test': 'school-outline', 'feedback': 'chatbubble-outline',
      'relance': 'refresh-outline', 'autre': 'ellipsis-horizontal-outline'
    };
    return iconMap[type] || 'information-circle-outline';
  }

  getSuiviColor(type: TypeSuivi): string {
    const colorMap: { [key in TypeSuivi]: string } = {
      'contact': 'primary', 'email_envoye': 'secondary', 'email_recu': 'secondary',
      'appel_effectue': 'tertiary', 'appel_recu': 'tertiary', 'entretien_planifie': 'warning',
      'entretien_effectue': 'success', 'entretien': 'warning', 'test_technique_recu': 'medium',
      'test_technique_complete': 'success', 'test': 'medium', 'feedback': 'primary',
      'relance': 'warning', 'autre': 'dark'
    };
    return colorMap[type] || 'medium';
  }

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

  cancelEditing(): void {
    this.isEditing = false;
    if (this.candidature) {
      this.editableNotesPersonnelles = this.candidature.notesPersonnelles || '';
    }
  }

  async saveChanges(): Promise<void> {
    if (!this.candidature || !this.candidatureId) return;
    const loading = await this.loadingController.create({ message: 'Sauvegarde en cours...' });
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

  async updateStatut(newStatut: StatutCandidature): Promise<void> {
    if (!this.candidature || !this.candidatureId) return;
    const loading = await this.loadingController.create({ message: 'Mise à jour du statut...' });
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

  openAddSuiviModal(): void {
    this.isAddingSuivi = true;
    this.nouveauSuiviType = 'contact';
    this.nouveauSuiviDescription = '';
    this.nouveauSuiviNotes = '';
    this.nouveauSuiviCommentaire = '';
  }

  closeAddSuiviModal(): void {
    this.isAddingSuivi = false;
  }

  async addSuivi(): Promise<void> {
    if (!this.candidatureId || !this.nouveauSuiviDescription.trim()) {
      this.presentToast('Veuillez saisir une description pour le suivi', 'warning');
      return;
    }
    const loading = await this.loadingController.create({ message: 'Ajout du suivi...' });
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

  async sendRelanceEmail(): Promise<void> {
    if (!this.candidature || !this.candidatureId) return;
    const contactEmail = this.getContactEmail();
    if (!contactEmail) {
      this.presentToast('Aucun email de contact disponible', 'warning');
      return;
    }
    try {
      const suiviData: Omit<SuiviCandidature, 'id' | 'date'> = {
        type: 'relance',
        description: 'Email de relance envoyé',
        notes: `Email de relance envoyé à ${contactEmail}`,
        commentaire: 'Tentative d\'ouverture du client mail'
      };
      await this.candidatureService.addSuiviToCandidature(this.candidatureId, suiviData);
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

  async deleteCandidature(): Promise<void> {
    if (!this.candidatureId) return;
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action est irréversible.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Supprimer', role: 'destructive', handler: () => this.confirmDeleteCandidature() }
      ]
    });
    await alert.present();
  }

  private async confirmDeleteCandidature(): Promise<void> {
    const loading = await this.loadingController.create({ message: 'Suppression en cours...' });
    await loading.present();
    try {
      await this.candidatureService.deleteCandidature(this.candidatureId);
      this.presentToast('Candidature supprimée avec succès', 'success');
      this.router.navigate(['/tabs/dashboard']);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      this.presentToast('Erreur lors de la suppression de la candidature', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async generateDocuments(): Promise<void> {
    if (!this.candidature || !this.candidatureId) return;
    if (!this.candidature.cvTexteExtrait && !this.candidature.cvOriginalUrl && !this.candidature.lettreMotivationGeneree) {
      this.presentToast('Aucune donnée disponible pour la génération', 'warning');
      return;
    }
    const loading = await this.loadingController.create({ message: 'Génération des documents...' });
    await loading.present();
    try {
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

  private getContactEmail(): string {
    if (!this.candidature) return '';
    if (this.candidature.contactRecruteur?.email) {
      return this.candidature.contactRecruteur.email;
    }
    if (this.candidature.contacts && this.candidature.contacts.length > 0 && this.candidature.contacts[0].email) {
      return this.candidature.contacts[0].email;
    }
    return '';
  }
  
  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit', month: '2-digit', year: 'numeric'
      };
      return date.toLocaleDateString('fr-FR', options);
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return '';
    }
  }
  private async presentToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
    });
    toast.present();
  }

  goBack(): void {
    this.router.navigate(['/tabs/dashboard']);
  }
}
