import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatutCandidature } from 'src/app/features/candidatures/models/candidature.model';
import { FilterOptions, FilterState, FilterGroup, FILTER_GROUPS, STATUTS_CANDIDATURE } from 'src/app/features/candidatures/models/filter.model';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  
  // États internes du service
  private activeGroupSubject = new BehaviorSubject<string>('all');
  private customStatutsSubject = new BehaviorSubject<StatutCandidature[]>([]);
  private searchTermSubject = new BehaviorSubject<string>('');
  private sortByDateSubject = new BehaviorSubject<'asc' | 'desc'>('desc');

  // Observables publics
  public activeGroup$ = this.activeGroupSubject.asObservable();
  public customStatuts$ = this.customStatutsSubject.asObservable();
  public searchTerm$ = this.searchTermSubject.asObservable();
  public sortByDate$ = this.sortByDateSubject.asObservable();

  // État global combiné
  public filterState$: Observable<FilterState> = combineLatest([
    this.activeGroup$,
    this.customStatuts$,
    this.searchTerm$
  ]).pipe(
    map(([activeGroup, customStatuts, searchTerm]) => ({
      activeGroup,
      customStatuts,
      searchTerm,
      hasActiveFilters: this.hasActiveFilters(activeGroup, customStatuts, searchTerm),
      resultsCount: 0 // Sera mis à jour par le composant
    }))
  );

  // Options de filtrage pour le service Candidature
  public filterOptions$: Observable<FilterOptions> = combineLatest([
    this.activeGroup$,
    this.customStatuts$,
    this.searchTerm$,
    this.sortByDate$
  ]).pipe(
    map(([activeGroup, customStatuts, searchTerm, sortByDate]) => {
      const effectiveStatuts = this.getEffectiveStatuts(activeGroup, customStatuts);
      
      return {
        selectedGroup: activeGroup !== 'all' ? activeGroup : undefined,
        selectedStatuts: effectiveStatuts,
        searchText: searchTerm || undefined,
        sortByDate
      };
    })
  );

  constructor() { }

  /**
   * Sélectionner un groupe de filtres rapides
   */
  setActiveGroup(groupKey: string): void {
    if (FILTER_GROUPS[groupKey]) {
      this.activeGroupSubject.next(groupKey);
      
      // Si on sélectionne un groupe prédéfini, on vide les statuts personnalisés
      if (groupKey !== 'custom') {
        this.customStatutsSubject.next([]);
      }
    }
  }

  /**
   * Définir des statuts personnalisés (mode sélection individuelle)
   */
  setCustomStatuts(statuts: StatutCandidature[]): void {
    this.customStatutsSubject.next([...statuts]);
    
    // Basculer en mode custom si des statuts sont sélectionnés
    if (statuts.length > 0) {
      this.activeGroupSubject.next('custom');
    } else {
      // Si aucun statut custom, revenir à "Toutes"
      this.activeGroupSubject.next('all');
    }
  }

  /**
   * Ajouter/retirer un statut de la sélection personnalisée
   */
  toggleCustomStatut(statut: StatutCandidature): void {
    const currentStatuts = this.customStatutsSubject.value;
    const index = currentStatuts.indexOf(statut);
    
    if (index > -1) {
      // Retirer le statut
      const newStatuts = currentStatuts.filter(s => s !== statut);
      this.setCustomStatuts(newStatuts);
    } else {
      // Ajouter le statut
      const newStatuts = [...currentStatuts, statut];
      this.setCustomStatuts(newStatuts);
    }
  }

  /**
   * Définir le terme de recherche
   */
  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term.trim());
  }

  /**
   * Définir l'ordre de tri par date
   */
  setSortByDate(sort: 'asc' | 'desc'): void {
    this.sortByDateSubject.next(sort);
  }

  /**
   * Réinitialiser tous les filtres
   */
  resetAllFilters(): void {
    this.activeGroupSubject.next('all');
    this.customStatutsSubject.next([]);
    this.searchTermSubject.next('');
    // Le tri n'est pas réinitialisé car c'est une préférence
  }

  /**
   * Obtenir les groupes de filtres disponibles
   */
  getFilterGroups(): FilterGroup[] {
    return Object.values(FILTER_GROUPS);
  }

  /**
   * Obtenir tous les statuts disponibles avec leurs labels
   */
  getAvailableStatuts(): { value: StatutCandidature; label: string }[] {
    return STATUTS_CANDIDATURE;
  }

  /**
   * Vérifier si un statut est sélectionné dans les filtres personnalisés
   */
  isStatutSelected(statut: StatutCandidature): boolean {
    return this.customStatutsSubject.value.includes(statut);
  }

  /**
   * Obtenir le libellé d'un statut
   */
  getStatutLabel(statut: StatutCandidature): string {
    const statutObj = STATUTS_CANDIDATURE.find(s => s.value === statut);
    return statutObj ? statutObj.label : statut;
  }

  /**
   * Obtenir les statuts effectifs selon le groupe actif et les sélections custom
   */
  private getEffectiveStatuts(activeGroup: string, customStatuts: StatutCandidature[]): StatutCandidature[] {
    if (activeGroup === 'all') {
      return []; // Pas de filtre = toutes les candidatures
    }
    
    if (activeGroup === 'custom') {
      return customStatuts;
    }
    
    const group = FILTER_GROUPS[activeGroup];
    return group ? group.statuts : [];
  }

  /**
   * Vérifier s'il y a des filtres actifs
   */
  private hasActiveFilters(activeGroup: string, customStatuts: StatutCandidature[], searchTerm: string): boolean {
    return activeGroup !== 'all' || 
           customStatuts.length > 0 || 
           searchTerm.trim() !== '';
  }

  /**
   * Obtenir les valeurs actuelles (utile pour les composants)
   */
  getCurrentValues(): {
    activeGroup: string;
    customStatuts: StatutCandidature[];
    searchTerm: string;
    sortByDate: 'asc' | 'desc';
  } {
    return {
      activeGroup: this.activeGroupSubject.value,
      customStatuts: this.customStatutsSubject.value,
      searchTerm: this.searchTermSubject.value,
      sortByDate: this.sortByDateSubject.value
    };
  }

  /**
   * Obtenir le nombre de statuts sélectionnés (pour badge indicateur)
   */
  getSelectedStatutsCount(): Observable<number> {
    return combineLatest([
      this.activeGroup$,
      this.customStatuts$
    ]).pipe(
      map(([activeGroup, customStatuts]) => {
        if (activeGroup === 'all') return 0;
        if (activeGroup === 'custom') return customStatuts.length;
        
        const group = FILTER_GROUPS[activeGroup];
        return group ? group.statuts.length : 0;
      })
    );
  }
}