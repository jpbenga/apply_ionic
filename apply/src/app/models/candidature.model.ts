// src/app/models/candidature.model.ts
export interface Candidature {
    id?: string;
    userId: string;
    entreprise: string;
    poste: string;
    description: string;
    datePostulation: Date;
    status: 'pending' | 'interview' | 'rejected' | 'accepted';
    suivi: SuiviCandidature[];
    offreOriginal: string; // Texte original de l'offre
    cvGenere?: string;
    lettreGenere?: string;
    notes?: string;
  }
  
  export interface SuiviCandidature {
    id?: string;
    date: Date;
    type: 'email' | 'appel' | 'entretien' | 'test' | 'autre';
    notes: string;
  }