import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  IonHeader, IonContent, IonSpinner, IonIcon,
  IonButton, IonRefresher, IonRefresherContent,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { HeaderService } from '../../../../shared/services/header/header.service'; // Path corrected
import { CandidatureService, GetCandidaturesOptions } from '../../services/candidature/candidature.service'; // MODIFIED
import { Candidature } from '../../models/candidature.model'; // MODIFIED
import { CandidatureCardComponent } from '../../components/candidature-card/candidature-card.component';
import { UserHeaderComponent } from '../../../../shared/components/user-header/user-header.component'; // Path corrected
import { ToastController, AlertController } from '@ionic/angular/standalone';
// import { addIcons } from 'ionicons'; // SUPPRIMÉ
// import { addCircleOutline, cloudOfflineOutline, fileTrayOutline, add, checkboxOutline, square, trashOutline, checkmarkCircleOutline } from 'ionicons/icons'; // SUPPRIMÉ

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonHeader, IonContent, IonSpinner, IonIcon, IonButton,
    IonRefresher, IonRefresherContent, IonItem, IonLabel, IonSelect, IonSelectOption,
    IonFab, IonFabButton,
    UserHeaderComponent,
    CandidatureCardComponent
  ]
})
export class DashboardPage implements OnInit, OnDestroy {
  public candidatures$: Observable<Candidature[]> = of([]);
  public candidatures: Candidature[] = [];
  public isLoading: boolean = true;
  public errorLoading: string | null = null;
  private candidaturesSubscription?: Subscription;

  public sortByDate: 'asc' | 'desc' = 'desc';
  
  // États pour la sélection multiple
  public isSelectionMode: boolean = false;
  public selectedCandidatures: Set<string> = new Set();
  public isDeletingSelected: boolean = false;

  public optionsDeTri: { value: 'asc' | 'desc', label: string }[] = [
    { value: 'desc', label: 'Plus récentes d\'abord' },
    { value: 'asc', label: 'Plus anciennes d\'abord' }
  ];

  constructor(
    private headerService: HeaderService,
    private candidatureService: CandidatureService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // addIcons({  // SUPPRIMÉ
    //   addCircleOutline,
    //   cloudOfflineOutline,
    //   fileTrayOutline,
    //   add,
    //   checkboxOutline,
    //   square,
    //   trashOutline,
    //   checkmarkCircleOutline
    // });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.candidaturesSubscription) {
      this.candidaturesSubscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.headerService.updateTitle('Tableau de Bord');
    this.headerService.setShowBackButton(false);
    
    // Force l'arrêt de l'ancienne souscription
    if (this.candidaturesSubscription) {
      this.candidaturesSubscription.unsubscribe();
    }
    
    // Réinitialise tout
    this.candidatures = [];
    this.selectedCandidatures.clear();
    this.isSelectionMode = false;
    
    this.loadCandidatures(); 
  }

  loadCandidatures(event?: any) {
    // Arrête l'ancienne souscription s'il y en a une
    if (this.candidaturesSubscription) {
      this.candidaturesSubscription.unsubscribe();
    }

    this.isLoading = true;
    this.errorLoading = null;
    this.candidatures = [];

    const options: GetCandidaturesOptions = {
      sortByDate: this.sortByDate
    };

    // Crée une nouvelle souscription
    this.candidaturesSubscription = this.candidatureService.getCandidatures(options).pipe(
      catchError(error => {
        this.errorLoading = 'Impossible de charger les candidatures.';
        console.error('Erreur chargement candidatures:', error);
        return of([]);
      }),
      finalize(() => {
        if (event && event.target && typeof event.target.complete === 'function') {
          event.target.complete();
        }
      })
    ).subscribe({
      next: (candidatures) => {
        this.isLoading = false;
        this.candidatures = candidatures;
        this.candidatures$ = of(candidatures); // Met à jour l'observable aussi
      },
      error: () => this.isLoading = false
    });
  }

  onSortChange() {
    this.loadCandidatures();
  }

  handleRefresh(event: any) {
    this.loadCandidatures(event);
  }

  viewCandidatureDetail(candidatureId: string | undefined) {
    if (!candidatureId) {
      console.error('ID de candidature non défini, navigation annulée.');
      return;
    }
    this.router.navigate(['/candidature', candidatureId]);
  }

  goToPostulerPage() {
    this.router.navigate(['/tabs/postuler']);
  }

  // Suppression individuelle
  async deleteCandidature(candidatureId: string | undefined) {
    if (!candidatureId) {
      this.presentToast('ID de candidature non défini.', 'warning');
      return;
    }

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
          handler: () => {
            this.confirmDeleteCandidature(candidatureId);
          }
        }
      ]
    });

    await alert.present();
  }

  private async confirmDeleteCandidature(candidatureId: string) {
    try {
      await this.candidatureService.deleteCandidature(candidatureId);
      this.presentToast('Candidature supprimée avec succès.', 'success');
      
      // Force le rechargement immédiat des données
      this.loadCandidatures();
    } catch (error) {
      console.error('Erreur lors de la suppression de la candidature:', error);
      this.presentToast('Erreur lors de la suppression de la candidature.', 'danger');
    }
  }

  // Sélection multiple
  toggleSelectionMode() {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      this.clearSelection();
    }
  }

  toggleCandidatureSelection(candidatureId: string) {
    if (this.selectedCandidatures.has(candidatureId)) {
      this.selectedCandidatures.delete(candidatureId);
    } else {
      this.selectedCandidatures.add(candidatureId);
    }
  }

  selectAllCandidatures() {
    this.candidatures.forEach(candidature => {
      if (candidature.id) {
        this.selectedCandidatures.add(candidature.id);
      }
    });
  }

  clearSelection() {
    this.selectedCandidatures.clear();
  }

  get selectedCount(): number {
    return this.selectedCandidatures.size;
  }

  get isAllSelected(): boolean {
    return this.candidatures.length > 0 && this.selectedCount === this.candidatures.length;
  }

  async deleteSelectedCandidatures() {
    if (this.selectedCandidatures.size === 0) {
      this.presentToast('Aucune candidature sélectionnée.', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer ${this.selectedCandidatures.size} candidature(s) ? Cette action est irréversible.`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: `Supprimer ${this.selectedCandidatures.size} candidature(s)`,
          role: 'destructive',
          handler: () => {
            this.confirmDeleteSelectedCandidatures();
          }
        }
      ]
    });

    await alert.present();
  }

  private async confirmDeleteSelectedCandidatures() {
    const candidatureIds = Array.from(this.selectedCandidatures);
    this.isDeletingSelected = true;

    try {
      await this.candidatureService.deleteMultipleCandidatures(candidatureIds);
      this.presentToast(`${candidatureIds.length} candidature(s) supprimée(s) avec succès.`, 'success');
      this.clearSelection();
      this.isSelectionMode = false;
      
      // Force le rechargement immédiat des données
      this.loadCandidatures();
    } catch (error) {
      console.error('Erreur lors de la suppression des candidatures:', error);
      this.presentToast('Erreur lors de la suppression des candidatures.', 'danger');
    } finally {
      this.isDeletingSelected = false;
    }
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' | 'light') {
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