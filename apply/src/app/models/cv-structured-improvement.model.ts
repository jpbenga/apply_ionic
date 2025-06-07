import { Experience } from './experience.model';
import { Formation } from './formation.model';
import { Competence } from './competence.model';

// Types d'améliorations pour données structurées
export type StructuredImprovementType = 'orthographe' | 'reformulation' | 'mots-cles' | 'structure' | 'ajout';

// Amélioration d'une expérience
export interface ExperienceImprovement {
  id: string;
  type: StructuredImprovementType;
  field: keyof Experience; // 'poste', 'entreprise', 'description', etc.
  titre: string;
  originalValue: any;
  improvedValue: any;
  explication: string;
  impact: 'faible' | 'moyen' | 'fort';
  accepted?: boolean;
}

// Amélioration d'une formation
export interface FormationImprovement {
  id: string;
  type: StructuredImprovementType;
  field: keyof Formation; // 'diplome', 'etablissement', 'description', etc.
  titre: string;
  originalValue: any;
  improvedValue: any;
  explication: string;
  impact: 'faible' | 'moyen' | 'fort';
  accepted?: boolean;
}

// Amélioration d'une compétence
export interface CompetenceImprovement {
  id: string;
  type: StructuredImprovementType;
  field: keyof Competence; // 'nom', 'categorie'
  titre: string;
  originalValue: any;
  improvedValue: any;
  explication: string;
  impact: 'faible' | 'moyen' | 'fort';
  accepted?: boolean;
}

// Amélioration globale pour une section
export interface SectionImprovement {
  id: string;
  sectionType: 'experience' | 'formation' | 'competence';
  itemIndex: number; // Index de l'élément dans le tableau
  itemId?: string; // ID de l'élément si disponible
  itemTitle: string; // Titre pour affichage (ex: "Développeur chez Google")
  improvements: (ExperienceImprovement | FormationImprovement | CompetenceImprovement)[];
}

// Nouvelles compétences suggérées (mots-clés ATS)
export interface SuggestedCompetence {
  id: string;
  nom: string;
  categorie: string;
  raison: string; // Pourquoi cette compétence est suggérée
  impact: 'faible' | 'moyen' | 'fort';
  accepted?: boolean;
}

// Réponse complète pour CV structuré
export interface StructuredCvImprovementResponse {
  success: boolean;
  improvements: {
    experiences: SectionImprovement[];
    formations: SectionImprovement[];
    competences: SectionImprovement[];
    suggestedCompetences: SuggestedCompetence[]; // Nouvelles compétences à ajouter
  };
  summary: {
    totalSuggestions: number;
    criticalIssues: number;
    enhancementSuggestions: number;
    newCompetencesSuggested: number;
    atsKeywordsIntegrated: number;
  };
}

// Résultat après application des améliorations
export interface StructuredCvImprovementResult {
  originalData: {
    experiences: Experience[];
    formations: Formation[];
    competences: Competence[];
  };
  improvedData: {
    experiences: Experience[];
    formations: Formation[];
    competences: Competence[];
  };
  appliedImprovements: {
    experiences: SectionImprovement[];
    formations: SectionImprovement[];
    competences: SectionImprovement[];
    addedCompetences: SuggestedCompetence[];
  };
  changesCount: {
    experiences: number;
    formations: number;
    competences: number;
    total: number;
  };
}

// Helper pour identifier le type d'amélioration
export function isExperienceImprovement(improvement: any): improvement is ExperienceImprovement {
  return improvement && typeof improvement.field === 'string';
}

export function isFormationImprovement(improvement: any): improvement is FormationImprovement {
  return improvement && typeof improvement.field === 'string';
}

export function isCompetenceImprovement(improvement: any): improvement is CompetenceImprovement {
  return improvement && typeof improvement.field === 'string';
}