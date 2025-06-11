import { StatutCandidature } from 'src/app/features/candidatures/models/candidature.model';;

export interface FilterGroup {
  key: string;
  label: string;
  statuts: StatutCandidature[];
  count?: number;
}

export interface FilterOptions {
  selectedGroup?: string;
  selectedStatuts: StatutCandidature[];
  searchText?: string;
  sortByDate: 'asc' | 'desc';
}

export interface FilterState {
  activeGroup: string;
  customStatuts: StatutCandidature[];
  searchTerm: string;
  hasActiveFilters: boolean;
  resultsCount: number;
}

export const FILTER_GROUPS: { [key: string]: FilterGroup } = {
  all: {
    key: 'all',
    label: 'Toutes',
    statuts: []
  },
  active: {
    key: 'active',
    label: 'Actives',
    statuts: ['envoyee', 'en_cours_rh', 'entretien_planifie', 'test_technique', 'entretien_final', 'offre_recue']
  },
  pending: {
    key: 'pending',
    label: 'En attente',
    statuts: ['brouillon', 'standby']
  },
  finalized: {
    key: 'finalized',
    label: 'Finalisées',
    statuts: ['acceptee', 'refusee_candidat', 'refusee_entreprise', 'archivee']
  }
};

export const STATUTS_CANDIDATURE: { value: StatutCandidature; label: string }[] = [
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