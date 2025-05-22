import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subscription, BehaviorSubject } from 'rxjs';
import { switchMap, tap, first, catchError } from 'rxjs/operators';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
  IonCardContent, IonLabel, IonBadge, IonItem, IonIcon, IonButtons, IonBackButton,
  IonList, IonListHeader, IonSpinner, IonButton, IonModal, IonTextarea,
  IonSelect, IonSelectOption,
  ModalController
} from '@ionic/angular/standalone';
import { Candidature, SuiviCandidature, TypeSuivi } from 'src/app/models/candidature.model';
import { CandidatureService } from 'src/app/services/candidature/candidature.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { ToastController } from '@ionic/angular/standalone';
import { TextViewerModalComponent } from 'src/app/components/text-viewer-modal/text-viewer-modal.component';

@Component({
  selector: 'app-candidature-detail',
  templateUrl: './candidature-detail.page.html',
  styleUrls: ['./candidature-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, DatePipe, RouterModule, FormsModule, TitleCasePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
    IonCardContent, IonLabel, IonBadge, IonItem, IonIcon, IonButtons, IonBackButton,
    IonList, IonListHeader, IonSpinner, IonButton, IonModal, IonTextarea,
    IonSelect, IonSelectOption
  ]
})
export class CandidatureDetailPage implements OnInit, OnDestroy {
  
  private candidatureSubscription: Subscription | undefined;
  private candidatureSubject = new BehaviorSubject<Candidature | undefined>(undefined);
  candidature$: Observable<Candidature | undefined> = this.candidatureSubject.asObservable();
  
  isLoading: boolean = true;
  errorMessage: string | null = null;
  candidatureId: string | null = null;

  isAddSuiviModalOpen: boolean = false;
  nouveauSuiviType: TypeSuivi = 'email_envoye';
  nouveauSuiviNotes: string = '';
  
  typesDeSuivi: { value: TypeSuivi, label: string }[] = [
    { value: 'email_envoye', label: 'Email envoyé' },
    { value: 'email_recu', label: 'Email reçu' },
    { value: 'appel_effectue', label: 'Appel effectué' },
    { value: 'appel_recu', label: 'Appel reçu' },
    { value: 'entretien_planifie', label: 'Entretien planifié' },
    { value: 'entretien_effectue', label: 'Entretien effectué' },
    { value: 'test_technique_recu', label: 'Test technique reçu' },
    { value: 'test_technique_complete', label: 'Test technique complété' },
    { value: 'relance', label: 'Relance' },
    { value: 'autre', label: 'Autre' }
  ];

  constructor(
    private route: ActivatedRoute,
    private candidatureService: CandidatureService,
    private headerService: HeaderService,
    private modalController: ModalController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.candidatureSubscription = this.route.paramMap.pipe(
      switchMap(params => {
        this.candidatureId = params.get('id');
        if (this.candidatureId) {
          return this.candidatureService.getCandidatureById(this.candidatureId);
        }
        this.errorMessage = "ID de candidature non trouvé.";
        this.isLoading = false;
        return of(undefined);
      }),
      tap(candidature => {
        this.isLoading = false;
        if (candidature) {
          this.candidatureSubject.next(candidature);
          this.headerService.updateTitle(candidature.poste || 'Détail Candidature');
          this.headerService.setShowBackButton(true);
        } else if (this.candidatureId) {
          this.errorMessage = this.errorMessage || "Candidature non trouvée ou accès non autorisé.";
          this.candidatureSubject.next(undefined);
        } else {
            this.candidatureSubject.next(undefined);
        }
      }),
      catchError(err => {
        this.isLoading = false;
        this.errorMessage = "Erreur lors du chargement de la candidature.";
        this.candidatureSubject.next(undefined);
        console.error(err);
        return of(undefined);
      })
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.candidatureSubscription) {
      this.candidatureSubscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    const currentCandidature = this.candidatureSubject.value;
    if (currentCandidature) {
        this.headerService.updateTitle(currentCandidature.poste || 'Détail Candidature');
        this.headerService.setShowBackButton(true);
    } else if (this.candidatureId && !this.isLoading) {
        this.headerService.updateTitle('Détail Candidature');
        this.headerService.setShowBackButton(true);
    }
  }

  ionViewWillLeave() {
    this.headerService.setShowBackButton(false);
  }

  async openAddSuiviModal(isOpen: boolean) {
    this.isAddSuiviModalOpen = isOpen;
    if (!isOpen) {
      this.nouveauSuiviType = 'email_envoye';
      this.nouveauSuiviNotes = '';
    }
  }

  async handleAjouterSuivi() {
    if (!this.candidatureId || !this.nouveauSuiviNotes.trim()) {
      this.presentToast('Veuillez sélectionner un type et ajouter des notes pour le suivi.', 'warning');
      return;
    }

    const suiviData: Omit<SuiviCandidature, 'id' | 'date'> = {
      type: this.nouveauSuiviType,
      notes: this.nouveauSuiviNotes
    };

    try {
      await this.candidatureService.addSuiviToCandidature(this.candidatureId, suiviData);
      this.presentToast('Suivi ajouté avec succès !', 'success');
      this.openAddSuiviModal(false);
      if(this.candidatureId) {
          const updatedCandidature = await this.candidatureService.getCandidatureById(this.candidatureId).pipe(first()).toPromise();
          this.candidatureSubject.next(updatedCandidature);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du suivi:", error);
      this.presentToast('Erreur lors de l\'ajout du suivi.', 'danger');
    }
  }
  
  async envoyerEmailRelance() {
    const candidature = this.candidatureSubject.value;
    if (!candidature) {
      this.presentToast('Données de candidature non disponibles pour l\'email de relance.', 'warning');
      return;
    }

    const subject = `Relance candidature - ${candidature.poste || 'un poste'} chez ${candidature.entreprise || 'votre entreprise'}`;
    const body = `Bonjour,\n\nJe me permets de revenir vers vous concernant ma candidature pour le poste de ${candidature.poste || '[Nom du Poste]'}.\nPourriez-vous s'il vous plaît me donner une mise à jour sur l'état de ma candidature ?\n\nJe vous remercie pour votre temps et votre considération.\n\nCordialement,\n[Votre Nom Complet]`;
        
    const contactEmail = (candidature.contacts && candidature.contacts.length > 0 && candidature.contacts[0].email) ? candidature.contacts[0].email : '';
    const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
    
    if (!contactEmail) {
        this.presentToast('Adresse email du contact non trouvée. L\'email s\'ouvrira sans destinataire.', 'light');
    }
    
    const suiviData: Omit<SuiviCandidature, 'id' | 'date'> = {
      type: 'relance',
      notes: `Email de relance (tentative d'ouverture client mail) pour le poste: ${candidature.poste}.`
    };
    if (this.candidatureId) {
      try {
        await this.candidatureService.addSuiviToCandidature(this.candidatureId, suiviData);
        this.presentToast('Suivi "Email de relance" enregistré.', 'success');
        const updatedCandidatureAfterRelance = await this.candidatureService.getCandidatureById(this.candidatureId).pipe(first()).toPromise();
        this.candidatureSubject.next(updatedCandidatureAfterRelance);
      } catch (error) {
        console.error("Erreur lors de l'ajout du suivi de relance:", error);
      }
    }
  }

  async voirCvEtLettre() {
    const candidature = this.candidatureSubject.value;
    if (!candidature) {
      this.presentToast('Données de candidature non disponibles.', 'warning');
      return;
    }

    if (!candidature.cvTexteExtrait && !candidature.cvOriginalUrl && !candidature.lettreMotivationGeneree) {
      this.presentToast('Aucun document ou texte à visualiser.', 'light');
      return;
    }

    const modal = await this.modalController.create({
      component: TextViewerModalComponent,
      componentProps: {
        cvTexteExtrait: candidature.cvTexteExtrait,
        lettreMotivationGeneree: candidature.lettreMotivationGeneree,
        cvOriginalUrl: candidature.cvOriginalUrl,
        cvOriginalFileName: candidature.cvOriginalNom
      }
    });
    await modal.present();
  }
  
  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' | 'light') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [{ text: 'OK', role: 'cancel'}]
    });
    toast.present();
  }
}