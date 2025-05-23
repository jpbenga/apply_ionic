// src/app/models/candidature.model.ts

export type TypeSuivi = 
  'email_envoye' | 
  'email_recu' | 
  'appel_effectue' | 
  'appel_recu' | 
  'entretien_planifie' | 
  'entretien_effectue' | 
  'test_technique_recu' | 
  'test_technique_complete' | 
  'relance' | 
  'autre';

export interface SuiviCandidature {
  id?: string;
  date: any; 
  type: TypeSuivi;
  notes: string;
}

export type StatutCandidature = 
  'brouillon' | 
  'envoyee' | 
  'en_cours_rh' | 
  'entretien_planifie' | 
  'test_technique' | 
  'entretien_final' | 
  'offre_recue' | 
  'acceptee' | 
  'refusee_candidat' | 
  'refusee_entreprise' | 
  'archivee' | 
  'standby';

export interface Candidature {
  id?: string;
  userId: string;
  poste: string;
  entreprise: string;
  lieu?: string;
  typeContrat?: string;
  urlOffre?: string;
  offreTexteComplet: string;
  cvOriginalNom?: string;
  cvOriginalUrl?: string;
  cvTexteExtrait?: string;
  analyseATS?: string;
  lettreMotivationGeneree?: string;
  dateCandidature: any; 
  statut: StatutCandidature; // Utilise le type StatutCandidature ici
  sourceCandidature?: string;
  notesPersonnelles?: string;
  contacts?: { nom?: string; email?: string; telephone?: string; role?: string }[];
  suivi?: SuiviCandidature[];
  createdAt: any;
  updatedAt?: any;
}