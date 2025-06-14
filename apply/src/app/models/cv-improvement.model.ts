export interface CvImprovement {
  id: string;
  type: 'orthographe' | 'reformulation' | 'mots-cles' | 'structure';
  section: string;
  titre: string;
  textOriginal: string;
  textAmeliore: string;
  explication: string;
  impact: 'faible' | 'moyen' | 'fort';
  accepted: boolean;
}

export interface CvImprovementSummary {
  totalSuggestions: number;
  criticalIssues: number;
  enhancementSuggestions: number;
  atsKeywords: string[];
}

export interface CvImprovementResponse {
  success: boolean;
  improvements: CvImprovement[];
  summary: CvImprovementSummary;
}

export interface CvImprovementResult {
  originalText: string;
  improvedText: string;
  appliedImprovements: CvImprovement[];
}