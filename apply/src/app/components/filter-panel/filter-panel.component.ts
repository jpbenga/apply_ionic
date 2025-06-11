import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  IonButton, IonIcon, IonPopover, IonContent, IonList, IonItem, IonLabel,
  IonCheckbox, IonSearchbar, IonBadge, IonChip, IonText
} from '@ionic/angular/standalone';
import { FilterService } from 'src/app/shared/services/filter/filter.service';
import { StatutCandidature } from 'src/app/features/candidatures/models/candidature.model';
import { FilterGroup, FILTER_GROUPS } from 'src/app/features/candidatures/models/filter.model';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton, IonIcon, IonPopover, IonContent, IonList, IonItem, IonLabel,
    IonCheckbox, IonSearchbar, IonBadge, IonChip, IonText
  ]
})
export class FilterPanelComponent implements OnInit, OnDestroy {
  @Input() resultsCount: number = 0;

  // État du composant
  public activeGroup: string = 'all';
  public customStatuts: StatutCandidature[] = [];
  public searchTerm: string = '';
  public hasActiveFilters: boolean = false;
  public selectedStatutsCount: number = 0;

  // Données pour l'interface
  public filterGroups: FilterGroup[] = [];
  public availableStatuts: { value: StatutCandidature; label: string }[] = [];
  
  // États UI
  public isStatutPopoverOpen: boolean = false;
  public isSearchVisible: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(public filterService: FilterService) {}

  ngOnInit() {
    this.initializeData();
    this.subscribeToFilterState();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Initialiser les données statiques
   */
  private initializeData(): void {
    this.filterGroups = this.filterService.getFilterGroups();
    this.availableStatuts = this.filterService.getAvailableStatuts();
  }

  /**
   * S'abonner aux changements d'état du service
   */
  private subscribeToFilterState(): void {
    // État global du filtrage
    const filterStateSub = this.filterService.filterState$.subscribe(state => {
      this.activeGroup = state.activeGroup;
      this.customStatuts = state.customStatuts;
      this.searchTerm = state.searchTerm;
      this.hasActiveFilters = state.hasActiveFilters;
    });

    // Compteur de statuts sélectionnés
    const countSub = this.filterService.getSelectedStatutsCount().subscribe(count => {
      this.selectedStatutsCount = count;
    });

    this.subscriptions.push(filterStateSub, countSub);
  }

  /**
   * Sélectionner un groupe de filtres rapides
   */
  onGroupSelect(groupKey: string): void {
    this.filterService.setActiveGroup(groupKey);
    this.isStatutPopoverOpen = false; // Fermer le popover si ouvert
  }

  /**
   * Toggle d'un statut individuel
   */
  onStatutToggle(statut: StatutCandidature): void {
    this.filterService.toggleCustomStatut(statut);
  }

  /**
   * Vérifier si un statut est sélectionné
   */
  isStatutSelected(statut: StatutCandidature): boolean {
    return this.filterService.isStatutSelected(statut);
  }

  /**
   * Gérer la recherche
   */
  onSearchChange(event: any): void {
    const searchValue = event.target.value || '';
    this.filterService.setSearchTerm(searchValue);
  }

  /**
   * Basculer la visibilité de la recherche
   */
  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
    if (!this.isSearchVisible && this.searchTerm) {
      this.filterService.setSearchTerm('');
    }
  }

  /**
   * Réinitialiser tous les filtres
   */
  resetFilters(): void {
    this.filterService.resetAllFilters();
    this.isSearchVisible = false;
    this.isStatutPopoverOpen = false;
  }

  /**
   * Gérer l'ouverture/fermeture du popover des statuts
   */
  onStatutPopoverToggle(isOpen: boolean): void {
    this.isStatutPopoverOpen = isOpen;
  }

  /**
   * Obtenir le libellé d'un groupe
   */
  getGroupLabel(groupKey: string): string {
    const group = FILTER_GROUPS[groupKey];
    return group ? group.label : groupKey;
  }

  /**
   * Obtenir la couleur d'un groupe selon son état
   */
  getGroupColor(groupKey: string): string {
    if (this.activeGroup === groupKey) {
      return 'primary';
    }
    return 'medium';
  }

  /**
   * Obtenir la variante de bouton selon l'état du groupe
   */
  getGroupFill(groupKey: string): 'solid' | 'outline' | 'clear' {
    if (this.activeGroup === groupKey) {
      return 'solid';
    }
    return 'outline';
  }

  /**
   * Compter les statuts sélectionnés pour un groupe spécifique
   */
  getGroupStatutsCount(groupKey: string): number {
    if (groupKey === 'all') return 0;
    if (groupKey === 'custom') return this.customStatuts.length;
    
    const group = FILTER_GROUPS[groupKey];
    return group ? group.statuts.length : 0;
  }

  /**
   * Vérifier si le mode custom est actif
   */
  get isCustomMode(): boolean {
    return this.activeGroup === 'custom';
  }

  /**
   * Obtenir le texte pour le bouton de statuts
   */
  get statutButtonText(): string {
    if (this.selectedStatutsCount === 0) {
      return 'Filtrer par statut';
    }
    if (this.selectedStatutsCount === 1) {
      return '1 statut sélectionné';
    }
    return `${this.selectedStatutsCount} statuts sélectionnés`;
  }

  /**
   * Obtenir le nombre total de statuts disponibles
   */
  get totalStatutsCount(): number {
    return this.availableStatuts.length;
  }

  /**
   * Vérifier si tous les statuts sont sélectionnés
   */
  get areAllStatutsSelected(): boolean {
    return this.customStatuts.length === this.totalStatutsCount;
  }

  /**
   * Sélectionner/désélectionner tous les statuts
   */
  toggleAllStatuts(): void {
    if (this.areAllStatutsSelected) {
      this.filterService.setCustomStatuts([]);
    } else {
      const allStatuts = this.availableStatuts.map(s => s.value);
      this.filterService.setCustomStatuts(allStatuts);
    }
  }
}