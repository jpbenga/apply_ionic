export interface CvImprovement {
    id: string;
    type: 'orthographe' | 'reformulation' | 'mots-cles' | 'structure';
    section: string; // "Expérience 1", "Formation 2", "Compétences", etc.
    titre: string;
    textOriginal: string;
    textAmeliore: string;
    explication: string;
    impact: 'faible' | 'moyen' | 'fort'; // Importance de la modification
    accepted?: boolean;
  }
  
  export interface CvImprovementResponse {
    success: boolean;
    improvements: CvImprovement[];
    summary: {
      totalSuggestions: number;
      criticalIssues: number; // Fautes graves, problèmes majeurs
      enhancementSuggestions: number; // Améliorations optionnelles
      atsKeywords: string[]; // Mots-clés manquants pour l'ATS
    };
  }
  
  export interface CvImprovementResult {
    originalText: string;
    improvedText: string;
    appliedImprovements: CvImprovement[];
  }