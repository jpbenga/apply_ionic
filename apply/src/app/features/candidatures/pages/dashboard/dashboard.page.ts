import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subscription, combineLatest } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import {
  IonHeader, IonContent, IonSpinner, IonIcon,
  IonButton, IonRefresher, IonRefresherContent,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonFab, IonFabButton, IonText
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/shared/services/header/header.service';
import { CandidatureService, GetCandidaturesOptions } from 'src/app/shared/services/candidature/candidature.service';
import { FilterService } from 'src/app/shared/services/filter/filter.service';
import { Candidature } from 'src/app/features/candidatures/models/candidature.model';
import { FilterOptions } from 'src/app/features/candidatures/models/filter.model';
import { CandidatureCardComponent } from '../../components/candidature-card/candidature-card.component';
import { FilterPanelComponent } from 'src/app/components/filter-panel/filter-panel.component';
import { UserHeaderComponent } from 'src/app/shared/components/user-header/user-header.component';
import { ToastController, AlertController } from '@ionic/angular/standalone';

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
    IonFab, IonFabButton, IonText,
    UserHeaderComponent,
    CandidatureCardComponent,
    FilterPanelComponent
  ]
})
export class DashboardPage implements OnInit, OnDestroy {
  public candidatures$: Observable<Candidature[]> = of([]);
  public candidatures: Candidature[] = [];
  public filteredCandidatures: Candidature[] = [];
  public isLoading: boolean = true;
  public errorLoading: string | null = null;
  private candidaturesSubscription?: Subscription;

  public sortByDate: 'asc' | 'desc' = 'desc';
  
  // États pour la sélection multiple
  public isSelectionMode: boolean = false;
  public selectedCandidatures: Set<string> = new Set();
  public isDeletingSelected: boolean = false;

  // Options de tri
  public optionsDeTri: { value: 'asc' | 'desc', label: string }[] = [
    { value: 'desc', label: 'Plus récentes d\'abord' },
    { value: 'asc', label: 'Plus anciennes d\'abord' }
  ];

  // Gestion des filtres
  public filterOptions: FilterOptions = {
    selectedStatuts: [],
    sortByDate: 'desc'
  };

  constructor(
    private headerService: HeaderService,
    private candidatureService: CandidatureService,
    private filterService: FilterService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.initializeFilters();
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
    this.filteredCandidatures = [];
    this.selectedCandidatures.clear();
    this.isSelectionMode = false;
    
    this.loadCandidaturesWithFilters(); 
  }

  /**
   * Initialiser la gestion des filtres
   */
  private initializeFilters(): void {
    // Synchroniser le tri initial avec le FilterService
    this.filterService.setSortByDate(this.sortByDate);
  }

  /**
   * Charger les candidatures avec les filtres appliqués
   */
  loadCandidaturesWithFilters(event?: any): void {
    // Arrête l'ancienne souscription s'il y en a une
    if (this.candidaturesSubscription) {
      this.candidaturesSubscription.unsubscribe();
    }

    this.isLoading = true;
    this.errorLoading = null;
    this.candidatures = [];
    this.filteredCandidatures = [];

    // Combiner les options de filtrage avec les candidatures
    this.candidaturesSubscription = combineLatest([
      this.filterService.filterOptions$,
      this.filterService.filterOptions$.pipe(
        switchMap(filterOptions => {
          const options: GetCandidaturesOptions = {
            sortByDate: filterOptions.sortByDate,
            statuts: filterOptions.selectedStatuts.length > 0 ? filterOptions.selectedStatuts : undefined,
            searchText: filterOptions.searchText
          };
          return this.candidatureService.getCandidatures(options);
        })
      )
    ]).pipe(
      map(([filterOptions, candidatures]) => ({
        filterOptions,
        candidatures
      })),
      catchError(error => {
        this.errorLoading = 'Impossible de charger les candidatures.';
        console.error('Erreur chargement candidatures:', error);
        return of({ filterOptions: this.filterOptions, candidatures: [] });
      }),
      finalize(() => {
        if (event && event.target && typeof event.target.complete === 'function') {
          event.target.complete();
        }
      })
    ).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.candidatures = result.candidatures;
        this.filteredCandidatures = result.candidatures;
        this.filterOptions = result.filterOptions;
        this.candidatures$ = of(result.candidatures);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Changement du tri par date
   */
  onSortChange(): void {
    this.filterService.setSortByDate(this.sortByDate);
    // La réactivité du système se charge automatiquement du rechargement
  }

  /**
   * Gestion du refresh
   */
  handleRefresh(event: any): void {
    this.loadCandidaturesWithFilters(event);
  }

  /**
   * Voir les détails d'une candidature
   */
  viewCandidatureDetail(candidatureId: string | undefined): void {
    if (!candidatureId) {
      console.error('ID de candidature non défini, navigation annulée.');
      return;
    }
    this.router.navigate(['/candidature', candidatureId]);
  }

  /**
   * Aller à la page de création de candidature
   */
  goToPostulerPage(): void {
    this.router.navigate(['/tabs/postuler']);
  }

  // ==================== GESTION DE LA SÉLECTION MULTIPLE ====================

  /**
   * Basculer le mode sélection
   */
  toggleSelectionMode(): void {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      this.clearSelection();
    }
  }

  /**
   * Basculer la sélection d'une candidature
   */
  toggleCandidatureSelection(candidatureId: string): void {
    if (this.selectedCandidatures.has(candidatureId)) {
      this.selectedCandidatures.delete(candidatureId);
    } else {
      this.selectedCandidatures.add(candidatureId);
    }
  }

  /**
   * Sélectionner toutes les candidatures visibles
   */
  selectAllCandidatures(): void {
    this.filteredCandidatures.forEach(candidature => {
      if (candidature.id) {
        this.selectedCandidatures.add(candidature.id);
      }
    });
  }

  /**
   * Effacer la sélection
   */
  clearSelection(): void {
    this.selectedCandidatures.clear();
  }

  /**
   * Nombre de candidatures sélectionnées
   */
  get selectedCount(): number {
    return this.selectedCandidatures.size;
  }

  /**
   * Vérifier si toutes les candidatures visibles sont sélectionnées
   */
  get isAllSelected(): boolean {
    return this.filteredCandidatures.length > 0 && 
           this.selectedCount === this.filteredCandidatures.length;
  }

  // ==================== GESTION DE LA SUPPRESSION ====================

  /**
   * Supprimer une candidature individuelle
   */
  async deleteCandidature(candidatureId: string | undefined): Promise<void> {
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

  /**
   * Confirmer la suppression d'une candidature
   */
  private async confirmDeleteCandidature(candidatureId: string): Promise<void> {
    try {
      await this.candidatureService.deleteCandidature(candidatureId);
      this.presentToast('Candidature supprimée avec succès.', 'success');
      
      // Le système réactif se charge automatiquement du rechargement
    } catch (error) {
      console.error('Erreur lors de la suppression de la candidature:', error);
      this.presentToast('Erreur lors de la suppression de la candidature.', 'danger');
    }
  }

  /**
   * Supprimer les candidatures sélectionnées
   */
  async deleteSelectedCandidatures(): Promise<void> {
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

  /**
   * Confirmer la suppression des candidatures sélectionnées
   */
  private async confirmDeleteSelectedCandidatures(): Promise<void> {
    const candidatureIds = Array.from(this.selectedCandidatures);
    this.isDeletingSelected = true;

    try {
      await this.candidatureService.deleteMultipleCandidatures(candidatureIds);
      this.presentToast(`${candidatureIds.length} candidature(s) supprimée(s) avec succès.`, 'success');
      this.clearSelection();
      this.isSelectionMode = false;
      
      // Le système réactif se charge automatiquement du rechargement
    } catch (error) {
      console.error('Erreur lors de la suppression des candidatures:', error);
      this.presentToast('Erreur lors de la suppression des candidatures.', 'danger');
    } finally {
      this.isDeletingSelected = false;
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
   * Obtenir le nombre de candidatures filtrées (pour le FilterPanel)
   */
  get resultsCount(): number {
    return this.filteredCandidatures.length;
  }

  /**
   * TrackBy function pour optimiser les performances de *ngFor
   */
  trackByCandidatureId(index: number, candidature: Candidature): string {
    return candidature.id || index.toString();
  }
}