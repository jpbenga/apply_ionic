import { Timestamp } from '@angular/fire/firestore';
import { Competence } from 'src/app/models/competence.model';
import { CvTheme } from 'src/app/models/cv-template.model';
import { Experience } from 'src/app/models/experience.model';
import { Formation } from 'src/app/models/formation.model';

export type StatutCandidature = 
  | 'brouillon'
  | 'envoyee'
  | 'en_cours_rh'
  | 'entretien_planifie'
  | 'test_technique'
  | 'entretien_final'
  | 'offre_recue'
  | 'acceptee'
  | 'refusee_candidat'
  | 'refusee_entreprise'
  | 'archivee'
  | 'standby';

export type TypeSuivi = 
  | 'contact' 
  | 'entretien' 
  | 'test' 
  | 'feedback' 
  | 'relance' 
  | 'autre'
  | 'email_envoye'
  | 'email_recu'
  | 'appel_effectue'
  | 'appel_recu'
  | 'entretien_planifie'
  | 'entretien_effectue'
  | 'test_technique_recu'
  | 'test_technique_complete';

export interface SuiviCandidature {
  id: string;
  date: Timestamp;
  type: TypeSuivi;
  description: string;
  commentaire?: string;
  notes?: string;
}

export interface ContactRecruteur {
  nom?: string;
  email?: string;
  telephone?: string;
  linkedin?: string;
}

export interface Candidature {
  id?: string;
  userId: string;
  
  // Informations sur l'entreprise et le poste
  entreprise: string;
  intitulePoste: string;
  poste?: string;
  lieuTravail?: string;
  typeContrat?: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Interim' | 'Autre';
  salaireSouhaite?: number;
  descriptionPoste?: string;
  offreTexteComplet?: string;
  
  // Informations sur la candidature
  statut: StatutCandidature;
  dateCandidature: Timestamp;
  sourceOffre?: 'LinkedIn' | 'Indeed' | 'Pole Emploi' | 'Site entreprise' | 'Recommandation' | 'Autre';
  urlOffre?: string;
  
  // CV et documents
  cvOriginalUrl?: string;
  cvOriginalNom?: string;
  cvPersonnaliseUrl?: string;
  cvPersonnaliseNom?: string;
  cvTexteExtrait?: string;
  lettreMotivationUrl?: string;
  lettreMotivationNom?: string;
  lettreMotivationGeneree?: string;
  
  // Analyse et optimisation
  analyseATS?: string;
  
  // Contact et suivi
  contactRecruteur?: ContactRecruteur;
  contacts?: ContactRecruteur[];
  suivi?: SuiviCandidature[];
  
  // Informations complémentaires
  notes?: string;
  notesPersonnelles?: string;
  salairePropose?: number;
  dateReponseAttendue?: Timestamp;

  cvDataSnapshot?: {
    experiences: Experience[];
    formations: Formation[];
    competences: Competence[];
  };
  cvTemplateId?: string;
  cvTheme?: CvTheme;
  
  // Timestamps
  createdAt: any;
  updatedAt: any;
}