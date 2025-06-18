import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subscription, combineLatest } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import {
  IonContent, IonSpinner, IonIcon,
  IonButton, IonRefresher, IonRefresherContent,
  IonFab, IonFabButton, IonText,
  IonPopover, IonList, IonItem, IonLabel // Added for Sort Popover
} from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/shared/services/header/header.service';
import { CandidatureService, GetCandidaturesOptions } from 'src/app/shared/services/candidature/candidature.service';
import { FilterService } from 'src/app/shared/services/filter/filter.service';
import { Candidature } from 'src/app/features/candidatures/models/candidature.model';
import { FilterOptions } from 'src/app/features/candidatures/models/filter.model'; // Keep this
import { CandidatureCardComponent } from '../../components/candidature-card/candidature-card.component';
// import { FilterPanelComponent } from 'src/app/components/filter-panel/filter-panel.component'; // Replaced
// import { UserHeaderComponent } from 'src/app/shared/components/user-header/user-header.component'; // Replaced
import { ToastController, AlertController } from '@ionic/angular/standalone';
import { StyledButtonComponent } from '../../../../components/shared/styled-button/styled-button.component'; // Added

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonContent, IonSpinner, IonIcon, IonButton,
    IonRefresher, IonRefresherContent,
    IonFab, IonFabButton, IonText,
    IonPopover, IonList, IonItem, IonLabel, // Added
    CandidatureCardComponent,
    StyledButtonComponent
  ]
})
export class DashboardPage implements OnInit, OnDestroy {
  public candidatures$: Observable<Candidature[]> = of([]);
  public candidatures: Candidature[] = [];
  public filteredCandidatures: Candidature[] = [];
  public isLoading: boolean = true;
  public errorLoading: string | null = null;
  private candidaturesSubscription?: Subscription;

  // User data for new header
  public userName: string = 'John Doe'; // Static for now
  public userInitials: string = 'JD';   // Static for now
  
  // États pour la sélection multiple
  public isSelectionMode: boolean = false;
  public selectedCandidatures: Set<string> = new Set();
  public isDeletingSelected: boolean = false;

  // Gestion des filtres
  public filterOptions: FilterOptions = { // This will be synced with FilterService
    selectedStatuts: [],
    sortByDate: 'desc', // Default sort
    searchText: ''
  };
  public searchText: string = ''; // For [(ngModel)] binding with new search input
  public activeFilterChip: string = 'all'; // To manage active state of filter chips

  constructor(
    private headerService: HeaderService, // To be reviewed if still needed for title setting
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
    // this.headerService.updateTitle('Tableau de Bord'); // Title is now part of the page
    // this.headerService.setShowBackButton(false); // No global back button here
    
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
    // Subscribe to filter changes to keep component's state (like searchText, activeFilterChip) in sync
    // This subscription should ideally be managed and unsubscribed in ngOnDestroy
    // For simplicity here, if it's only for initial setup, can unsubscribe after first emission.
    const initialFilterSub = this.filterService.filterOptions$.subscribe(options => {
      this.searchText = options.searchText || '';
      this.filterOptions = { ...options }; // Update local copy

      // Update activeFilterChip based on current filters
      if (options.selectedStatuts && options.selectedStatuts.length > 0) {
        // This is a simplified logic. If multiple statuses can be selected,
        // or if chips map to complex filter states, this needs refinement.
        // For now, assume the first selected status (if any) determines the active chip.
        this.activeFilterChip = options.selectedStatuts[0].toLowerCase();
      } else if (options.searchText) {
        // If search text is active, no specific chip might be "active" unless 'all' is default
        this.activeFilterChip = ''; // Or some other state indicating search is active
      }
      else {
        this.activeFilterChip = 'all';
      }
    });
    // Consider unsubscribing if this is truly only for initialization, e.g., initialFilterSub.unsubscribe();
    // Or add to a list of subscriptions to be cleaned up in ngOnDestroy.

    // Ensure the FilterService has the initial default sort order from the component's filterOptions
    this.filterService.setSortByDate(this.filterOptions.sortByDate);
    this.filterService.setSearchText(this.filterOptions.searchText); // Init searchText in service
    this.filterService.setSelectedStatuts(this.filterOptions.selectedStatuts); // Init statuses in service
  }

  /**
   * Charger les candidatures avec les filtres appliqués
   */
  loadCandidaturesWithFilters(event?: any): void {
    if (this.candidaturesSubscription) {
      this.candidaturesSubscription.unsubscribe();
    }

    this.isLoading = true;
    this.errorLoading = null;
    // Keep existing this.candidatures and this.filteredCandidatures as is until new data arrives or clear them if desired
    // this.candidatures = [];
    // this.filteredCandidatures = [];

    this.candidaturesSubscription = combineLatest([
      this.filterService.filterOptions$, // Source of truth for filter options
      this.filterService.filterOptions$.pipe(
        switchMap(currentFilterOptions => { // Use currentFilterOptions from the service
          const options: GetCandidaturesOptions = {
            sortByDate: currentFilterOptions.sortByDate,
            statuts: currentFilterOptions.selectedStatuts.length > 0 ? currentFilterOptions.selectedStatuts : undefined,
            searchText: currentFilterOptions.searchText
          };
          return this.candidatureService.getCandidatures(options);
        })
      )
    ]).pipe(
      map(([currentFilterOptions, candidaturesFromService]) => {
        // Augment candidatures with mock data for new card fields
        const augmentedCandidatures = candidaturesFromService.map((cand, index) => ({
          ...cand,
          // Use existing data if available, otherwise provide mock data
          companyLogoUrl: cand.companyLogoUrl || `https://picsum.photos/seed/${cand.id || index}/48/48`, // Mock logo
          aiScore: cand.aiScore || (70 + (parseInt(cand.id || `${index}`, 16) % 30)), // Mock AI score
          keywordsArray: cand.keywordsArray || ['Mot-clé ' + (index % 3 + 1), 'Tech ' + (index % 2 + 1)], // Mock keywords
        }));
        return {
          filterOptions: currentFilterOptions, // Use options from service
          candidatures: augmentedCandidatures
        };
      }),
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
        this.candidatures = result.candidatures; // This is now augmented
        this.filteredCandidatures = result.candidatures; // This is now augmented
        this.filterOptions = result.filterOptions; // Sync local filterOptions with what was used
        this.candidatures$ = of(result.candidatures);
        // Update searchText based on filterOptions from service to ensure UI consistency
        this.searchText = result.filterOptions.searchText || '';
      },
      error: (err) => { // Added error parameter
        this.isLoading = false;
        this.errorLoading = `Erreur lors du chargement: ${err.message || 'Vérifiez votre connexion.'}`;
        console.error("Subscription error:", err);
      }
    });
  }

  /**
   * Changement du tri par date - Commented out as UI for this is removed.
   * FilterService now manages sort order, potentially via a future UI element or default.
   */
  // onSortChange(): void {
  //   this.filterService.setSortByDate(this.sortByDate);
  // }

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

  // ==================== New Methods for Header and Filters ====================
  navigateToProfile(): void {
    console.log('Navigate to profile clicked');
    this.router.navigate(['/profile']); // Example navigation
  }

  showOpportunities(): void {
    console.log('Show new opportunities clicked');
    // TODO: Implement logic to show AI opportunities, perhaps a modal or new page
    this.presentToast('Fonctionnalité "Voir les opportunités" à implémenter.', 'primary');
  }

  onSearchTextChanged(): void {
    this.filterService.setSearchText(this.searchText);
  }

  applyFilter(statusFilter: string): void {
    this.activeFilterChip = statusFilter;
    console.log('Applying filter:', statusFilter);
    // This is a simplified filter application.
    // In a real scenario, you'd map statusFilter to actual StatutCandidature values
    // and potentially handle multiple selections or more complex logic.
    if (statusFilter === 'all') {
      this.filterService.setSelectedStatuts([]);
    } else {
      // Assuming statusFilter directly maps to a StatutCandidature value for simplicity.
      // This might need adjustment based on how StatutCandidature enum/type is defined.
      // For example, if StatutCandidature.ENTRETIEN_PLANIFIE is 'entretien_planifie'
      this.filterService.setSelectedStatuts([statusFilter.toUpperCase() as Candidature['statut']]);
    }
    // No need to call loadCandidaturesWithFilters() if using reactive FilterService pattern
  }

  setSortByDate(sortOrder: 'asc' | 'desc'): void {
    // Update local component state if needed, though filterOptions should be the source of truth via service
    this.filterOptions.sortByDate = sortOrder;
    this.filterService.setSortByDate(sortOrder);
    // The existing subscription to filterService.filterOptions$ in loadCandidaturesWithFilters
    // should automatically trigger a reload with the new sort order.
  }

  editCandidature(candidatureId: string): void {
    console.log('Edit candidature requested:', candidatureId);
    // TODO: Implement navigation to an edit page or modal, similar to viewCandidatureDetail
    // For example: this.router.navigate(['/candidature', candidatureId, 'edit']);
    this.presentToast(`Fonctionnalité d'édition pour ${candidatureId} à implémenter.`, 'primary');
  }
}